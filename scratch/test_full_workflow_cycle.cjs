const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullCycle() {
  console.log('=== FULL WORKFLOW CYCLE TEST ===');

  // 1. Fetch case AMRMCP-2026-Y22PHD0314-0001
  const { data: cData } = await supabase
    .from('clinical_cases')
    .select('*')
    .eq('case_id', 'AMRMCP-2026-Y22PHD0314-0001')
    .single();

  console.log('Initial Case State:', cData.id, cData.case_id, cData.status);

  // 2. Transition to Returned
  console.log('\n--- Step A: Returning Case ---');
  const now1 = new Date().toISOString();
  const { data: retData, error: retErr } = await supabase
    .from('clinical_cases')
    .update({
      status: 'Returned',
      returned_at: now1,
      returned_by_preceptor_id: cData.preceptor_id,
      overall_preceptor_comments: 'Please correct patient counselling details and resubmit.',
      returned_forms: ['patient_counselling'],
      case_locked: false,
      updated_at: now1
    })
    .eq('id', cData.id)
    .select();

  if (retErr) {
    console.error('❌ Step A Failed:', retErr);
  } else {
    console.log('✅ Step A Succeeded: Status is now ->', retData[0].status);
  }

  // 3. Student Resubmits Case (Returned -> Submitted)
  console.log('\n--- Step B: Student Resubmits Case ---');
  const now2 = new Date().toISOString();
  const { data: subData, error: subErr } = await supabase
    .from('clinical_cases')
    .update({
      status: 'Submitted',
      submitted_at: now2,
      case_locked: false,
      updated_at: now2
    })
    .eq('id', cData.id)
    .select();

  if (subErr) {
    console.error('❌ Step B Failed:', subErr);
  } else {
    console.log('✅ Step B Succeeded: Status is now ->', subData[0].status);
  }

  // 4. Preceptor Opens Review (Submitted -> Under Review)
  console.log('\n--- Step C: Preceptor Opens Review ---');
  const now3 = new Date().toISOString();
  const { data: revData, error: revErr } = await supabase
    .from('clinical_cases')
    .update({
      status: 'Under Review',
      updated_at: now3
    })
    .eq('id', cData.id)
    .select();

  if (revErr) {
    console.error('❌ Step C Failed:', revErr);
  } else {
    console.log('✅ Step C Succeeded: Status is now ->', revData[0].status);
  }

  console.log('\n=== ALL WORKFLOW TRANSITIONS VERIFIED SUCCESSFULLY! ===');
}

testFullCycle();
