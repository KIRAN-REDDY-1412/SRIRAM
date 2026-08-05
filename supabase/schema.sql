-- ====================================================================
-- PharmDVerse Complete Database Schema for Supabase (PostgreSQL)
-- ====================================================================

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update the updated_at timestamp column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TABLE 1: registration_requests
CREATE TABLE IF NOT EXISTS public.registration_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    rejected_at TIMESTAMP WITH TIME ZONE NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- TABLE 2: colleges
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_request_id UUID NULL REFERENCES public.registration_requests(id) ON DELETE CASCADE ON UPDATE CASCADE,
    college_code VARCHAR(50) NOT NULL UNIQUE,
    college_name VARCHAR(255) NOT NULL,
    college_logo TEXT NULL,
    college_logo_url TEXT NULL,
    college_description TEXT NULL,
    college_admin_username TEXT NULL UNIQUE,
    college_admin_password_hash TEXT NULL,
    address TEXT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NULL,
    university_affiliation TEXT NULL,
    pci_approval_number VARCHAR(100) NULL,
    principal_name VARCHAR(150) NULL,
    principal_mobile VARCHAR(20) NULL,
    principal_email VARCHAR(255) NULL,
    subscription_id UUID NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- TABLE 3: subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
    plan_name VARCHAR(50) NOT NULL DEFAULT 'Professional' CHECK (plan_name IN ('Basic', 'Professional', 'Enterprise')),
    subscription_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subscription_expiry_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    maximum_students INTEGER NOT NULL DEFAULT 600,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- TABLE 4: preceptors
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

-- TABLE 5: students
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- TABLE 6: student_preceptor_assignments
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

-- TABLE 7: clinical_cases
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

-- TABLE 8: patient_profiles
CREATE TABLE IF NOT EXISTS public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_case_id UUID NOT NULL UNIQUE REFERENCES public.clinical_cases(id) ON DELETE CASCADE ON UPDATE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
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
    chief_complaints TEXT NULL,
    past_medical_history TEXT NULL,
    past_medication_history TEXT NULL,
    family_history TEXT NULL,
    smoker_pack_day VARCHAR(50) NULL,
    smoker_duration VARCHAR(50) NULL,
    alcoholic_amount_day VARCHAR(50) NULL,
    alcoholic_duration VARCHAR(50) NULL,
    allergy_food TEXT NULL,
    allergy_drugs TEXT NULL,
    marital_status VARCHAR(50) NULL,
    cyanosis VARCHAR(100) NULL,
    icterus VARCHAR(100) NULL,
    pallor VARCHAR(100) NULL,
    cvs TEXT NULL,
    gi TEXT NULL,
    rs TEXT NULL,
    cns TEXT NULL,
    provisional_diagnosis TEXT NULL,
    final_diagnosis TEXT NULL,
    vital_signs JSONB DEFAULT '[]'::jsonb,
    other_investigations TEXT NULL,
    discharge_summary TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- TABLE 9: patient_counselling
CREATE TABLE IF NOT EXISTS public.patient_counselling (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_case_id UUID NOT NULL UNIQUE REFERENCES public.clinical_cases(id) ON DELETE CASCADE ON UPDATE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
    counselling_date DATE NOT NULL DEFAULT CURRENT_DATE,
    counselling_time VARCHAR(20) NULL,
    patient_type VARCHAR(20) NOT NULL DEFAULT 'In patient',
    ip_op_number VARCHAR(50) NULL,
    unit_ward VARCHAR(100) NULL,
    age VARCHAR(20) NULL,
    sex VARCHAR(20) NULL,
    allergies TEXT NULL,
    specific_background_collected BOOLEAN NOT NULL DEFAULT false,
    disease_counselled TEXT NULL,
    medications_counselled TEXT NULL,
    points_covered JSONB DEFAULT '[]'::jsonb,
    major_barriers_involved BOOLEAN NOT NULL DEFAULT false,
    barrier_details TEXT NULL,
    barrier_overcome BOOLEAN NOT NULL DEFAULT false,
    time_taken VARCHAR(50) NULL,
    counselling_provided_to VARCHAR(50) NOT NULL DEFAULT 'Patient',
    representative_reasons JSONB DEFAULT '[]'::jsonb,
    representative_other_reason TEXT NULL,
    counselling_aids_used TEXT NULL,
    counselling_material_provided TEXT NULL,
    understanding_ascertained BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- TABLE 10: pharmacist_interventions
CREATE TABLE IF NOT EXISTS public.pharmacist_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_case_id UUID NOT NULL UNIQUE REFERENCES public.clinical_cases(id) ON DELETE CASCADE ON UPDATE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
    patient_name VARCHAR(150) NOT NULL,
    age VARCHAR(20) NULL,
    sex VARCHAR(20) NULL,
    date_of_intervention DATE NOT NULL DEFAULT CURRENT_DATE,
    ip_op_no VARCHAR(50) NULL,
    ward VARCHAR(100) NULL,
    present_diagnosis TEXT NULL,
    prescription_details JSONB DEFAULT '[]'::jsonb,
    prescription_problems JSONB DEFAULT '[]'::jsonb,
    prescription_problem_other TEXT NULL,
    description_of_problem TEXT NULL,
    action_taken JSONB DEFAULT '[]'::jsonb,
    action_taken_other TEXT NULL,
    recommendations JSONB DEFAULT '[]'::jsonb,
    recommendation_other TEXT NULL,
    background_info_collected BOOLEAN NOT NULL DEFAULT true,
    discussed_with_physician BOOLEAN NOT NULL DEFAULT true,
    suggestions_appropriate_time BOOLEAN NOT NULL DEFAULT true,
    accepted BOOLEAN NOT NULL DEFAULT true,
    changed BOOLEAN NOT NULL DEFAULT true,
    reasons_if_no TEXT NULL,
    significance_of_intervention VARCHAR(50) NOT NULL DEFAULT 'Moderate',
    outcome VARCHAR(50) NOT NULL DEFAULT 'Positive',
    references_text TEXT NULL,
    follow_up TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS POLICIES FOR SUPABASE
ALTER TABLE public.pharmacist_interventions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Operations Pharmacist Interventions" ON public.pharmacist_interventions;
CREATE POLICY "Allow All Operations Pharmacist Interventions" ON public.pharmacist_interventions FOR ALL USING (true) WITH CHECK (true);
