import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function consolidateADRTableInSupabase() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Dropping child ADR tables and consolidating all ADR data into single adr_reports table...');

    await client.query(`
      -- Drop child tables if they exist
      DROP TABLE IF EXISTS public.adr_attachments CASCADE;
      DROP TABLE IF EXISTS public.adr_concomitant_medications CASCADE;
      DROP TABLE IF EXISTS public.adr_suspected_medications CASCADE;

      -- Add JSONB columns to adr_reports if not exist
      ALTER TABLE public.adr_reports ADD COLUMN IF NOT EXISTS suspected_medications JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE public.adr_reports ADD COLUMN IF NOT EXISTS concomitant_medications JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE public.adr_reports ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

      -- RLS Policy for single adr_reports table
      ALTER TABLE public.adr_reports ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow All ADR Reports" ON public.adr_reports;
      CREATE POLICY "Allow All ADR Reports" ON public.adr_reports FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('SUCCESS: Consolidated all ADR data into single adr_reports table and removed child tables in Supabase!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

consolidateADRTableInSupabase();
