const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkChildRLS() {
  await client.connect();
  console.log('=== RLS POLICIES ON ALL CHILD TABLES ===');
  const res = await client.query(`
    SELECT tablename, policyname, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE tablename IN ('patient_profiles', 'patient_counselling', 'pharmacist_interventions', 'drug_information_requests', 'adr_reports');
  `);
  console.table(res.rows);
  await client.end();
}

checkChildRLS().catch(console.error);
