const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkConstraint() {
  await client.connect();
  console.log('=== CHECK CONSTRAINTS ON CLINICAL_CASES ===');
  const res = await client.query(`
    SELECT conname, pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conrelid = 'public.clinical_cases'::regclass;
  `);
  console.table(res.rows);
  await client.end();
}

checkConstraint().catch(console.error);
