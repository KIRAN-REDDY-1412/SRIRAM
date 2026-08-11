const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:kNJuN5IIKtogQWKT@db.uvvzhrvrqtqwyhlptvnx.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkPolicy() {
  await client.connect();
  const res = await client.query(`
    SELECT tablename, policyname, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'clinical_cases';
  `);
  console.log(res.rows);
  await client.end();
}

checkPolicy().catch(console.error);
