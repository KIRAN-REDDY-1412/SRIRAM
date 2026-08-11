const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:kNJuN5IIKtogQWKT@db.uvvzhrvrqtqwyhlptvnx.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('=== Step 1: Fixing student_update_own_cases RLS Policy ===\n');

  const fixRlsSql = `
    DROP POLICY IF EXISTS "student_update_own_cases" ON public.clinical_cases;

    CREATE POLICY "student_update_own_cases" ON public.clinical_cases
    FOR UPDATE
    USING (
      (student_id = auth.uid() OR 
       (student_id)::text = ((COALESCE(NULLIF(current_setting('request.headers'::text, true), ''::text), '{}'::text))::jsonb ->> 'x-student-id'::text) OR 
       (student_id)::text = ((COALESCE(NULLIF(current_setting('request.headers'::text, true), ''::text), '{}'::text))::jsonb ->> 'x_student_id'::text) OR 
       (student_id)::text = current_setting('app.current_student_id'::text, true))
      AND ((status)::text = ANY (ARRAY['Draft'::text, 'Returned'::text]))
    )
    WITH CHECK (
      (student_id = auth.uid() OR 
       (student_id)::text = ((COALESCE(NULLIF(current_setting('request.headers'::text, true), ''::text), '{}'::text))::jsonb ->> 'x-student-id'::text) OR 
       (student_id)::text = ((COALESCE(NULLIF(current_setting('request.headers'::text, true), ''::text), '{}'::text))::jsonb ->> 'x_student_id'::text) OR 
       (student_id)::text = current_setting('app.current_student_id'::text, true))
      AND ((status)::text = ANY (ARRAY['Draft'::text, 'Returned'::text, 'Submitted'::text]))
    );
  `;

  await client.query(fixRlsSql);
  console.log('✅ Policy student_update_own_cases updated successfully with WITH CHECK clause!');

  console.log('\n=== Step 2: Migrating Old Case IDs ===\n');

  // Fetch all clinical cases with student roll number
  const casesRes = await client.query(`
    SELECT c.id, c.case_id, c.student_id, c.created_at, s.roll_number, s.full_name, col.college_code
    FROM public.clinical_cases c
    LEFT JOIN public.students s ON s.id = c.student_id
    LEFT JOIN public.colleges col ON col.id = c.college_id
    ORDER BY c.created_at ASC;
  `);

  const cases = casesRes.rows;
  console.log(`Total cases found in DB: ${cases.length}`);

  const NEW_FORMAT_REGEX = /^[A-Z]+-\d{4}-.+-\d{4}$/;
  const needsMigration = cases.filter(c => !NEW_FORMAT_REGEX.test(c.case_id));
  console.log(`Cases needing Case ID standardization: ${needsMigration.length}`);

  for (const c of needsMigration) {
    const year = new Date(c.created_at).getFullYear();
    const roll = c.roll_number || 'UNKNOWN';
    const code = c.college_code || 'AMRMCP';

    // Find sequence number for this student
    const studentCases = cases.filter(sc => sc.student_id === c.student_id);
    const seq = studentCases.findIndex(sc => sc.id === c.id) + 1;
    const newCaseId = `${code}-${year}-${roll}-${String(seq).padStart(4, '0')}`;

    console.log(`Migrating case: ${c.case_id} --> ${newCaseId} (Student: ${c.full_name}, Roll: ${roll})`);

    await client.query(`
      UPDATE public.clinical_cases 
      SET case_id = $1, case_number = $2, roll_number = $3 
      WHERE id = $4;
    `, [newCaseId, seq, roll, c.id]);

    console.log(`✅ Case ${c.id} updated to ${newCaseId}`);
  }

  console.log('\n=== Verification ===\n');
  const verifyRes = await client.query(`
    SELECT id, case_id, status, profile_completed, counselling_completed, created_at 
    FROM public.clinical_cases 
    ORDER BY created_at DESC;
  `);
  console.table(verifyRes.rows);

  await client.end();
}

run().catch(console.error);
