import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function revertAccreditationColumns() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to Supabase Database!');
    console.log('Altering colleges table to drop all accreditation and portal visibility columns...');

    await client.query(`
      ALTER TABLE public.colleges
        DROP COLUMN IF EXISTS naac_enabled,
        DROP COLUMN IF EXISTS naac_grade,
        DROP COLUMN IF EXISTS naac_valid_until,
        DROP COLUMN IF EXISTS naac_logo_url,
        
        DROP COLUMN IF EXISTS nba_enabled,
        DROP COLUMN IF EXISTS nba_programs,
        DROP COLUMN IF EXISTS nba_valid_until,
        DROP COLUMN IF EXISTS nba_logo_url,
        
        DROP COLUMN IF EXISTS pci_enabled,
        DROP COLUMN IF EXISTS pci_logo_url,
        
        DROP COLUMN IF EXISTS aicte_enabled,
        DROP COLUMN IF EXISTS aicte_logo_url,
        
        DROP COLUMN IF EXISTS nirf_enabled,
        DROP COLUMN IF EXISTS nirf_rank,
        DROP COLUMN IF EXISTS nirf_year,
        
        DROP COLUMN IF EXISTS show_naac_on_portal,
        DROP COLUMN IF EXISTS show_nba_on_portal,
        DROP COLUMN IF EXISTS show_pci_on_portal,
        DROP COLUMN IF EXISTS show_aicte_on_portal,
        DROP COLUMN IF EXISTS show_nirf_on_portal,
        
        DROP COLUMN IF EXISTS show_logo_on_portal,
        DROP COLUMN IF EXISTS show_name_on_portal,
        DROP COLUMN IF EXISTS show_description_on_portal,
        DROP COLUMN IF EXISTS show_autonomous_on_portal,
        DROP COLUMN IF EXISTS show_website_on_portal,
        DROP COLUMN IF EXISTS show_address_on_portal;
    `);

    console.log('✅ All accreditation and portal visibility columns successfully dropped from colleges table.');
  } catch (error) {
    console.error('❌ Reverting colleges table failed:', error.message);
  } finally {
    await client.end();
  }
}

revertAccreditationColumns();
