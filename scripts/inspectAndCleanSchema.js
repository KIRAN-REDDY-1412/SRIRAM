import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:kNJuN5IIKtogQWKT@db.uvvzhrvrqtqwyhlptvnx.supabase.co:5432/postgres';

async function inspectAndCleanSchema() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connecting to Supabase PostgreSQL database...');

    // 1. Inspect registration_requests columns
    const resReq = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'registration_requests';
    `);

    console.log('--- CURRENT REGISTRATION_REQUESTS COLUMNS ---');
    console.table(resReq.rows);

    // 2. Inspect colleges columns
    const resCol = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'colleges';
    `);

    console.log('--- CURRENT COLLEGES COLUMNS ---');
    console.table(resCol.rows);

    // 3. Inspect subscriptions columns
    const resSub = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'subscriptions';
    `);

    console.log('--- CURRENT SUBSCRIPTIONS COLUMNS ---');
    console.table(resSub.rows);

    // Drop unwanted extra columns from registration_requests if present
    const unwantedReqColumns = [
      'address', 'district', 'pin_code', 'university_affiliation', 
      'pci_approval_no', 'code', 'initials', 'logo_bg', 
      'subscription_plan', 'subscription_start_date', 'subscription_expiry_date', 
      'max_students_allowed', 'subscription_status'
    ];

    for (const col of unwantedReqColumns) {
      await client.query(`ALTER TABLE public.registration_requests DROP COLUMN IF EXISTS ${col};`);
    }

    // Drop unwanted extra columns from colleges if present
    const unwantedColColumns = [
      'students_count', 'portal_url', 'accreditation', 'request_id'
    ];

    for (const col of unwantedColColumns) {
      await client.query(`ALTER TABLE public.colleges DROP COLUMN IF EXISTS ${col};`);
    }

    console.log('✅ Unwanted columns dropped successfully!');

  } catch (err) {
    console.error('Inspection failed:', err.message);
  } finally {
    await client.end();
  }
}

inspectAndCleanSchema();
