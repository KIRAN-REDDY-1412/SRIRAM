-- ResQAI PostgreSQL Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('victim', 'volunteer', 'admin')),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Volunteer Profiles
CREATE TABLE IF NOT EXISTS volunteer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skills TEXT[] DEFAULT '{}',
    availability BOOLEAN DEFAULT true,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Emergency Requests
CREATE TABLE IF NOT EXISTS emergency_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    disaster_type VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    people_count INT DEFAULT 1,
    injured_count INT DEFAULT 0,
    trapped BOOLEAN DEFAULT false,
    requested_help VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    priority_score INT DEFAULT 50,
    priority_reason TEXT,
    status VARCHAR(50) DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Assigned', 'En Route', 'Arrived', 'Resolved', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Emergency Status History
CREATE TABLE IF NOT EXISTS emergency_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_id UUID NOT NULL REFERENCES emergency_requests(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Volunteer Assignments
CREATE TABLE IF NOT EXISTS volunteer_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_id UUID NOT NULL REFERENCES emergency_requests(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'en_route', 'arrived', 'completed', 'cancelled')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    available_beds INT DEFAULT 0,
    emergency_capacity INT DEFAULT 0,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Shelters
CREATE TABLE IF NOT EXISTS shelters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity INT DEFAULT 0,
    occupied INT DEFAULT 0,
    resources TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Resources
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    quantity INT DEFAULT 0,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for spatial and status querying performance
CREATE INDEX IF NOT EXISTS idx_emergency_status ON emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_priority ON emergency_requests(priority);
CREATE INDEX IF NOT EXISTS idx_volunteer_availability ON volunteer_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_assignments_volunteer ON volunteer_assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_emergency ON volunteer_assignments(emergency_id);
