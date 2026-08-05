-- ====================================================================
-- PharmDVerse Phase 1 Database Schema for Supabase (PostgreSQL)
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
-- INDEXES FOR FREQUENTLY SEARCHED COLUMNS
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_registration_requests_email ON public.registration_requests(email);
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON public.registration_requests(status);

CREATE INDEX IF NOT EXISTS idx_colleges_code ON public.colleges(college_code);
CREATE INDEX IF NOT EXISTS idx_colleges_status ON public.colleges(status);
CREATE INDEX IF NOT EXISTS idx_colleges_admin_username ON public.colleges(college_admin_username);
CREATE INDEX IF NOT EXISTS idx_colleges_registration_request ON public.colleges(registration_request_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_college_id ON public.subscriptions(college_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_super_admin_email ON public.super_admin(email);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- Enable open policies so anon API key can SELECT, INSERT, UPDATE, DELETE
-- ====================================================================
ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow All Operations Registration Requests" ON public.registration_requests;
DROP POLICY IF EXISTS "Allow All Operations Colleges" ON public.colleges;
DROP POLICY IF EXISTS "Allow All Operations Subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow All Operations Super Admin" ON public.super_admin;

-- Create open policies for all roles (anon, authenticated, service_role)
CREATE POLICY "Allow All Operations Registration Requests" ON public.registration_requests
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow All Operations Colleges" ON public.colleges
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow All Operations Subscriptions" ON public.subscriptions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow All Operations Super Admin" ON public.super_admin
    FOR ALL USING (true) WITH CHECK (true);
