import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function createDocumentBrandingTable() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    console.log('Updating colleges table and creating document_branding_settings table...');

    await client.query(`
      -- 1. Ensure columns exist on colleges table
      ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS is_autonomous BOOLEAN DEFAULT false;
      ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(255) NULL;
      ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS hospital_logo_url TEXT NULL;

      -- 2. Create document_branding_settings table
      CREATE TABLE IF NOT EXISTS public.document_branding_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          college_id UUID NOT NULL UNIQUE REFERENCES public.colleges(id) ON DELETE CASCADE ON UPDATE CASCADE,
          
          -- SECTION 2: HEADER SETTINGS
          show_college_logo BOOLEAN NOT NULL DEFAULT true,
          show_college_name BOOLEAN NOT NULL DEFAULT true,
          show_autonomous BOOLEAN NOT NULL DEFAULT true,
          show_hospital_logo BOOLEAN NOT NULL DEFAULT true,
          show_hospital_name BOOLEAN NOT NULL DEFAULT true,

          -- SECTION 3: WATERMARK SETTINGS
          watermark_enabled BOOLEAN NOT NULL DEFAULT true,
          watermark_text_line1 VARCHAR(150) NOT NULL DEFAULT 'PHARMDVERSE',
          watermark_text_line2 VARCHAR(150) NOT NULL DEFAULT 'Clinical Documentation System',
          watermark_opacity INTEGER NOT NULL DEFAULT 10,
          watermark_position VARCHAR(50) NOT NULL DEFAULT 'Center',

          -- SECTION 4: FOOTER SETTINGS
          footer_left_text VARCHAR(150) NOT NULL DEFAULT 'PharmDVerse',
          footer_center_text VARCHAR(255) NOT NULL DEFAULT 'Confidential Clinical Documentation',
          show_page_number BOOLEAN NOT NULL DEFAULT true,
          show_generated_datetime BOOLEAN NOT NULL DEFAULT true,

          -- SECTION 5: PAGE SETTINGS
          paper_size VARCHAR(20) NOT NULL DEFAULT 'A4',
          orientation VARCHAR(20) NOT NULL DEFAULT 'Portrait',
          margin_top VARCHAR(20) NOT NULL DEFAULT '15mm',
          margin_bottom VARCHAR(20) NOT NULL DEFAULT '15mm',
          margin_left VARCHAR(20) NOT NULL DEFAULT '15mm',
          margin_right VARCHAR(20) NOT NULL DEFAULT '15mm',

          -- SECTION 6: TYPOGRAPHY
          font_family VARCHAR(100) NOT NULL DEFAULT 'Times New Roman',
          title_font_size VARCHAR(20) NOT NULL DEFAULT '18pt',
          heading_font_size VARCHAR(20) NOT NULL DEFAULT '14pt',
          body_font_size VARCHAR(20) NOT NULL DEFAULT '12pt',

          -- SECTION 7: COLORS
          primary_color VARCHAR(30) NOT NULL DEFAULT '#0f172a',
          secondary_color VARCHAR(30) NOT NULL DEFAULT '#0284c7',
          table_header_color VARCHAR(30) NOT NULL DEFAULT '#f1f5f9',
          border_color VARCHAR(30) NOT NULL DEFAULT '#0f172a',
          text_color VARCHAR(30) NOT NULL DEFAULT '#0f172a',

          -- SECTION 8: TABLE SETTINGS
          zebra_striping BOOLEAN NOT NULL DEFAULT false,
          repeat_table_header BOOLEAN NOT NULL DEFAULT true,

          -- SECTION 9: SIGNATURE SETTINGS
          show_student_signature BOOLEAN NOT NULL DEFAULT true,
          show_preceptor_signature BOOLEAN NOT NULL DEFAULT true,

          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- RLS POLICY
      ALTER TABLE public.document_branding_settings ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow All Document Branding" ON public.document_branding_settings;
      CREATE POLICY "Allow All Document Branding" ON public.document_branding_settings FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('SUCCESS: document_branding_settings table created in Supabase with RLS!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

createDocumentBrandingTable();
