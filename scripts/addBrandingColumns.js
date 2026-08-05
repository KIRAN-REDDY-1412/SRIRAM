import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function addBrandingColumns() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Adding college_logo_url and college_description columns to colleges table...');
    
    await client.query(`
      ALTER TABLE public.colleges 
      ADD COLUMN IF NOT EXISTS college_logo_url TEXT NULL,
      ADD COLUMN IF NOT EXISTS college_description TEXT NULL;
    `);

    console.log('SUCCESS: college_logo_url and college_description columns added to colleges table!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

addBrandingColumns();
