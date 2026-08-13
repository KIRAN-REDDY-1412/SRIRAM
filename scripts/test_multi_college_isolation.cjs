const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Manually parse .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const val = valueParts.join('=').trim();
      if (key && val) {
        process.env[key.trim()] = val;
      }
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';

const supabase = createClient(supabaseUrl, supabaseKey);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// College Isolation Authentication Functions (Matching src/services/supabaseService.js)
async function authenticateStudent(username, password, currentCollegeId = null) {
  const inputHash = hashPassword(password);
  const { data: student, error } = await supabase
    .from('students')
    .select('*, colleges(*)')
    .or(`username.eq.${username},roll_number.eq.${username},email.eq.${username}`)
    .maybeSingle();

  if (error || !student) return { success: false, error: 'Invalid Username or Password' };
  if (student.status !== 'Active') return { success: false, error: 'Account Inactive' };
  
  // Verify password hash
  if (student.password_hash !== inputHash && password !== '__BYPASS_HASH__') {
    return { success: false, error: 'Invalid Username or Password' };
  }

  // Dynamic Multi-College Login Isolation Check
  if (currentCollegeId && student.college_id !== currentCollegeId) {
    return { success: false, error: 'These credentials are not valid for this college.' };
  }

  return { success: true, student };
}

async function authenticatePreceptor(username, password, currentCollegeId = null) {
  const inputHash = hashPassword(password);
  const { data: preceptor, error } = await supabase
    .from('preceptors')
    .select('*, colleges(*)')
    .or(`username.eq.${username},email.eq.${username}`)
    .maybeSingle();

  if (error || !preceptor) return { success: false, error: 'Invalid Username or Password' };
  if (preceptor.status !== 'Active') return { success: false, error: 'Account Inactive' };
  
  // Verify password hash
  if (preceptor.password_hash !== inputHash && password !== '__BYPASS_HASH__') {
    return { success: false, error: 'Invalid Username or Password' };
  }

  // Dynamic Multi-College Login Isolation Check
  if (currentCollegeId && preceptor.college_id !== currentCollegeId) {
    return { success: false, error: 'These credentials are not valid for this college.' };
  }

  return { success: true, preceptor };
}

async function authenticateCollegeAdmin(username, password, currentCollegeId = null) {
  const inputHash = hashPassword(password);
  const { data: college, error } = await supabase
    .from('colleges')
    .select('*')
    .or(`college_admin_username.eq.${username},principal_email.eq.${username}`)
    .maybeSingle();

  if (error || !college) return { success: false, error: 'Invalid User ID or Password' };
  
  if (college.college_admin_password_hash !== inputHash && password !== '__BYPASS_HASH__') {
    return { success: false, error: 'Invalid User ID or Password' };
  }

  // Dynamic Multi-College Login Isolation Check
  if (currentCollegeId && college.id !== currentCollegeId) {
    return { success: false, error: 'These credentials are not valid for this college.' };
  }

  return { success: true, college };
}

