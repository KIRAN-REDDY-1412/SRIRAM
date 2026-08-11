const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:kNJuN5IIKtogQWKT@db.uvvzhrvrqtqwyhlptvnx.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function syncOverallStatus() {
  await client.connect();
  console.log('=== Syncing overall_case_status in clinical_cases ===\n');

  await client.query(`
    UPDATE public.clinical_cases
    SET overall_case_status = status
    WHERE status <> 'Draft';
  `);
  console.log('✅ Synchronized overall_case_status with status column!');

  const check = await client.query(`
    SELECT id, case_id, status, overall_case_status, preceptor_id 
    FROM public.clinical_cases;
  `);
  console.table(check.rows);

  await client.end();
}

syncOverallStatus().catch(console.error);
