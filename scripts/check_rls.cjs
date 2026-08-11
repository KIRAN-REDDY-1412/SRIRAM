const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:kNJuN5IIKtogQWKT@db.uvvzhrvrqtqwyhlptvnx.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkRLS() {
  await client.connect();
  
  const rlsStatus = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public';
  `);
  
  console.log('--- TABLE RLS STATUS ---');
  for (const row of rlsStatus.rows) {
    console.log(`${row.tablename.padEnd(30)} : RLS Enabled = ${row.rowsecurity}`);
  }

  const policies = await client.query(`
    SELECT tablename, policyname, cmd 
    FROM pg_policies 
    WHERE schemaname = 'public';
  `);
  
  console.log('\n--- EXISTING POLICIES ---');
  for (const p of policies.rows) {
    console.log(`${p.tablename.padEnd(30)} | ${p.cmd.padEnd(6)} | ${p.policyname}`);
  }

  await client.end();
}

checkRLS().catch(console.error);
