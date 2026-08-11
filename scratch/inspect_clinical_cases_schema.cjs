const { Client } = require('pg');

const dbConfig = {
  connectionString: 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
};

async function inspectSchema() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log('=== 1. CLINICAL_CASES COLUMNS ===');
    const colsRes = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clinical_cases'
      ORDER BY ordinal_position;
    `);
    console.table(colsRes.rows);

    console.log('=== 2. DISTINCT STATUS VALUES IN CLINICAL_CASES ===');
    const statusRes = await client.query(`
      SELECT status, count(*) 
      FROM clinical_cases 
      GROUP BY status;
    `);
    console.table(statusRes.rows);

    console.log('=== 3. RLS POLICIES ON CLINICAL_CASES ===');
    const rlsRes = await client.query(`
      SELECT policyname, roles, cmd, qual, with_check
      FROM pg_policies
      WHERE tablename = 'clinical_cases';
    `);
    console.table(rlsRes.rows);

    console.log('=== 4. SAMPLE CLINICAL_CASES ROWS ===');
    const sampleRes = await client.query(`
      SELECT id, case_id, student_id, preceptor_id, status, submitted_at, approved_at, returned_at, case_locked, created_at, updated_at
      FROM clinical_cases
      LIMIT 10;
    `);
    console.table(sampleRes.rows);

  } catch (err) {
    console.error('Inspection error:', err);
  } finally {
    await client.end();
  }
}

inspectSchema();
