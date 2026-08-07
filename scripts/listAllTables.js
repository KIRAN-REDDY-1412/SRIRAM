import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function listAllTables() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('--- ALL PUBLIC TABLES ---');
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.table(res.rows);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

listAllTables();
