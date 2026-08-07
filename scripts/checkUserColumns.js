import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function checkUserColumns() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    for (const table of ['students', 'preceptors']) {
      console.log(`\nColumns for table: ${table}`);
      const res = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name IN (
          'password_changed_at', 'last_login_at', 'force_password_reset', 'failed_login_attempts'
        );
      `, [table]);
      console.table(res.rows);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUserColumns();
