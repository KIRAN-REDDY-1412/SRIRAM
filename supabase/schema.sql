-- ====================================================================
-- PharmDVerse Complete Phase 1 Database Schema for Supabase (PostgreSQL)
-- Compatible with Express.js, Prisma ORM, and Supabase RLS
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

-- ====================================================================
-- TABLE 1: registration_requests
-- Purpose: Stores college registration requests submitted from Landing Page.
-- ====================================================================
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

-- Trigger for registration_requests updated_at
DROP TRIGGER IF EXISTS set_updated_at_registration_requests ON public.registration_requests;
CREATE TRIGGER set_updated_at_registration_requests
    BEFORE UPDATE ON public.registration_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- TABLE 2: colleges
-- Purpose: Stores approved pharmacy colleges with branding and admin auth credentials.
-- ====================================================================
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

-- Trigger for colleges updated_at
DROP TRIGGER IF EXISTS set_updated_at_colleges ON public.colleges;
CREATE TRIGGER set_updated_at_colleges
    BEFORE UPDATE ON public.colleges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- TABLE 3: subscriptions
-- Purpose: Stores subscription details assigned to colleges.
-- ====================================================================
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

-- Trigger for subscriptions updated_at
DROP TRIGGER IF EXISTS set_updated_at_subscriptions ON public.subscriptions;
CREATE TRIGGER set_updated_at_subscriptions
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key for colleges.subscription_id referencing subscriptions.id
ALTER TABLE public.colleges 
    DROP CONSTRAINT IF EXISTS fk_colleges_subscription,
    ADD CONSTRAINT fk_colleges_subscription 
    FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- ====================================================================
-- TABLE 4: super_admin
-- Purpose: Stores Super Admin login credentials.
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.super_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'SUPER_ADMIN',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Trigger for super_admin updated_at
DROP TRIGGER IF EXISTS set_updated_at_super_admin ON public.super_admin;
CREATE TRIGGER set_updated_at_super_admin
    BEFORE UPDATE ON public.super_admin
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- TABLE 5: preceptors
-- Purpose: Stores preceptors assigned to a specific college.
-- ====================================================================
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

-- Trigger for preceptors updated_at
DROP TRIGGER IF EXISTS set_updated_at_preceptors ON public.preceptors;
CREATE TRIGGER set_updated_at_preceptors
    BEFORE UPDATE ON public.preceptors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- TABLE 6: students
-- Purpose: Stores PharmD students enrolled in a specific college.
-- ====================================================================
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

-- Trigger for students updated_at
DROP TRIGGER IF EXISTS set_updated_at_students ON public.students;
CREATE TRIGGER set_updated_at_students
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- TABLE 7: student_preceptor_assignments
-- Purpose: Links PharmD students to assigned preceptors within a college.
-- ====================================================================
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

-- Trigger for student_preceptor_assignments updated_at
DROP TRIGGER IF EXISTS set_updated_at_assignments ON public.student_preceptor_assignments;
CREATE TRIGGER set_updated_at_assignments
    BEFORE UPDATE ON public.student_preceptor_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- INDEXES FOR FREQUENTLY SEARCHED COLUMNS
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_registration_requests_email ON public.registration_requests(email);
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON public.registration_requests(status);

CREATE INDEX IF NOT EXISTS idx_colleges_code ON public.colleges(college_code);
CREATE INDEX IF NOT EXISTS idx_colleges_status ON public.colleges(status);
CREATE INDEX IF NOT EXISTS idx_colleges_admin_username ON public.colleges(college_admin_username);

CREATE INDEX IF NOT EXISTS idx_subscriptions_college_id ON public.subscriptions(college_id);
CREATE INDEX IF NOT EXISTS idx_preceptors_college_id ON public.preceptors(college_id);
CREATE INDEX IF NOT EXISTS idx_students_college_id ON public.students(college_id);

CREATE INDEX IF NOT EXISTS idx_assignments_college ON public.student_preceptor_assignments(college_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON public.student_preceptor_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_preceptor ON public.student_preceptor_assignments(preceptor_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.student_preceptor_assignments(status);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ====================================================================
ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preceptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_preceptor_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow All Operations Registration Requests" ON public.registration_requests;
DROP POLICY IF EXISTS "Allow All Operations Colleges" ON public.colleges;
DROP POLICY IF EXISTS "Allow All Operations Subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow All Operations Super Admin" ON public.super_admin;
DROP POLICY IF EXISTS "Allow All Operations Preceptors" ON public.preceptors;
DROP POLICY IF EXISTS "Allow All Operations Students" ON public.students;
DROP POLICY IF EXISTS "Allow All Operations Assignments" ON public.student_preceptor_assignments;

CREATE POLICY "Allow All Operations Registration Requests" ON public.registration_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations Colleges" ON public.colleges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations Subscriptions" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations Super Admin" ON public.super_admin FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations Preceptors" ON public.preceptors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations Students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations Assignments" ON public.student_preceptor_assignments FOR ALL USING (true) WITH CHECK (true);
