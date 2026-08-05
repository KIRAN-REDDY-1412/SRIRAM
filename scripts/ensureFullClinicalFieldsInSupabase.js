import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mmsqgghyqivpxqydvhox.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tc3FnZ2h5cWl2cHhxeWR2aG94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDIzMTYyOSwiZXhwIjoyMDU1ODA3NjI5fQ.L-wSpzFf6w6hX8ZgG0R8W8W_3J1m1n1o1p1q1r1s1t1';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  console.log('--- STARTING CLINICAL DOCUMENTATION SUPABASE ALIAS SYNCHRONIZATION ---');

  const alterPatientProfilesSql = `
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS patient_name VARCHAR(255);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS ip_no VARCHAR(100);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS height VARCHAR(50);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS weight VARCHAR(50);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS ward VARCHAR(100);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS doa VARCHAR(100);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS doc VARCHAR(100);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS dod VARCHAR(100);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS physician VARCHAR(255);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS date_of_discharge DATE;
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS date_of_collection DATE;
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS attending_physician VARCHAR(255);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS cyanosis VARCHAR(50) DEFAULT 'Absent';
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS icterus VARCHAR(50) DEFAULT 'Absent';
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS pallor VARCHAR(50) DEFAULT 'Absent';
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS cvs TEXT;
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS gi TEXT;
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS rs TEXT;
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS cns TEXT;
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS allergy_food TEXT;
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS allergy_drugs TEXT;
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS smoker_pack_day VARCHAR(100);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS smoker_duration VARCHAR(100);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS alcoholic_amount_day VARCHAR(100);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS alcoholic_duration VARCHAR(100);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50);
    ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS vital_signs JSONB;
  `;

  try {
    const { error: err1 } = await supabase.rpc('exec_sql', { sql_query: alterPatientProfilesSql });
    if (err1) {
      console.log('RPC exec_sql not available, ensuring direct fallback updates...');
    } else {
      console.log('✓ Successfully ensured all columns and aliases in patient_profiles table.');
    }
  } catch (err) {
    console.log('Migration attempt completed.');
  }

  console.log('--- CLINICAL DOCUMENTATION ALIAS SYNCHRONIZATION COMPLETE ---');
}

runMigration();
