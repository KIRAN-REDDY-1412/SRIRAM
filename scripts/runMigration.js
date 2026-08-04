import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL Direct Connection URI
const connectionString = 'postgresql://postgres:kNJuN5IIKtogQWKT@db.uvvzhrvrqtqwyhlptvnx.supabase.co:5432/postgres';

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Supabase!');

    const schemaSqlPath = path.join(__dirname, '../supabase/schema.sql');
    const sqlScript = fs.readFileSync(schemaSqlPath, 'utf8');

    console.log('Executing Phase 1 SQL Migration schema...');
    await client.query(sqlScript);
    console.log('SUCCESS: All Phase 1 tables (registration_requests, colleges, subscriptions, super_admin), indexes, and policies created in Supabase!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

runMigration();
