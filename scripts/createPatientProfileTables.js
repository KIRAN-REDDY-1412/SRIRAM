import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function createPatientProfileTables() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Creating patient_profiles, patient_lab_investigations, and patient_prescribed_drugs tables...');

    await client.query(`
      -- 1. PATIENT PROFILES TABLE
      CREATE TABLE IF NOT EXISTS public.patient_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinical_case_id UUID NOT NULL UNIQUE REFERENCES public.clinical_cases(id) ON DELETE CASCADE ON UPDATE CASCADE,
          student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE ON UPDATE CASCADE,
          college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
          
          -- Patient Details
          patient_name VARCHAR(150) NOT NULL,
          age VARCHAR(20) NULL,
          gender VARCHAR(20) NULL,
          ip_no VARCHAR(50) NULL,
          height VARCHAR(20) NULL,
          weight VARCHAR(20) NULL,
          bmi VARCHAR(20) NULL,
          ward VARCHAR(100) NULL,
          department VARCHAR(100) NULL,
          doa DATE NULL,
          doc DATE NULL,
          dod DATE NULL,
          physician VARCHAR(150) NULL,

          -- Histories
          chief_complaints TEXT NULL,
          past_medical_history TEXT NULL,
          past_medication_history TEXT NULL,
          family_history TEXT NULL,

          -- Social & Allergy History
          smoker_pack_day VARCHAR(50) NULL,
          smoker_duration VARCHAR(50) NULL,
          alcoholic_amount_day VARCHAR(50) NULL,
          alcoholic_duration VARCHAR(50) NULL,
          allergy_food TEXT NULL,
          allergy_drugs TEXT NULL,
          marital_status VARCHAR(50) NULL,

          -- Physical Examination
          cyanosis VARCHAR(100) NULL,
          icterus VARCHAR(100) NULL,
          pallor VARCHAR(100) NULL,
          cvs TEXT NULL,
          gi TEXT NULL,
          rs TEXT NULL,
          cns TEXT NULL,

          -- Diagnoses
          provisional_diagnosis TEXT NULL,
          final_diagnosis TEXT NULL,

          -- Vital Signs (Array of { date, temp, bp, pr, rr, spo2 })
          vital_signs JSONB DEFAULT '[]'::jsonb,

          -- Other & Discharge
          other_investigations TEXT NULL,
          discharge_summary TEXT NULL,

          -- Status
          status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Approved')),

          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- 2. PATIENT LAB INVESTIGATIONS CHILD TABLE
      CREATE TABLE IF NOT EXISTS public.patient_lab_investigations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_profile_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
          category VARCHAR(100) NOT NULL,
          parameter_name VARCHAR(150) NOT NULL,
          reference_range VARCHAR(100) NULL,
          test_date DATE NOT NULL DEFAULT CURRENT_DATE,
          test_value VARCHAR(100) NULL,
          unit VARCHAR(50) NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- 3. PATIENT PRESCRIBED DRUGS CHILD TABLE
      CREATE TABLE IF NOT EXISTS public.patient_prescribed_drugs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_profile_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
          s_no INT NULL,
          trade_name VARCHAR(150) NOT NULL,
          generic_name VARCHAR(150) NOT NULL,
          route_of_admin VARCHAR(50) NOT NULL,
          dose VARCHAR(50) NOT NULL,
          frequency VARCHAR(50) NOT NULL,
          start_date DATE NULL,
          stop_date DATE NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- INDEXES
      CREATE INDEX IF NOT EXISTS idx_patient_profiles_case ON public.patient_profiles(clinical_case_id);
      CREATE INDEX IF NOT EXISTS idx_patient_profiles_student ON public.patient_profiles(student_id);
      CREATE INDEX IF NOT EXISTS idx_lab_investigations_profile ON public.patient_lab_investigations(patient_profile_id);
      CREATE INDEX IF NOT EXISTS idx_prescribed_drugs_profile ON public.patient_prescribed_drugs(patient_profile_id);

      -- RLS POLICIES
      ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.patient_lab_investigations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.patient_prescribed_drugs ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow All Operations Patient Profiles" ON public.patient_profiles;
      DROP POLICY IF EXISTS "Allow All Operations Lab Investigations" ON public.patient_lab_investigations;
      DROP POLICY IF EXISTS "Allow All Operations Prescribed Drugs" ON public.patient_prescribed_drugs;

      CREATE POLICY "Allow All Operations Patient Profiles" ON public.patient_profiles FOR ALL USING (true) WITH CHECK (true);
      CREATE POLICY "Allow All Operations Lab Investigations" ON public.patient_lab_investigations FOR ALL USING (true) WITH CHECK (true);
      CREATE POLICY "Allow All Operations Prescribed Drugs" ON public.patient_prescribed_drugs FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('SUCCESS: patient_profiles, patient_lab_investigations, and patient_prescribed_drugs tables created in Supabase!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

createPatientProfileTables();
