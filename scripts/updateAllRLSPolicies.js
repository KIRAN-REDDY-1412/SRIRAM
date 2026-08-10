import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function updateAllRLSPolicies() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Altering RLS policies to restrict Draft cases and restrict write access to students only on Draft/Returned cases...');

    // 1. Table: clinical_cases
    await client.query(`
      ALTER TABLE public.clinical_cases ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow All Operations Clinical Cases" ON public.clinical_cases;
      DROP POLICY IF EXISTS "student_select_own_cases" ON public.clinical_cases;
      DROP POLICY IF EXISTS "preceptor_select_assigned_cases" ON public.clinical_cases;
      DROP POLICY IF EXISTS "college_admin_select_approved_cases" ON public.clinical_cases;
      DROP POLICY IF EXISTS "student_insert_own_cases" ON public.clinical_cases;
      DROP POLICY IF EXISTS "student_update_own_cases" ON public.clinical_cases;
      DROP POLICY IF EXISTS "student_delete_own_cases" ON public.clinical_cases;
      DROP POLICY IF EXISTS "preceptor_update_assigned_cases" ON public.clinical_cases;

      -- SELECT POLICIES
      CREATE POLICY "student_select_own_cases" ON public.clinical_cases
        FOR SELECT TO public
        USING (student_id = auth.uid() OR current_setting('app.current_student_id', true) = student_id::text);

      CREATE POLICY "preceptor_select_assigned_cases" ON public.clinical_cases
        FOR SELECT TO public
        USING (
          (preceptor_id = auth.uid() OR current_setting('app.current_preceptor_id', true) = preceptor_id::text)
          AND status <> 'Draft'
        );

      CREATE POLICY "college_admin_select_approved_cases" ON public.clinical_cases
        FOR SELECT TO public
        USING (
          (college_id = auth.uid() OR current_setting('app.current_college_id', true) = college_id::text)
          AND status = 'Approved'
        );

      -- INSERT/UPDATE/DELETE POLICIES
      -- Students can create new cases
      CREATE POLICY "student_insert_own_cases" ON public.clinical_cases
        FOR INSERT TO public
        WITH CHECK (student_id = auth.uid() OR current_setting('app.current_student_id', true) = student_id::text);

      -- Students can edit their own cases only if status is Draft or Returned, and can submit them (status = Submitted)
      CREATE POLICY "student_update_own_cases" ON public.clinical_cases
        FOR UPDATE TO public
        USING (
          (student_id = auth.uid() OR current_setting('app.current_student_id', true) = student_id::text)
          AND status IN ('Draft', 'Returned')
        )
        WITH CHECK (
          (student_id = auth.uid() OR current_setting('app.current_student_id', true) = student_id::text)
          AND status IN ('Draft', 'Returned', 'Submitted')
        );

      -- Students can delete only Draft cases
      CREATE POLICY "student_delete_own_cases" ON public.clinical_cases
        FOR DELETE TO public
        USING (
          (student_id = auth.uid() OR current_setting('app.current_student_id', true) = student_id::text)
          AND status = 'Draft'
        );

      -- Preceptors can update review fields of assigned cases
      CREATE POLICY "preceptor_update_assigned_cases" ON public.clinical_cases
        FOR UPDATE TO public
        USING (preceptor_id = auth.uid() OR current_setting('app.current_preceptor_id', true) = preceptor_id::text);
    `);
    console.log('✅ clinical_cases RLS policies configured successfully.');

    // List of child documentation tables to secure
    const childTables = [
      { name: 'patient_profiles', policyName: 'Allow All Operations Patient Profiles' },
      { name: 'patient_counselling', policyName: 'Allow All Operations Patient Counselling' },
      { name: 'pharmacist_interventions', policyName: 'Allow All Operations Pharmacist Interventions' },
      { name: 'drug_information_requests', policyName: 'Allow All Operations Drug Information Requests' },
      { name: 'adr_reports', policyName: 'Allow All ADR Reports' }
    ];

    for (const table of childTables) {
      console.log(`Securing table: ${table.name}...`);
      await client.query(`
        ALTER TABLE public.${table.name} ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "${table.policyName}" ON public.${table.name};
        DROP POLICY IF EXISTS "select_policy" ON public.${table.name};
        DROP POLICY IF EXISTS "insert_policy" ON public.${table.name};
        DROP POLICY IF EXISTS "update_policy" ON public.${table.name};
        DROP POLICY IF EXISTS "delete_policy" ON public.${table.name};

        -- 1. SELECT: Students see own, Preceptors see assigned (excluding Draft), Admins see Approved
        CREATE POLICY "select_policy" ON public.${table.name}
          FOR SELECT TO public
          USING (
            EXISTS (
              SELECT 1 FROM public.clinical_cases c
              WHERE c.id = clinical_case_id
              AND (
                (c.student_id = auth.uid() OR current_setting('app.current_student_id', true) = c.student_id::text)
                OR (
                  (c.preceptor_id = auth.uid() OR current_setting('app.current_preceptor_id', true) = c.preceptor_id::text)
                  AND c.status <> 'Draft'
                )
                OR (
                  (c.college_id = auth.uid() OR current_setting('app.current_college_id', true) = c.college_id::text)
                  AND c.status = 'Approved'
                )
              )
            )
          );

        -- 2. INSERT: Only students can insert, and only if parent case is Draft or Returned
        CREATE POLICY "insert_policy" ON public.${table.name}
          FOR INSERT TO public
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.clinical_cases c
              WHERE c.id = clinical_case_id
              AND (c.student_id = auth.uid() OR current_setting('app.current_student_id', true) = c.student_id::text)
              AND c.status IN ('Draft', 'Returned')
            )
          );

        -- 3. UPDATE: Only students can update, and only if parent case is Draft or Returned
        CREATE POLICY "update_policy" ON public.${table.name}
          FOR UPDATE TO public
          USING (
            EXISTS (
              SELECT 1 FROM public.clinical_cases c
              WHERE c.id = clinical_case_id
              AND (c.student_id = auth.uid() OR current_setting('app.current_student_id', true) = c.student_id::text)
              AND c.status IN ('Draft', 'Returned')
            )
          );

        -- 4. DELETE: Only students can delete, and only if parent case is Draft
        CREATE POLICY "delete_policy" ON public.${table.name}
          FOR DELETE TO public
          USING (
            EXISTS (
              SELECT 1 FROM public.clinical_cases c
              WHERE c.id = clinical_case_id
              AND (c.student_id = auth.uid() OR current_setting('app.current_student_id', true) = c.student_id::text)
              AND c.status = 'Draft'
            )
          );
      `);
      console.log(`✅ Table ${table.name} secured successfully.`);
    }

    console.log('\nSUCCESS: All RLS policies configured and secured in Supabase!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

updateAllRLSPolicies();
