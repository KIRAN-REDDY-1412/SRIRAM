const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixConstraint() {
  await client.connect();
  console.log('=== FIXING CLINICAL_CASES STATUS CHECK CONSTRAINT ===');

  try {
    // 1. Drop existing restricted check constraint
    await client.query(`
      ALTER TABLE public.clinical_cases 
      DROP CONSTRAINT IF EXISTS clinical_cases_status_check;
    `);
    console.log('✅ Dropped old clinical_cases_status_check constraint');

    // 2. Add updated check constraint with 'Under Review' and 'Returned'
    await client.query(`
      ALTER TABLE public.clinical_cases 
      ADD CONSTRAINT clinical_cases_status_check 
      CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Returned', 'Approved', 'Reviewed'));
    `);
    console.log("✅ Added updated clinical_cases_status_check constraint with ['Draft', 'Submitted', 'Under Review', 'Returned', 'Approved', 'Reviewed']");

    // 3. Verify new constraint definition
    const res = await client.query(`
      SELECT conname, pg_get_constraintdef(oid)
      FROM pg_constraint
      WHERE conrelid = 'public.clinical_cases'::regclass
        AND conname = 'clinical_cases_status_check';
    `);
    console.table(res.rows);

  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.end();
  }
}

fixConstraint();
