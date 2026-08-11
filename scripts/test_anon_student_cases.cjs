const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uvvzhrvrqtqwyhlptvnx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI'
);

async function testFetch() {
  console.log('Fetching cases for student 14d6cd0e-cf90-475b-98fd-12e10f3edf12 via anon...');
  const { data, error } = await supabase
    .from('clinical_cases')
    .select('*')
    .eq('student_id', '14d6cd0e-cf90-475b-98fd-12e10f3edf12');

  console.log('Result:', { data, error });
}

testFetch().catch(console.error);
