import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('Testing Supabase client insert...');

  const testPayload = {
    college_name: 'A.M.REDDY MEMORIAL COLLEGE OF PHARMACY',
    city: 'NARASARAOPET',
    state: 'ANDHRA PRADESH',
    contact_person: 'Dr. Kiran Reddy',
    mobile_number: '9440251915',
    email: 'kiran@amreddypharmacy.edu.in',
    status: 'Pending'
  };

  const { data, error } = await supabase
    .from('registration_requests')
    .insert([testPayload])
    .select();

  if (error) {
    console.error('FAILED TO INSERT REGISTRATION REQUEST:', error);
  } else {
    console.log('SUCCESSFULLY INSERTED REGISTRATION REQUEST:', data);
  }

  // Also test colleges query
  const { data: colleges, error: colErr } = await supabase
    .from('colleges')
    .select('*');

  if (colErr) {
    console.error('FAILED TO SELECT COLLEGES:', colErr);
  } else {
    console.log('CURRENT COLLEGES IN SUPABASE:', colleges);
  }
}

testSupabase();
