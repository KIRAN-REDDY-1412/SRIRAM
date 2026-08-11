const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  await client.connect();
  console.log('=== Adding final_diagnosis column to clinical_cases ===\n');

  await client.query(`
    ALTER TABLE public.clinical_cases ADD COLUMN IF NOT EXISTS final_diagnosis TEXT;
  `);
  console.log('✅ Added column final_diagnosis to clinical_cases!');

  await client.query(`
    UPDATE public.clinical_cases c
    SET final_diagnosis = p.final_diagnosis
    FROM public.patient_profiles p
    WHERE p.clinical_case_id = c.id AND p.final_diagnosis IS NOT NULL AND (c.final_diagnosis IS NULL OR c.final_diagnosis = '');
  `);
  console.log('✅ Synchronized existing final_diagnosis values from patient_profiles!');

  const check = await client.query(`
    SELECT id, case_id, final_diagnosis FROM public.clinical_cases;
  `);
  console.table(check.rows);

  await client.end();
}

migrate().catch(console.error);
