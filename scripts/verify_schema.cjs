/**
 * Schema Verification Script
 * Confirms: 
 *   1. clinical_cases columns exist
 *   2. create_clinical_case RPC exists and works
 */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uvvzhrvrqtqwyhlptvnx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI'
);

async function verify() {
  console.log('=== Schema Verification ===\n');

  // 1. Check profile_completed, counselling_completed columns
  console.log('1. Checking clinical_cases columns...');
  const { data, error } = await supabase
    .from('clinical_cases')
    .select('id, case_id, profile_completed, counselling_completed, case_number, roll_number')
    .limit(1);

  if (error) {
    console.log('   Missing columns! Error:', error.message);
  } else {
    console.log('   OK: profile_completed, counselling_completed, case_number, roll_number all exist');
  }

  // 2. Check create_clinical_case RPC
  console.log('\n2. Checking create_clinical_case RPC...');
  
  // Get a real student and college from DB
  const { data: students } = await supabase.from('students').select('id, roll_number, college_id').limit(1);
  if (!students || students.length === 0) {
    console.log('   No students in DB yet - RPC check skipped (will work when students exist)');
    return;
  }

  const s = students[0];
  const { data: rpcResult, error: rpcErr } = await supabase.rpc('create_clinical_case', {
    p_student_id: s.id,
    p_college_id: s.college_id,
    p_preceptor_id: null,
    p_hospital_name: 'TEST HOSPITAL - DELETE ME',
    p_department: 'General Medicine',
    p_ward_unit: 'Ward A',
    p_ip_op_type: 'IP',
    p_date_of_admission: new Date().toISOString().split('T')[0],
    p_academic_year: '2026-2027',
    p_status: 'Draft'
  });

  if (rpcErr) {
    console.log('   RPC Error:', rpcErr.message);
    if (rpcErr.code === '42883') {
      console.log('   >>> RPC function create_clinical_case does NOT exist in DB yet!');
      console.log('   >>> You need to run the schema.sql migrations on Supabase.');
    }
  } else if (rpcResult && rpcResult.success) {
    console.log('   RPC works! Generated Case ID:', rpcResult.case_id);
    console.log('   Cleaning up test case...');
    await supabase.from('clinical_cases').delete().eq('id', rpcResult.id);
    console.log('   Test case deleted.');
  } else {
    console.log('   RPC responded but failed:', rpcResult);
  }

  console.log('\n=== Verification Complete ===');
}

verify().catch(err => console.error('Error:', err));
