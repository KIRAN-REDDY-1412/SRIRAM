-- ====================================================================
-- PharmDVerse Database Schema for Supabase (PostgreSQL)
-- Execute this SQL script in Supabase SQL Editor (Dashboard -> SQL Editor)
-- ====================================================================

-- 1. Create College Registration Requests Table
CREATE TABLE IF NOT EXISTS public.college_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    address TEXT,
    district TEXT,
    pin_code TEXT,
    university_affiliation TEXT,
    pci_approval_no TEXT,
    code TEXT,
    initials TEXT,
    logo_bg TEXT DEFAULT 'from-teal-600 to-emerald-700',
    subscription_plan TEXT DEFAULT 'Professional',
    subscription_start_date DATE DEFAULT CURRENT_DATE,
    subscription_expiry_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    max_students_allowed INT DEFAULT 600,
    subscription_status TEXT DEFAULT 'Active',
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Active Colleges Table
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.college_requests(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT,
    pin_code TEXT,
    address TEXT,
    university_affiliation TEXT,
    pci_approval_no TEXT,
    principal_name TEXT,
    principal_mobile TEXT,
    principal_email TEXT,
    logo_bg TEXT DEFAULT 'from-emerald-600 to-teal-700',
    initials TEXT,
    students_count INT DEFAULT 600,
    portal_url TEXT,
    status TEXT DEFAULT 'Active Subscribed', -- 'Active Subscribed', 'Inactive', 'Expired'
    subscription_plan TEXT DEFAULT 'Professional', -- 'Basic', 'Professional', 'Enterprise'
    subscription_start_date DATE DEFAULT CURRENT_DATE,
    subscription_expiry_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    max_students_allowed INT DEFAULT 600,
    subscription_status TEXT DEFAULT 'Active', -- 'Active', 'Inactive'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Super Admin Auth Session Table (Optional backend extension)
CREATE TABLE IF NOT EXISTS public.super_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'super_admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.college_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- 5. Define Public RLS Policies
-- Allow anyone to read active colleges for landing page
CREATE POLICY "Public Read Active Colleges" ON public.colleges
    FOR SELECT USING (subscription_status = 'Active');

-- Allow public users to submit college registration requests
CREATE POLICY "Public Insert Registration Requests" ON public.college_requests
    FOR INSERT WITH CHECK (true);

-- Allow full access for authenticated service role / super admin
CREATE POLICY "Super Admin Full Access Requests" ON public.college_requests
    FOR ALL USING (true);

CREATE POLICY "Super Admin Full Access Colleges" ON public.colleges
    FOR ALL USING (true);
