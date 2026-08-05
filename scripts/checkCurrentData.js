import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCurrentData() {
  console.log('====================================================');
  console.log('Checking live rows in Supabase database...');
  console.log('====================================================');

  const { data: requests, error: err1 } = await supabase
    .from('registration_requests')
    .select('*')
    .order('created_at', { ascending: false });

  console.log('\n📋 REGISTRATION REQUESTS TABLE (Total:', requests ? requests.length : 0, '):');
  console.table(requests);

  const { data: colleges, error: err2 } = await supabase
    .from('colleges')
    .select('*')
    .order('created_at', { ascending: false });

  console.log('\n🏛️ COLLEGES TABLE (Total:', colleges ? colleges.length : 0, '):');
  console.table(colleges);

  const { data: subs, error: err3 } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  console.log('\n💳 SUBSCRIPTIONS TABLE (Total:', subs ? subs.length : 0, '):');
  console.table(subs);
}

checkCurrentData();
