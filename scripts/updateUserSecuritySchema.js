import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function updateSchema() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL Database!');

    // 1. Add security columns to students table
    console.log('Adding security columns to students table...');
    await client.query(`
      ALTER TABLE public.students 
      ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE NULL,
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE NULL,
      ADD COLUMN IF NOT EXISTS force_password_reset BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;
    `);

    // 2. Add security columns to preceptors table
    console.log('Adding security columns to preceptors table...');
    await client.query(`
      ALTER TABLE public.preceptors 
      ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE NULL,
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE NULL,
      ADD COLUMN IF NOT EXISTS force_password_reset BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;
    `);

    // 3. Create password_audit_logs table
    console.log('Creating password_audit_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.password_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('Student', 'Preceptor')),
        action VARCHAR(100) NOT NULL CHECK (action IN ('Password Changed', 'Password Reset')),
        performed_by UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
    `);

    // Enable RLS on password_audit_logs
    await client.query('ALTER TABLE public.password_audit_logs ENABLE ROW LEVEL SECURITY;');
    await client.query('DROP POLICY IF EXISTS "Allow All password_audit_logs" ON public.password_audit_logs;');
    await client.query(`
      CREATE POLICY "Allow All password_audit_logs" ON public.password_audit_logs
      FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('✅ Database security schema successfully updated!');
  } catch (error) {
    console.error('❌ Database schema update failed:', error.message);
  } finally {
    await client.end();
  }
}

updateSchema();
