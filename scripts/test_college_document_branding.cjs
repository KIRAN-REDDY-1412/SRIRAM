const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

async function runDocumentBrandingTestSuite() {
  console.log('----------------------------------------------------');
  console.log('📄 COLLEGE-SPECIFIC PDF & PPT BRANDING TEST SUITE');
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

  // TEST 1: Fetch document branding settings for College A
  console.log(`🔹 Testing Document Branding Resolution for College A (${collegeA.college_code})...`);
  const { data: brandingA, error: errA } = await supabase
    .from('document_branding_settings')
    .select('*')
    .eq('college_id', collegeA.id)
    .maybeSingle();

  assert(`Fetched document branding for College A without error`, !errA, errA);
  console.log(`   College A settings present in DB:`, brandingA ? 'YES' : 'NO (will use dynamic fallback)');

  // TEST 2: Save custom document branding for College A
  console.log(`\n🔹 Testing Custom Branding Save for College A (${collegeA.college_code})...`);
  const customPayloadA = {
    college_id: collegeA.id,
    watermark_text_line1: `${collegeA.college_code} CONFIDENTIAL`,
    watermark_text_line2: collegeA.college_name,
    watermark_opacity: 15,
    font_family: 'Times New Roman',
    title_font_size: '18pt',
    primary_color: '#0f172a',
    footer_left_text: collegeA.college_name,
    footer_center_text: 'Official Approved Clinical Document'
  };

  let savedA = null;
  if (brandingA && brandingA.id) {
    const { data, error } = await supabase
      .from('document_branding_settings')
      .update(customPayloadA)
      .eq('id', brandingA.id)
      .select();
    if (error) console.error('   Update error:', error.message);
    savedA = data ? data[0] : null;
  } else {
    const { data, error } = await supabase
      .from('document_branding_settings')
      .insert([customPayloadA])
      .select();
    if (error) console.error('   Insert error:', error.message);
    savedA = data ? data[0] : null;
  }

  assert(`Successfully saved custom branding for College A`, savedA && savedA.college_id === collegeA.id, savedA || 'Saved Data Null');

  // TEST 3: Verify College B document branding is isolated from College A
  console.log(`\n🔹 Testing Multi-Tenant Isolation for College B (${collegeB.college_code})...`);
  const { data: brandingB } = await supabase
    .from('document_branding_settings')
    .select('*')
    .eq('college_id', collegeB.id)
    .maybeSingle();

  assert(
    `College B branding does NOT inherit College A's custom watermark`,
    !brandingB || brandingB.watermark_text_line1 !== customPayloadA.watermark_text_line1,
    brandingB
  );

  console.log('\n----------------------------------------------------');
  console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('----------------------------------------------------');

  if (passedTests === totalTests && totalTests > 0) {
    console.log('🎉 ALL DOCUMENT BRANDING TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('⚠️ Some document branding tests failed.');
  }
}

runDocumentBrandingTestSuite();
