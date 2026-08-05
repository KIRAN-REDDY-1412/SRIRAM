import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function createDrugInformationRequestsTable() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Creating drug_information_requests table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.drug_information_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinical_case_id UUID NOT NULL UNIQUE REFERENCES public.clinical_cases(id) ON DELETE CASCADE ON UPDATE CASCADE,
          student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE ON UPDATE CASCADE,
          college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
          
          -- Session & Enquirer Details
          request_date DATE NOT NULL DEFAULT CURRENT_DATE,
          request_time VARCHAR(20) NULL,
          enquirer_name VARCHAR(150) NOT NULL,
          designation VARCHAR(100) NULL,
          phone_no VARCHAR(30) NULL,
          unit_ward VARCHAR(100) NULL,
          professional_status VARCHAR(50) NULL,
          professional_status_other TEXT NULL,

          -- Request Details
          mode_of_request VARCHAR(50) NOT NULL DEFAULT 'Direct',
          answer_needed VARCHAR(50) NOT NULL DEFAULT 'Immediately',
          details_of_enquiry TEXT NOT NULL,
          question_category VARCHAR(100) NULL,
          purpose_of_enquiry VARCHAR(100) NOT NULL DEFAULT 'Better patient care',
          purpose_other TEXT NULL,

          -- Patient Details
          age VARCHAR(20) NULL,
          sex VARCHAR(20) NULL,
          weight_kg VARCHAR(20) NULL,
          allergies TEXT NULL,
          current_medical_problem TEXT NULL,
          is_pregnant_lactating BOOLEAN NOT NULL DEFAULT false,
          pregnancy_lactation_details TEXT NULL,
          other_investigations TEXT NULL,
          drug_therapy TEXT NULL,

          -- Response Metadata
          answer_given_timeframe VARCHAR(50) NULL,
          reason_for_delay TEXT NULL,
          mode_of_reply VARCHAR(50) NOT NULL DEFAULT 'Written',
          information_provided TEXT NULL,

          -- References
          ref_textbooks TEXT NULL,
          ref_journals TEXT NULL,
          ref_micromedex TEXT NULL,
          ref_clinirex TEXT NULL,
          ref_idis TEXT NULL,
          ref_website TEXT NULL,
          ref_others TEXT NULL,

          -- Status
          status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Approved')),

          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- INDEXES
      CREATE INDEX IF NOT EXISTS idx_dir_case ON public.drug_information_requests(clinical_case_id);
      CREATE INDEX IF NOT EXISTS idx_dir_student ON public.drug_information_requests(student_id);

      -- RLS POLICIES
      ALTER TABLE public.drug_information_requests ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow All Operations Drug Information Requests" ON public.drug_information_requests;
      CREATE POLICY "Allow All Operations Drug Information Requests" ON public.drug_information_requests FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('SUCCESS: drug_information_requests table, indexes, and RLS policies created in Supabase!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

createDrugInformationRequestsTable();
