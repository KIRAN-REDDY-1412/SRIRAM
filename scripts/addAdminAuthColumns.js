import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function addAdminAuthColumns() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Adding college_admin_username and college_admin_password_hash columns to colleges table...');
    
    await client.query(`
      ALTER TABLE public.colleges 
      ADD COLUMN IF NOT EXISTS college_admin_username TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS college_admin_password_hash TEXT;
    `);

    console.log('SUCCESS: college_admin_username and college_admin_password_hash columns added to colleges table!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

addAdminAuthColumns();
