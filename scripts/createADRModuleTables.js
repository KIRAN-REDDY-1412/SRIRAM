import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function createADRModuleTables() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Creating adr_reports and child tables...');

    await client.query(`
      -- TABLE 1: adr_reports
      CREATE TABLE IF NOT EXISTS public.adr_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinical_case_id UUID NOT NULL UNIQUE REFERENCES public.clinical_cases(id) ON DELETE CASCADE ON UPDATE CASCADE,
          student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE ON UPDATE CASCADE,
          college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
          
          -- SECTION 1: GENERAL RECORD
          adr_number VARCHAR(100) NOT NULL UNIQUE,
          reporting_date DATE NOT NULL DEFAULT CURRENT_DATE,
          reported_by_student_name VARCHAR(150) NULL,
          assigned_preceptor_name VARCHAR(150) NULL,
          
          -- SECTION 2: PATIENT OVERVIEW
          patient_initials VARCHAR(50) NULL,
          hospital_reg_number VARCHAR(50) NULL,
          age VARCHAR(20) NULL,
          gender VARCHAR(20) NULL,
          weight VARCHAR(20) NULL,
          department VARCHAR(100) NULL,
          ward VARCHAR(100) NULL,
          primary_diagnosis TEXT NULL,

          -- SECTION 3: REACTION OVERVIEW
          reaction_title VARCHAR(255) NULL,
          reaction_category VARCHAR(100) NULL,
          reaction_description TEXT NULL,
          reaction_started_at TIMESTAMP WITH TIME ZONE NULL,
          reaction_ended_at TIMESTAMP WITH TIME ZONE NULL,
          reaction_duration VARCHAR(100) NULL,
          clinical_management_provided TEXT NULL,
          current_patient_condition VARCHAR(100) NULL,

          -- SECTION 6: PATIENT BACKGROUND
          drug_allergy_history TEXT NULL,
          previous_adr_history TEXT NULL,
          relevant_medical_conditions TEXT NULL,
          pregnancy_lactation_status VARCHAR(100) NULL,
          renal_status VARCHAR(100) NULL,
          hepatic_status VARCHAR(100) NULL,
          lifestyle_factors TEXT NULL,
          additional_clinical_notes TEXT NULL,

          -- SECTION 7: REACTION ASSESSMENT
          reaction_severity VARCHAR(50) NULL,
          reaction_seriousness VARCHAR(100) NULL,
          patient_outcome VARCHAR(100) NULL,
          action_taken_on_suspected_drug VARCHAR(100) NULL,
          rechallenge_information TEXT NULL,
          dechallenge_information TEXT NULL,
          initial_causality_opinion VARCHAR(100) NULL,
          clinical_remarks TEXT NULL,

          -- SECTION 9: REVIEW INFORMATION
          student_remarks TEXT NULL,
          preceptor_review TEXT NULL,
          faculty_comments TEXT NULL,
          approval_status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (approval_status IN ('Draft', 'Submitted', 'Returned', 'Approved')),

          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- TABLE 2: adr_suspected_medications
      CREATE TABLE IF NOT EXISTS public.adr_suspected_medications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          adr_report_id UUID NOT NULL REFERENCES public.adr_reports(id) ON DELETE CASCADE ON UPDATE CASCADE,
          clinical_case_id UUID NOT NULL REFERENCES public.clinical_cases(id) ON DELETE CASCADE ON UPDATE CASCADE,
          medicine_name VARCHAR(150) NOT NULL,
          generic_name VARCHAR(150) NULL,
          strength VARCHAR(50) NULL,
          dosage_form VARCHAR(50) NULL,
          dose VARCHAR(50) NULL,
          route VARCHAR(50) NULL,
          frequency VARCHAR(50) NULL,
          start_date DATE NULL,
          stop_date DATE NULL,
          clinical_indication TEXT NULL,
          manufacturer VARCHAR(150) NULL,
          batch_number VARCHAR(100) NULL,
          expiry_date DATE NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- TABLE 3: adr_concomitant_medications
      CREATE TABLE IF NOT EXISTS public.adr_concomitant_medications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          adr_report_id UUID NOT NULL REFERENCES public.adr_reports(id) ON DELETE CASCADE ON UPDATE CASCADE,
          clinical_case_id UUID NOT NULL REFERENCES public.clinical_cases(id) ON DELETE CASCADE ON UPDATE CASCADE,
          medicine_name VARCHAR(150) NOT NULL,
          dose VARCHAR(50) NULL,
          route VARCHAR(50) NULL,
          frequency VARCHAR(50) NULL,
          purpose TEXT NULL,
          start_date DATE NULL,
          stop_date DATE NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- TABLE 4: adr_attachments
      CREATE TABLE IF NOT EXISTS public.adr_attachments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          adr_report_id UUID NOT NULL REFERENCES public.adr_reports(id) ON DELETE CASCADE ON UPDATE CASCADE,
          clinical_case_id UUID NOT NULL REFERENCES public.clinical_cases(id) ON DELETE CASCADE ON UPDATE CASCADE,
          file_name VARCHAR(255) NOT NULL,
          file_type VARCHAR(100) NULL,
          file_url TEXT NOT NULL,
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- INDEXES
      CREATE INDEX IF NOT EXISTS idx_adr_case ON public.adr_reports(clinical_case_id);
      CREATE INDEX IF NOT EXISTS idx_adr_student ON public.adr_reports(student_id);
      CREATE INDEX IF NOT EXISTS idx_adr_suspected_report ON public.adr_suspected_medications(adr_report_id);
      CREATE INDEX IF NOT EXISTS idx_adr_concomitant_report ON public.adr_concomitant_medications(adr_report_id);
      CREATE INDEX IF NOT EXISTS idx_adr_attachments_report ON public.adr_attachments(adr_report_id);

      -- RLS POLICIES
      ALTER TABLE public.adr_reports ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.adr_suspected_medications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.adr_concomitant_medications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.adr_attachments ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow All ADR Reports" ON public.adr_reports;
      CREATE POLICY "Allow All ADR Reports" ON public.adr_reports FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow All ADR Suspected Meds" ON public.adr_suspected_medications;
      CREATE POLICY "Allow All ADR Suspected Meds" ON public.adr_suspected_medications FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow All ADR Concomitant Meds" ON public.adr_concomitant_medications;
      CREATE POLICY "Allow All ADR Concomitant Meds" ON public.adr_concomitant_medications FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow All ADR Attachments" ON public.adr_attachments;
      CREATE POLICY "Allow All ADR Attachments" ON public.adr_attachments FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('SUCCESS: adr_reports and all 3 child tables created in Supabase with indexes & RLS!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

createADRModuleTables();
