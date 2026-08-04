import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAllData() {
  console.log('=== VERIFYING SUPABASE REGISTRATION REQUESTS ===');
  const { data: requests, error: err1 } = await supabase
    .from('registration_requests')
    .select('*');

  console.log('Registration Requests in Supabase:', requests);

  console.log('=== VERIFYING SUPABASE COLLEGES ===');
  const { data: colleges, error: err2 } = await supabase
    .from('colleges')
    .select('*');

  console.log('Colleges in Supabase:', colleges);

  console.log('=== VERIFYING SUPABASE SUBSCRIPTIONS ===');
  const { data: subs, error: err3 } = await supabase
    .from('subscriptions')
    .select('*');

  console.log('Subscriptions in Supabase:', subs);
}

verifyAllData();
