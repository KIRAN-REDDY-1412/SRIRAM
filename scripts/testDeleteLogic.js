import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDeleteLogic() {
  console.log('=== INSPECTING ALL ROWS ACROSS TABLES ===');
  
  const { data: reqs } = await supabase.from('registration_requests').select('id, college_name, contact_person, status');
  console.log('REGISTRATION REQUESTS:', reqs);

  const { data: cols } = await supabase.from('colleges').select('id, registration_request_id, college_name, status');
  console.log('COLLEGES:', cols);

  const { data: subs } = await supabase.from('subscriptions').select('id, college_id, plan_name');
  console.log('SUBSCRIPTIONS:', subs);

  if (cols && cols.length > 0) {
    const targetCol = cols[0];
    console.log('\n--- TESTING DELETE FOR COLLEGE ID:', targetCol.id, 'REG_REQ_ID:', targetCol.registration_request_id, '---');

    // Query 1: Find by college id
    const { data: byColId, error: err1 } = await supabase
      .from('colleges')
      .select('id, registration_request_id')
      .eq('id', targetCol.id);
    
    console.log('Result byColId:', byColId, 'Error:', err1);

    // Query 2: Find by reg req id
    const { data: byReqId, error: err2 } = await supabase
      .from('colleges')
      .select('id, registration_request_id')
      .eq('registration_request_id', targetCol.id);
    
    console.log('Result byReqId:', byReqId, 'Error:', err2);
  }
}

testDeleteLogic();
