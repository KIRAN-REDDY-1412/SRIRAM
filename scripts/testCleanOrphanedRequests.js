import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCleanOrphanedRequests() {
  console.log('--- PURGING ALL ORPHANED REGISTRATION REQUESTS ---');
  
  const { data, error } = await supabase
    .from('registration_requests')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select();

  console.log('Deleted registration_requests:', data, 'Error:', error);
}

testCleanOrphanedRequests();
