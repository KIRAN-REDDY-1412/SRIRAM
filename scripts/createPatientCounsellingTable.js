import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function createPatientCounsellingTable() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Creating patient_counselling table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.patient_counselling (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinical_case_id UUID NOT NULL UNIQUE REFERENCES public.clinical_cases(id) ON DELETE CASCADE ON UPDATE CASCADE,
          student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE ON UPDATE CASCADE,
          college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
          
          -- Session & Patient Details
          counselling_date DATE NOT NULL DEFAULT CURRENT_DATE,
          counselling_time VARCHAR(20) NULL,
          patient_type VARCHAR(20) NOT NULL DEFAULT 'In patient',
          ip_op_number VARCHAR(50) NULL,
          unit_ward VARCHAR(100) NULL,
          age VARCHAR(20) NULL,
          sex VARCHAR(20) NULL,
          allergies TEXT NULL,
          specific_background_collected BOOLEAN NOT NULL DEFAULT false,

          -- Disease & Medication
          disease_counselled TEXT NULL,
          medications_counselled TEXT NULL,

          -- Points Covered (JSONB Array)
          points_covered JSONB DEFAULT '[]'::jsonb,

          -- Barriers
          major_barriers_involved BOOLEAN NOT NULL DEFAULT false,
          barrier_details TEXT NULL,
          barrier_overcome BOOLEAN NOT NULL DEFAULT false,

          -- Duration & Recipient
          time_taken VARCHAR(50) NULL,
          counselling_provided_to VARCHAR(50) NOT NULL DEFAULT 'Patient',
          representative_reasons JSONB DEFAULT '[]'::jsonb,
          representative_other_reason TEXT NULL,

          -- Aids & Materials
          counselling_aids_used TEXT NULL,
          counselling_material_provided TEXT NULL,

          -- Outcome & Status
          understanding_ascertained BOOLEAN NOT NULL DEFAULT true,
          status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Approved')),

          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- INDEXES
      CREATE INDEX IF NOT EXISTS idx_counselling_case ON public.patient_counselling(clinical_case_id);
      CREATE INDEX IF NOT EXISTS idx_counselling_student ON public.patient_counselling(student_id);

      -- RLS POLICIES
      ALTER TABLE public.patient_counselling ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow All Operations Patient Counselling" ON public.patient_counselling;
      CREATE POLICY "Allow All Operations Patient Counselling" ON public.patient_counselling FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('SUCCESS: patient_counselling table, indexes, and RLS policies created in Supabase!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

createPatientCounsellingTable();
