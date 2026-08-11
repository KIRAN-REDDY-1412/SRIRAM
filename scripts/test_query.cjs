const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uvvzhrvrqtqwyhlptvnx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI'
);

async function testAll() {
  const p = await supabase.from('patient_profiles').select('id, clinical_case_id, status').limit(1);
  const c = await supabase.from('patient_counselling').select('id, clinical_case_id, status').limit(1);
  const i = await supabase.from('pharmacist_interventions').select('id, clinical_case_id, status').limit(1);
  const d = await supabase.from('drug_information_requests').select('id, clinical_case_id, status').limit(1);
  const a = await supabase.from('adr_reports').select('id, clinical_case_id, approval_status').limit(1);

  console.log('patient_profiles status query:', p.error ? p.error.message : 'OK');
  console.log('patient_counselling status query:', c.error ? c.error.message : 'OK');
  console.log('pharmacist_interventions status query:', i.error ? i.error.message : 'OK');
  console.log('drug_information_requests status query:', d.error ? d.error.message : 'OK');
  console.log('adr_reports approval_status query:', a.error ? a.error.message : 'OK');
}

testAll().catch(console.error);