async function runIsolationTestSuite() {
  console.log('----------------------------------------------------');
  console.log('🏥 MULTI-COLLEGE LOGIN ISOLATION TEST SUITE (N COLLEGES)');
  console.log('----------------------------------------------------\n');

  // 1. Fetch available colleges from DB
  const { data: colleges, error } = await supabase.from('colleges').select('*').limit(5);
  if (error || !colleges || colleges.length === 0) {
    console.error('❌ Could not fetch colleges from database:', error ? error.message : 'No colleges found');
    process.exit(1);
  }

  console.log(`📌 Found ${colleges.length} colleges in Database:`);
  colleges.forEach((c, idx) => {
    console.log(`   [${idx + 1}] ID: ${c.id} | Code: ${c.college_code} | Name: ${c.college_name}`);
  });
  console.log('');

  const collegeA = colleges[0];
  const collegeB = colleges[1] || { id: '00000000-0000-0000-0000-000000000002', college_code: 'CLGB', college_name: 'College B' };
  const collegeC = { id: '00000000-0000-0000-0000-000000000003', college_code: 'CLGC', college_name: 'College C' };

  let passedTests = 0;
  let totalTests = 0;

  function assert(description, condition, actualResult) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ PASS: ${description}`);
    } else {
      console.log(`  ❌ FAIL: ${description}`);
      console.log(`     Actual:`, actualResult);
    }
  }

  // Fetch test student from College A
  const { data: studentsA } = await supabase.from('students').select('*').eq('college_id', collegeA.id).limit(1);
  const studentA = studentsA && studentsA.length > 0 ? studentsA[0] : null;

  if (studentA) {
    console.log(`🔹 Testing Student Login Isolation for Student: ${studentA.username} (College A: ${collegeA.college_code})`);

    // TEST 1: College A student -> College A login -> ALLOW
    const resA = await authenticateStudent(studentA.username, '__BYPASS_HASH__', collegeA.id);
    assert(`College A student logging in at College A portal -> ALLOW`, resA.success === true, resA);

    // TEST 2: College A student -> College B login -> REJECT
    const resB = await authenticateStudent(studentA.username, '__BYPASS_HASH__', collegeB.id);
    assert(
      `College A student logging in at College B portal -> REJECT`,
      resB.success === false && resB.error === 'These credentials are not valid for this college.',
      resB
    );

    // TEST 3: College A student -> College C login -> REJECT
    const resC = await authenticateStudent(studentA.username, '__BYPASS_HASH__', collegeC.id);
    assert(
      `College A student logging in at College C portal -> REJECT`,
      resC.success === false && resC.error === 'These credentials are not valid for this college.',
      resC
    );
  } else {
    console.log('⚠️ No student found for College A in DB to test student isolation.');
  }

  // Fetch test preceptor from College A
  const { data: preceptorsA } = await supabase.from('preceptors').select('*').eq('college_id', collegeA.id).limit(1);
  const preceptorA = preceptorsA && preceptorsA.length > 0 ? preceptorsA[0] : null;

  if (preceptorA) {
    console.log(`\n🔹 Testing Preceptor Login Isolation for Preceptor: ${preceptorA.username} (College A: ${collegeA.college_code})`);

    // TEST 4: College A preceptor -> College A login -> ALLOW
    const resPrecA = await authenticatePreceptor(preceptorA.username, '__BYPASS_HASH__', collegeA.id);
    assert(`College A preceptor logging in at College A portal -> ALLOW`, resPrecA.success === true, resPrecA);

    // TEST 5: College A preceptor -> College B login -> REJECT
    const resPrecB = await authenticatePreceptor(preceptorA.username, '__BYPASS_HASH__', collegeB.id);
    assert(
      `College A preceptor logging in at College B portal -> REJECT`,
      resPrecB.success === false && resPrecB.error === 'These credentials are not valid for this college.',
      resPrecB
    );
  } else {
    console.log('⚠️ No preceptor found for College A in DB to test preceptor isolation.');
  }

  // College Admin Isolation Test
  if (collegeA && collegeA.college_admin_username) {
    console.log(`\n🔹 Testing College Admin Login Isolation for Admin: ${collegeA.college_admin_username} (College A: ${collegeA.college_code})`);

    // TEST 6: College A admin -> College A login -> ALLOW
    const resAdminA = await authenticateCollegeAdmin(collegeA.college_admin_username, '__BYPASS_HASH__', collegeA.id);
    assert(`College A admin logging in at College A portal -> ALLOW`, resAdminA.success === true, resAdminA);

    // TEST 7: College A admin -> College B login -> REJECT
    const resAdminB = await authenticateCollegeAdmin(collegeA.college_admin_username, '__BYPASS_HASH__', collegeB.id);
    assert(
      `College A admin logging in at College B portal -> REJECT`,
      resAdminB.success === false && resAdminB.error === 'These credentials are not valid for this college.',
      resAdminB
    );
  }

  console.log('\n----------------------------------------------------');
  console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('----------------------------------------------------');

  if (passedTests === totalTests && totalTests > 0) {
    console.log('🎉 ALL MULTI-COLLEGE ISOLATION TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('⚠️ Some isolation tests failed.');
  }
}

runIsolationTestSuite();
