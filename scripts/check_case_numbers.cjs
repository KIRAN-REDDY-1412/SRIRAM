const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkCaseNumbers() {
  await client.connect();
  console.log('=== Checking case_number and case_id in clinical_cases ===\n');

  const res = await client.query(`
    SELECT id, case_id, case_number, student_id, roll_number, created_at
    FROM public.clinical_cases
    ORDER BY created_at ASC;
  `);

  console.table(res.rows);
  await client.end();
}

checkCaseNumbers().catch(console.error);
