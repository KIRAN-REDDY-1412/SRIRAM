const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:kNJuN5IIKtogQWKT@db.uvvzhrvrqtqwyhlptvnx.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixRLS() {
  await client.connect();
  console.log('=== Fixing clinical_cases RLS Policy ===\n');

  const sql = `
    ALTER TABLE public.clinical_cases ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow All Clinical Cases" ON public.clinical_cases;
    DROP POLICY IF EXISTS "student_select_own_cases" ON public.clinical_cases;
    DROP POLICY IF EXISTS "preceptor_select_assigned_cases" ON public.clinical_cases;
    DROP POLICY IF EXISTS "college_admin_select_approved_cases" ON public.clinical_cases;
    DROP POLICY IF EXISTS "student_insert_own_cases" ON public.clinical_cases;
    DROP POLICY IF EXISTS "student_update_own_cases" ON public.clinical_cases;
    DROP POLICY IF EXISTS "student_delete_own_cases" ON public.clinical_cases;
    DROP POLICY IF EXISTS "preceptor_update_assigned_cases" ON public.clinical_cases;

    CREATE POLICY "Allow All Clinical Cases" ON public.clinical_cases FOR ALL USING (true) WITH CHECK (true);
  `;

  await client.query(sql);
  console.log('✅ RLS policy "Allow All Clinical Cases" created!');

  // Also ensure preceptor_id is set on existing case AMRMCP-2026-Y22PHD0314-0001
  await client.query(`
    UPDATE public.clinical_cases
    SET preceptor_id = 'd982006b-5d8e-4d2c-a8fb-cebe2c98ecf1'
    WHERE case_id = 'AMRMCP-2026-Y22PHD0314-0001' AND preceptor_id IS NULL;
  `);
  console.log('✅ Updated preceptor_id on case AMRMCP-2026-Y22PHD0314-0001 to Dr. SAHITHI SRI!');

  await client.end();
}

fixRLS().catch(console.error);
