import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function createClinicalCasesTable() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Creating clinical_cases table with constraints, indexes, and policies...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.clinical_cases (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          case_id VARCHAR(100) NOT NULL UNIQUE,
          college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
          student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE ON UPDATE CASCADE,
          preceptor_id UUID NULL REFERENCES public.preceptors(id) ON DELETE SET NULL ON UPDATE CASCADE,
          hospital_name VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          ward_unit VARCHAR(100) NOT NULL,
          ip_op_type VARCHAR(10) NOT NULL CHECK (ip_op_type IN ('IP', 'OP')),
          date_of_admission DATE NOT NULL,
          date_of_collection DATE NOT NULL,
          academic_year VARCHAR(50) NOT NULL DEFAULT '2026–2027',
          status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Approved')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- INDEXES
      CREATE INDEX IF NOT EXISTS idx_cases_case_id ON public.clinical_cases(case_id);
      CREATE INDEX IF NOT EXISTS idx_cases_college ON public.clinical_cases(college_id);
      CREATE INDEX IF NOT EXISTS idx_cases_student ON public.clinical_cases(student_id);
      CREATE INDEX IF NOT EXISTS idx_cases_preceptor ON public.clinical_cases(preceptor_id);
      CREATE INDEX IF NOT EXISTS idx_cases_status ON public.clinical_cases(status);

      -- RLS POLICIES
      ALTER TABLE public.clinical_cases ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow All Operations Clinical Cases" ON public.clinical_cases;
      CREATE POLICY "Allow All Operations Clinical Cases" ON public.clinical_cases FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('SUCCESS: clinical_cases table, constraints, indexes, and RLS policies created in Supabase!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

createClinicalCasesTable();
