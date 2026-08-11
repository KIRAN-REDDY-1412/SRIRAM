const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testReturnCase() {
  console.log('=== 1. FETCHING SUBMITTED CASE ===');
  const { data: cases, error } = await supabase
    .from('clinical_cases')
    .select('*')
    .eq('status', 'Submitted')
    .limit(1);

  if (error || !cases || cases.length === 0) {
    console.log('No Submitted case found. Checking Under Review cases...');
    const { data: urCases } = await supabase.from('clinical_cases').select('*').limit(1);
    console.log('Sample case:', urCases);
    return;
  }

  const testCase = cases[0];
  console.log('Test case to return:', testCase.id, testCase.case_id, testCase.status);

  const now = new Date().toISOString();
  const preceptorId = testCase.preceptor_id || 'd982006b-5d8e-4d2c-a8fb-cebe2c98ecf1';
  const returnedForms = ['patient_profile'];
  const comments = 'Test return comments for corrections';

  const updatePayload = {
    status: 'Returned',
    returned_at: now,
    returned_by_preceptor_id: preceptorId,
    overall_preceptor_comments: comments.trim(),
    returned_forms: returnedForms,
    case_locked: false,
    updated_at: now
  };

  console.log('=== 2. UPDATING CLINICAL_CASES WITH RETURN PAYLOAD ===');
  const { data: updated, error: updateErr } = await supabase
    .from('clinical_cases')
    .update(updatePayload)
    .eq('id', testCase.id)
    .select();

  if (updateErr) {
    console.error('❌ Update failed with error:', updateErr);
  } else {
    console.log('✅ Update succeeded:', updated);
  }

  console.log('=== 3. VERIFYING CASE STATUS IN SUPABASE ===');
  const { data: verify } = await supabase
    .from('clinical_cases')
    .select('id, case_id, status, returned_at, overall_preceptor_comments')
    .eq('id', testCase.id)
    .single();

  console.log('Verified case state in DB:', verify);
}

testReturnCase();
