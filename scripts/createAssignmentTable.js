import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function createAssignmentTable() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Creating student_preceptor_assignments table with constraints, indexes, and policies...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.student_preceptor_assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
          student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE ON UPDATE CASCADE,
          preceptor_id UUID NOT NULL REFERENCES public.preceptors(id) ON DELETE CASCADE ON UPDATE CASCADE,
          assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
          remarks TEXT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- INDEXES
      CREATE INDEX IF NOT EXISTS idx_assignments_college ON public.student_preceptor_assignments(college_id);
      CREATE INDEX IF NOT EXISTS idx_assignments_student ON public.student_preceptor_assignments(student_id);
      CREATE INDEX IF NOT EXISTS idx_assignments_preceptor ON public.student_preceptor_assignments(preceptor_id);
      CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.student_preceptor_assignments(status);

      -- RLS POLICIES
      ALTER TABLE public.student_preceptor_assignments ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow All Operations Assignments" ON public.student_preceptor_assignments;
      CREATE POLICY "Allow All Operations Assignments" ON public.student_preceptor_assignments FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('SUCCESS: student_preceptor_assignments table, constraints, indexes, and RLS policies created in Supabase!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

createAssignmentTable();
