const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWorkflow() {
  console.log('=== Testing Supabase Workflow Status Fetching ===');

  const { data: cases, error } = await supabase
    .from('clinical_cases')
    .select('id, case_id, status, submitted_at, approved_at, returned_at, case_locked')
    .neq('status', 'Draft')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cases:', error);
  } else {
    console.log(`Fetched ${cases.length} non-Draft cases for preceptor queue:`);
    console.table(cases);
  }
}

testWorkflow();
