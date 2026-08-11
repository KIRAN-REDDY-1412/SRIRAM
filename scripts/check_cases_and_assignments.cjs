const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:kNJuN5IIKtogQWKT@db.uvvzhrvrqtqwyhlptvnx.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkCases() {
  await client.connect();
  console.log('=== Checking all clinical_cases ===\n');

  const cases = await client.query(`
    SELECT c.id, c.case_id, c.student_id, c.preceptor_id, c.college_id, c.date_of_admission, c.status, c.profile_completed, c.counselling_completed, s.full_name as student_name, s.roll_number
    FROM public.clinical_cases c
    LEFT JOIN public.students s ON s.id = c.student_id;
  `);
  console.table(cases.rows);

  console.log('\n=== Checking student_preceptor_assignments ===\n');
  const assignments = await client.query(`
    SELECT a.id, a.preceptor_id, a.student_id, p.full_name as preceptor_name, s.full_name as student_name
    FROM public.student_preceptor_assignments a
    LEFT JOIN public.preceptors p ON p.id = a.preceptor_id
    LEFT JOIN public.students s ON s.id = a.student_id;
  `);
  console.table(assignments.rows);

  await client.end();
}

checkCases().catch(console.error);
