-- ResQAI PostgreSQL Seed Data (Andhra Pradesh Emergency Network)

-- Passwords are verified bcrypt hash for 'password123': $2b$10$OGG6n5RRk.yWZ0OPQvu/KeAqsMRaFT3O8Te1EVVR4PpukXCGdKwg.

-- Clear existing data
TRUNCATE notifications, volunteer_assignments, emergency_status_history, emergency_requests, volunteer_profiles, users, hospitals, shelters, resources CASCADE;

-- Insert Seed Users
INSERT INTO users (id, name, email, password_hash, role, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'Ramesh Kumar (Victim)', 'victim@example.com', '$2b$10$OGG6n5RRk.yWZ0OPQvu/KeAqsMRaFT3O8Te1EVVR4PpukXCGdKwg.', 'victim', '+91 98765 43210'),
('22222222-2222-2222-2222-222222222222', 'Dr. Priya Sharma (Volunteer)', 'volunteer@example.com', '$2b$10$OGG6n5RRk.yWZ0OPQvu/KeAqsMRaFT3O8Te1EVVR4PpukXCGdKwg.', 'volunteer', '+91 98765 43211'),
('33333333-3333-3333-3333-333333333333', 'AP Disaster Command Center (Admin)', 'admin@example.com', '$2b$10$OGG6n5RRk.yWZ0OPQvu/KeAqsMRaFT3O8Te1EVVR4PpukXCGdKwg.', 'admin', '+91 80080 12345'),
('44444444-4444-4444-4444-444444444444', 'Suresh Naidu', 'suresh@example.com', '$2b$10$OGG6n5RRk.yWZ0OPQvu/KeAqsMRaFT3O8Te1EVVR4PpukXCGdKwg.', 'victim', '+91 98123 45678'),
('55555555-5555-5555-5555-555555555555', 'Kalyan Rescue Squad', 'kalyan@example.com', '$2b$10$OGG6n5RRk.yWZ0OPQvu/KeAqsMRaFT3O8Te1EVVR4PpukXCGdKwg.', 'volunteer', '+91 98234 56789'),
('66666666-6666-6666-6666-666666666666', 'Anita Rao', 'anita@example.com', '$2b$10$OGG6n5RRk.yWZ0OPQvu/KeAqsMRaFT3O8Te1EVVR4PpukXCGdKwg.', 'volunteer', '+91 98345 67890');

-- Volunteer Profiles (Coordinates near Visakhapatnam & Vijayawada)
INSERT INTO volunteer_profiles (user_id, skills, availability, latitude, longitude) VALUES
('22222222-2222-2222-2222-222222222222', ARRAY['First Aid', 'Paramedic', 'Boat Rescue'], true, 17.6868, 83.2185),
('55555555-5555-5555-5555-555555555555', ARRAY['Heavy Equipment', 'Rope Rescue', 'Firefighting'], true, 17.7200, 83.3000),
('66666666-6666-6666-6666-666666666666', ARRAY['Medical Supplies', 'Food Distribution'], true, 16.5062, 80.6480);

-- Hospitals in AP (Visakhapatnam, Vijayawada, Guntur)
INSERT INTO hospitals (id, name, latitude, longitude, available_beds, emergency_capacity, phone) VALUES
(gen_random_uuid(), 'King George Hospital (KGH) Visakhapatnam', 17.7088, 83.3025, 45, 120, '+91 891 2564891'),
(gen_random_uuid(), 'Apollo Hospital Health City Visakhapatnam', 17.7610, 83.3325, 18, 50, '+91 891 2727272'),
(gen_random_uuid(), 'Government General Hospital (GGH) Vijayawada', 16.5100, 80.6350, 60, 150, '+91 866 2574321'),
(gen_random_uuid(), 'Ramesh Hospitals Guntur', 16.3067, 80.4365, 25, 60, '+91 863 2377777');

-- Shelters in AP
INSERT INTO shelters (id, name, latitude, longitude, capacity, occupied, resources) VALUES
(gen_random_uuid(), 'Cyclone Relief Shelter - Beach Road Vizag', 17.7150, 83.3180, 500, 210, 'Food Packets, Clean Water, Medical Kits, Blankets'),
(gen_random_uuid(), 'MGM High School Disaster Relief Camp Vijayawada', 16.5150, 80.6200, 800, 340, 'Dry Rations, Drinking Water Tanks, Generators'),
(gen_random_uuid(), 'Guntur Municipal Indoor Stadium Shelter', 16.3100, 80.4400, 600, 120, 'First Aid, Tents, Portable Toilets');

-- Emergency Resources
INSERT INTO resources (id, name, type, quantity, location, status) VALUES
(gen_random_uuid(), 'Emergency Food Packets', 'Food', 2500, 'Vizag Central Hub', 'Available'),
(gen_random_uuid(), 'Drinking Water Cans (20L)', 'Water', 1200, 'Vijayawada Depot', 'Available'),
(gen_random_uuid(), 'Trauma Medical Kits', 'Medicine', 350, 'KGH Hospital Stock', 'Available'),
(gen_random_uuid(), 'Thermal Blankets', 'Blankets', 1800, 'Guntur Shelter', 'Available'),
(gen_random_uuid(), 'Motorized Inflatable Boats', 'Equipment', 15, 'Vizag Port NDRF Base', 'Available'),
(gen_random_uuid(), 'Portable Power Generators', 'Equipment', 40, 'Vijayawada Power Station', 'Available');

-- Seed Emergency Requests (Andhra Pradesh Locations)
INSERT INTO emergency_requests 
(id, user_id, disaster_type, description, latitude, longitude, people_count, injured_count, trapped, requested_help, priority, priority_score, priority_reason, status, created_at)
VALUES
(
    'e1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Flood',
    'Flash flood rising near Coastal Colony. 4 family members trapped on 1st floor roof, elderly person injured.',
    17.7000, 83.2500, 4, 1, true, 'Rescue',
    'CRITICAL', 94, 'People trapped on roof with severe flood levels and 1 reported injury requiring urgent evacuation.',
    'Submitted',
    NOW() - INTERVAL '15 minutes'
),
(
    'e2222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    'Cyclone',
    'High speed winds damaged roof near Simhachalam. Need urgent medical supplies and food.',
    17.7667, 83.2500, 6, 0, false, 'Medicine & Food',
    'HIGH', 78, 'Roof damage due to cyclone; 6 people stranded needing food and emergency medical assistance.',
    'Assigned',
    NOW() - INTERVAL '40 minutes'
),
(
    'e3333333-3333-3333-3333-333333333333',
    NULL,
    'Landslide',
    'Minor landslide blocking access road in Araku Valley. 2 vehicles stranded.',
    18.3273, 82.8775, 5, 0, false, 'Rescue Equipment',
    'MEDIUM', 55, 'Landslide road blockage with stranded vehicles, no immediate life-threatening injuries.',
    'Submitted',
    NOW() - INTERVAL '2 hours'
);

-- Seed Assignment for assigned request
INSERT INTO volunteer_assignments (id, emergency_id, volunteer_id, status, assigned_at) VALUES
(gen_random_uuid(), 'e2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'assigned', NOW() - INTERVAL '30 minutes');
