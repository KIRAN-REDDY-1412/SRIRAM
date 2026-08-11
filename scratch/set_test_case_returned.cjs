const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setReturned() {
  console.log('=== SETTING CASE TO RETURNED IN DB ===');
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('clinical_cases')
    .update({
      status: 'Returned',
      returned_at: now,
      overall_preceptor_comments: 'Please correct patient profile details and resubmit.',
      returned_forms: ['patient_profile'],
      case_locked: false,
      updated_at: now
    })
    .eq('case_id', 'AMRMCP-2026-Y22PHD0314-0001')
    .select();

  if (error) {
    console.error('Error setting returned:', error);
  } else {
    console.log('Successfully set case to Returned:', data[0].case_id, data[0].status);
  }
}

setReturned();
