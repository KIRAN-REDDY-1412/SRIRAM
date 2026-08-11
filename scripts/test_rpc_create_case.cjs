const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uvvzhrvrqtqwyhlptvnx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI'
);

async function testRpc() {
  console.log('Testing create_clinical_case RPC for student K.Nikhil...');
  const { data, error } = await supabase.rpc('create_clinical_case', {
    p_college_id: '74a8d70b-a41d-4075-9dc2-63240a5f7069',
    p_student_id: '14d6cd0e-cf90-475b-98fd-12e10f3edf12',
    p_preceptor_id: 'd982006b-5d8e-4d2c-a8fb-cebe2c98ecf1',
    p_hospital_name: 'Lalitha Superspecialities Hospital',
    p_department: 'Cardiology',
    p_ward_unit: 'Female Medical Ward',
    p_ip_op_type: 'IP',
    p_date_of_admission: '2026-08-11',
    p_academic_year: '2026–2027',
    p_status: 'Draft'
  });

  console.log('RPC Result:', { data, error });

  if (data && data.success && data.id) {
    console.log('Successfully created test case:', data.case_id);
    // Cleanup test case
    const { error: delErr } = await supabase.from('clinical_cases').delete().eq('id', data.id);
    console.log('Cleaned up test case:', delErr ? delErr.message : 'Cleaned!');
  }
}

testRpc().catch(console.error);
