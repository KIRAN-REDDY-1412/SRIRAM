const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:kNJuN5IIKtogQWKT@db.uvvzhrvrqtqwyhlptvnx.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testViews() {
  await client.connect();
  console.log('=== Simulating Queries ===\n');

  // 1. All cases for student K.Nikhil (id = 14d6cd0e-cf90-475b-98fd-12e10f3edf12)
  const studentCases = await client.query(`
    SELECT id, case_id, status, preceptor_id, profile_completed, counselling_completed 
    FROM public.clinical_cases 
    WHERE student_id = '14d6cd0e-cf90-475b-98fd-12e10f3edf12';
  `);
  console.log('K.Nikhil Cases in DB:');
  console.table(studentCases.rows);

  // 2. Preceptor assigned students for Dr. SAHITHI SRI (id = d982006b-5d8e-4d2c-a8fb-cebe2c98ecf1)
  const preceptorAssignments = await client.query(`
    SELECT student_id FROM public.student_preceptor_assignments
    WHERE preceptor_id = 'd982006b-5d8e-4d2c-a8fb-cebe2c98ecf1' AND status = 'Active';
  `);
  const studentIds = preceptorAssignments.rows.map(r => r.student_id);
  console.log('Dr. SAHITHI SRI Assigned Student IDs:', studentIds);

  // 3. Preceptor cases query using studentIds
  const preceptorCases = await client.query(`
    SELECT id, case_id, status, preceptor_id, student_id 
    FROM public.clinical_cases 
    WHERE student_id = ANY($1::uuid[]);
  `, [studentIds]);
  console.log('Cases matching Dr. SAHITHI SRI assigned students in DB:');
  console.table(preceptorCases.rows);

  await client.end();
}

testViews().catch(console.error);
