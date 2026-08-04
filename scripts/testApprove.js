import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testApproveFlow() {
  console.log('--- TESTING APPROVAL FLOW IN SUPABASE ---');

  // 1. Fetch pending requests
  const { data: requests, error: reqErr } = await supabase
    .from('registration_requests')
    .select('*');

  console.log('Current registration_requests in Supabase:', requests);

  if (requests && requests.length > 0) {
    const target = requests[0];
    console.log('Approving request:', target.id);

    // 2. Update status to Approved
    const { error: updErr } = await supabase
      .from('registration_requests')
      .update({ status: 'Approved', approved_at: new Date().toISOString() })
      .eq('id', target.id);

    if (updErr) console.error('Failed to update status:', updErr);

    // 3. Insert into colleges table
    const collegePayload = {
      registration_request_id: target.id,
      college_code: 'AMRC-NAR',
      college_name: target.college_name,
      city: target.city,
      state: target.state,
      principal_name: target.contact_person,
      principal_mobile: target.mobile_number,
      principal_email: target.email,
      status: 'Active'
    };

    const { data: colData, error: colErr } = await supabase
      .from('colleges')
      .insert([collegePayload])
      .select();

    if (colErr) {
      console.error('FAILED TO INSERT INTO COLLEGES:', colErr);
    } else {
      console.log('SUCCESSFULLY INSERTED INTO COLLEGES:', colData);

      // 4. Insert into subscriptions table
      const subPayload = {
        college_id: colData[0].id,
        plan_name: 'Professional',
        subscription_start_date: new Date().toISOString().split('T')[0],
        subscription_expiry_date: '2027-08-04',
        maximum_students: 600,
        status: 'Active'
      };

      const { data: subData, error: subErr } = await supabase
        .from('subscriptions')
        .insert([subPayload])
        .select();

      if (subErr) {
        console.error('FAILED TO INSERT INTO SUBSCRIPTIONS:', subErr);
      } else {
        console.log('SUCCESSFULLY INSERTED INTO SUBSCRIPTIONS:', subData);
      }
    }
  }
}

testApproveFlow();
