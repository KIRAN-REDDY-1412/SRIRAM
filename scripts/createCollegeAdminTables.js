import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function createCollegeAdminTables() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Creating preceptors and students tables with indexes and policies...');
    
    await client.query(`
      -- TABLE: preceptors
      CREATE TABLE IF NOT EXISTS public.preceptors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
          full_name VARCHAR(150) NOT NULL,
          gender VARCHAR(20) NOT NULL,
          mobile_number VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          qualification VARCHAR(100) NOT NULL,
          designation VARCHAR(100) NOT NULL,
          department VARCHAR(100) NOT NULL,
          username VARCHAR(255) NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          profile_photo_url TEXT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- TABLE: students
      CREATE TABLE IF NOT EXISTS public.students (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
          roll_number VARCHAR(100) NOT NULL,
          full_name VARCHAR(150) NOT NULL,
          gender VARCHAR(20) NOT NULL,
          mobile_number VARCHAR(20) NULL,
          email VARCHAR(255) NOT NULL,
          batch VARCHAR(50) NOT NULL,
          course VARCHAR(50) NOT NULL DEFAULT 'Pharm.D',
          academic_year VARCHAR(50) NOT NULL DEFAULT '2026–2027',
          year VARCHAR(50) NOT NULL,
          username VARCHAR(255) NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          profile_photo_url TEXT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          CONSTRAINT unique_college_roll_number UNIQUE (college_id, roll_number),
          CONSTRAINT unique_college_student_email UNIQUE (college_id, email)
      );

      -- INDEXES
      CREATE INDEX IF NOT EXISTS idx_preceptors_college_id ON public.preceptors(college_id);
      CREATE INDEX IF NOT EXISTS idx_preceptors_email ON public.preceptors(email);
      CREATE INDEX IF NOT EXISTS idx_preceptors_username ON public.preceptors(username);

      CREATE INDEX IF NOT EXISTS idx_students_college_id ON public.students(college_id);
      CREATE INDEX IF NOT EXISTS idx_students_roll_number ON public.students(roll_number);
      CREATE INDEX IF NOT EXISTS idx_students_username ON public.students(username);

      -- RLS POLICIES
      ALTER TABLE public.preceptors ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow All Operations Preceptors" ON public.preceptors;
      DROP POLICY IF EXISTS "Allow All Operations Students" ON public.students;

      CREATE POLICY "Allow All Operations Preceptors" ON public.preceptors FOR ALL USING (true) WITH CHECK (true);
      CREATE POLICY "Allow All Operations Students" ON public.students FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('SUCCESS: preceptors and students tables, constraints, indexes, and RLS policies created in Supabase!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

createCollegeAdminTables();
