import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function performAuditSync() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to Supabase Database!');
    console.log('Starting DB audit and synchronization schema alterations...\n');

    // 1. ADD COLUMNS to clinical_cases
    console.log('Auditing clinical_cases table...');
    await client.query(`
      ALTER TABLE public.clinical_cases 
        ADD COLUMN IF NOT EXISTS overall_case_status VARCHAR(50) DEFAULT 'Draft',
        ADD COLUMN IF NOT EXISTS case_locked BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE NULL,
        ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE NULL,
        ADD COLUMN IF NOT EXISTS approved_by_preceptor_id UUID REFERENCES public.preceptors(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS returned_at TIMESTAMP WITH TIME ZONE NULL,
        ADD COLUMN IF NOT EXISTS returned_by_preceptor_id UUID REFERENCES public.preceptors(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS overall_preceptor_comments TEXT NULL,
        ADD COLUMN IF NOT EXISTS returned_forms JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS official_pdf_generated BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS official_pdf_url TEXT NULL,
        ADD COLUMN IF NOT EXISTS review_round INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    `);
    console.log('✅ clinical_cases table verified and updated.');

    // 2. ADD COLUMNS to all 5 documentation tables
    const childTables = [
      'patient_profiles',
      'patient_counselling',
      'pharmacist_interventions',
      'drug_information_requests',
      'adr_reports'
    ];

    for (const table of childTables) {
      console.log(`Auditing ${table} table...`);
      await client.query(`
        ALTER TABLE public.${table}
          ADD COLUMN IF NOT EXISTS review_status VARCHAR(50) DEFAULT 'Draft',
          ADD COLUMN IF NOT EXISTS preceptor_comments TEXT NULL,
          ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE NULL,
          ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;
      `);
      console.log(`✅ ${table} table verified and updated.`);
    }

    // 3. ADD COLUMNS to document_branding_settings
    console.log('Auditing document_branding_settings table...');
    await client.query(`
      ALTER TABLE public.document_branding_settings
        ADD COLUMN IF NOT EXISTS header_enabled BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS footer_enabled BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS college_logo TEXT NULL,
        ADD COLUMN IF NOT EXISTS hospital_logo TEXT NULL,
        ADD COLUMN IF NOT EXISTS college_name VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS autonomous_status BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS footer_text TEXT NULL,
        ADD COLUMN IF NOT EXISTS watermark TEXT NULL;
    `);
    console.log('✅ document_branding_settings table verified and updated.');

    // 4. ADD COLUMNS to student_preceptor_assignments
    console.log('Auditing student_preceptor_assignments table...');
    await client.query(`
      ALTER TABLE public.student_preceptor_assignments
        ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(255) NULL;
    `);
    console.log('✅ student_preceptor_assignments table verified and updated.');

    // 5. CREATE Notifications table if missing
    console.log('Auditing notifications table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NULL,
        recipient_id UUID NOT NULL,
        recipient_role VARCHAR(50) NOT NULL CHECK (recipient_role IN ('Student', 'Preceptor', 'College Admin')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(100) NOT NULL CHECK (type IN ('Case Submitted', 'Case Returned', 'Case Approved', 'Assignment', 'General Announcement')),
        read_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
    `);
    console.log('✅ notifications table verified and created.');

    // 6. CREATE Clinical Case Review History table if missing
    console.log('Auditing clinical_case_review_history table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.clinical_case_review_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clinical_case_id UUID NOT NULL REFERENCES public.clinical_cases(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
        preceptor_id UUID NOT NULL REFERENCES public.preceptors(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL CHECK (action IN ('Submitted', 'Returned', 'Approved')),
        review_round INTEGER DEFAULT 1,
        returned_forms JSONB DEFAULT '[]'::jsonb,
        comments TEXT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
    `);
    console.log('✅ clinical_case_review_history table verified and created.');

    // 7. CREATE PDF Management table if missing
    console.log('Auditing pdf_management table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pdf_management (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clinical_case_id UUID NOT NULL REFERENCES public.clinical_cases(id) ON DELETE CASCADE,
        official_pdf_path TEXT NOT NULL,
        generated_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        generated_by UUID NULL,
        pdf_version INTEGER DEFAULT 1
      );
    `);
    console.log('✅ pdf_management table verified and created.');

    // 8. CREATE Search Optimization INDEXES
    console.log('Creating search optimization indexes...');
    await client.query(`
      -- Foreign Keys & ID Fields on Child tables
      CREATE INDEX IF NOT EXISTS idx_patient_profiles_clinical_case_id ON public.patient_profiles(clinical_case_id);
      CREATE INDEX IF NOT EXISTS idx_patient_counselling_clinical_case_id ON public.patient_counselling(clinical_case_id);
      CREATE INDEX IF NOT EXISTS idx_pharmacist_interventions_clinical_case_id ON public.pharmacist_interventions(clinical_case_id);
      CREATE INDEX IF NOT EXISTS idx_drug_information_requests_clinical_case_id ON public.drug_information_requests(clinical_case_id);
      CREATE INDEX IF NOT EXISTS idx_adr_reports_clinical_case_id ON public.adr_reports(clinical_case_id);

      CREATE INDEX IF NOT EXISTS idx_patient_profiles_student_id ON public.patient_profiles(student_id);
      CREATE INDEX IF NOT EXISTS idx_patient_counselling_student_id ON public.patient_counselling(student_id);
      CREATE INDEX IF NOT EXISTS idx_pharmacist_interventions_student_id ON public.pharmacist_interventions(student_id);
      CREATE INDEX IF NOT EXISTS idx_drug_information_requests_student_id ON public.drug_information_requests(student_id);
      CREATE INDEX IF NOT EXISTS idx_adr_reports_student_id ON public.adr_reports(student_id);

      -- Clinical Cases search fields
      CREATE INDEX IF NOT EXISTS idx_cases_student ON public.clinical_cases(student_id);
      CREATE INDEX IF NOT EXISTS idx_cases_preceptor ON public.clinical_cases(preceptor_id);
      CREATE INDEX IF NOT EXISTS idx_cases_college ON public.clinical_cases(college_id);
      CREATE INDEX IF NOT EXISTS idx_cases_overall_case_status ON public.clinical_cases(overall_case_status);
      CREATE INDEX IF NOT EXISTS idx_clinical_cases_submitted_at ON public.clinical_cases(submitted_at);
      CREATE INDEX IF NOT EXISTS idx_clinical_cases_approved_at ON public.clinical_cases(approved_at);

      -- Student roll number index
      CREATE INDEX IF NOT EXISTS idx_students_roll_number ON public.students(roll_number);

      -- IP/OP Number index if column exists (e.g. ip_no in patient_profiles)
      CREATE INDEX IF NOT EXISTS idx_patient_profiles_ip_no ON public.patient_profiles(ip_no);
    `);
    console.log('✅ Search optimization indexes verified and created.');

    console.log('\n🌟 SUCCESS: Database audit and synchronization completed with 0 errors!');
  } catch (error) {
    console.error('❌ Database audit sync failed:', error.message);
  } finally {
    await client.end();
  }
}

performAuditSync();
