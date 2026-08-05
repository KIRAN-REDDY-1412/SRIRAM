import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function createPharmacistInterventionsTable() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Creating pharmacist_interventions table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pharmacist_interventions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinical_case_id UUID NOT NULL UNIQUE REFERENCES public.clinical_cases(id) ON DELETE CASCADE ON UPDATE CASCADE,
          student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE ON UPDATE CASCADE,
          college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
          
          -- Patient & Intervention Info
          patient_name VARCHAR(150) NOT NULL,
          age VARCHAR(20) NULL,
          sex VARCHAR(20) NULL,
          date_of_intervention DATE NOT NULL DEFAULT CURRENT_DATE,
          ip_op_no VARCHAR(50) NULL,
          ward VARCHAR(100) NULL,
          present_diagnosis TEXT NULL,

          -- Prescription Details (JSONB Array)
          prescription_details JSONB DEFAULT '[]'::jsonb,

          -- Prescription Problems
          prescription_problems JSONB DEFAULT '[]'::jsonb,
          prescription_problem_other TEXT NULL,
          description_of_problem TEXT NULL,

          -- Action Taken & Recommendations
          action_taken JSONB DEFAULT '[]'::jsonb,
          action_taken_other TEXT NULL,
          recommendations JSONB DEFAULT '[]'::jsonb,
          recommendation_other TEXT NULL,

          -- Checklist Booleans
          background_info_collected BOOLEAN NOT NULL DEFAULT true,
          discussed_with_physician BOOLEAN NOT NULL DEFAULT true,
          suggestions_appropriate_time BOOLEAN NOT NULL DEFAULT true,
          accepted BOOLEAN NOT NULL DEFAULT true,
          changed BOOLEAN NOT NULL DEFAULT true,
          reasons_if_no TEXT NULL,

          -- Assessment & Outcome
          significance_of_intervention VARCHAR(50) NOT NULL DEFAULT 'Moderate',
          outcome VARCHAR(50) NOT NULL DEFAULT 'Positive',
          references_text TEXT NULL,
          follow_up TEXT NULL,

          -- Status
          status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Approved')),

          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- INDEXES
      CREATE INDEX IF NOT EXISTS idx_interventions_case ON public.pharmacist_interventions(clinical_case_id);
      CREATE INDEX IF NOT EXISTS idx_interventions_student ON public.pharmacist_interventions(student_id);

      -- RLS POLICIES
      ALTER TABLE public.pharmacist_interventions ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow All Operations Pharmacist Interventions" ON public.pharmacist_interventions;
      CREATE POLICY "Allow All Operations Pharmacist Interventions" ON public.pharmacist_interventions FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('SUCCESS: pharmacist_interventions table, indexes, and RLS policies created in Supabase!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

createPharmacistInterventionsTable();
