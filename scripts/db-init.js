import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:5ZBKRN823doZtzcx@db.ioyupwrvosjdbqppumws.supabase.co:5432/postgres';

async function initDb() {
  console.log('Connecting to PostgreSQL database at:', connectionString.replace(/:[^:@]+@/, ':****@'));
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to PostgreSQL!');

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const seedPath = path.join(__dirname, '../database/seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('Executing database schema.sql...');
    await client.query(schemaSql);
    console.log('Schema created successfully.');

    console.log('Executing database seed.sql...');
    await client.query(seedSql);
    console.log('Seed data inserted successfully.');

    await client.end();
    console.log('Database initialization complete!');
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  }
}

initDb();
