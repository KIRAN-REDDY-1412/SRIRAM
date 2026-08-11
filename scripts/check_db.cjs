const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:kNJuN5IIKtogQWKT@db.uvvzhrvrqtqwyhlptvnx.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  console.log('=== Checking DB state via pg ===\n');

  const cases = await client.query('SELECT id, case_id, profile_completed, counselling_completed, status, created_at FROM public.clinical_cases ORDER BY created_at DESC LIMIT 10;');
  console.log('clinical_cases:', cases.rows);

  const profiles = await client.query('SELECT id, clinical_case_id, status, patient_name, age, ip_no, doa, chief_complaints, final_diagnosis FROM public.patient_profiles LIMIT 10;');
  console.log('patient_profiles:', profiles.rows);

  const counselling = await client.query('SELECT id, clinical_case_id, status, disease_counselled, medications_counselled FROM public.patient_counselling LIMIT 10;');
  console.log('patient_counselling:', counselling.rows);

  await client.end();
}

check().catch(console.error);
