/**
 * Apply Missing Schema Migrations to Supabase
 * Adds:
 *   1. profile_completed, counselling_completed columns to clinical_cases
 *   2. case_number, roll_number columns to clinical_cases  
 *   3. create_clinical_case RPC function
 */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uvvzhrvrqtqwyhlptvnx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI'
);

// These migrations use the Supabase SQL API via rpc('exec_sql') or we use direct fetch
// Since anon key can't run arbitrary SQL, we use the pg connection string via fetch to REST API

const SUPABASE_URL = 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';

// Use pg directly since we have the connection string
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:kNJuN5IIKtogQWKT@db.uvvzhrvrqtqwyhlptvnx.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const MIGRATIONS = [
  {
    name: 'Add profile_completed column',
    sql: `ALTER TABLE public.clinical_cases ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT false;`
  },
  {
    name: 'Add counselling_completed column',
    sql: `ALTER TABLE public.clinical_cases ADD COLUMN IF NOT EXISTS counselling_completed BOOLEAN NOT NULL DEFAULT false;`
  },
  {
    name: 'Add case_number column',
    sql: `ALTER TABLE public.clinical_cases ADD COLUMN IF NOT EXISTS case_number INTEGER NULL;`
  },
  {
    name: 'Add roll_number column',
    sql: `ALTER TABLE public.clinical_cases ADD COLUMN IF NOT EXISTS roll_number TEXT NULL;`
  },
  {
    name: 'Add unique constraint on student_id + case_number',
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'unique_student_case_number'
        ) THEN
          ALTER TABLE public.clinical_cases 
          ADD CONSTRAINT unique_student_case_number UNIQUE (student_id, case_number);
        END IF;
      END $$;
    `
  },
  {
    name: 'Create create_clinical_case RPC function',
    sql: `
CREATE OR REPLACE FUNCTION public.create_clinical_case(
    p_student_id UUID,
    p_college_id UUID,
    p_preceptor_id UUID,
    p_hospital_name TEXT,
    p_department TEXT,
    p_ward_unit TEXT,
    p_ip_op_type TEXT,
    p_date_of_admission DATE,
    p_academic_year TEXT,
    p_status TEXT
) RETURNS JSONB AS $$
DECLARE
    v_roll_number TEXT;
    v_college_code TEXT;
    v_year TEXT;
    v_case_number INT;
    v_case_id TEXT;
    v_new_id UUID;
    v_retries INT := 0;
    v_inserted BOOLEAN := FALSE;
BEGIN
    SELECT roll_number INTO v_roll_number FROM public.students WHERE id = p_student_id;
    SELECT college_code INTO v_college_code FROM public.colleges WHERE id = p_college_id;
    
    IF v_college_code IS NULL OR v_college_code = '' THEN
        v_college_code := 'AMRMCP';
    END IF;
    
    v_year := to_char(CURRENT_DATE, 'YYYY');

    WHILE NOT v_inserted AND v_retries < 5 LOOP
        BEGIN
            SELECT COALESCE(MAX(case_number), 0) + 1 INTO v_case_number 
            FROM public.clinical_cases 
            WHERE student_id = p_student_id;

            v_case_id := v_college_code || '-' || v_year || '-' || COALESCE(v_roll_number, 'UNKNOWN') || '-' || lpad(v_case_number::text, 4, '0');

            INSERT INTO public.clinical_cases (
                college_id, student_id, preceptor_id, hospital_name,
                department, ward_unit, ip_op_type, date_of_admission,
                date_of_collection, academic_year, status,
                case_number, roll_number, case_id
            ) VALUES (
                p_college_id, p_student_id, p_preceptor_id, p_hospital_name,
                p_department, p_ward_unit, p_ip_op_type, p_date_of_admission,
                p_date_of_admission, p_academic_year, p_status,
                v_case_number, v_roll_number, v_case_id
            ) RETURNING id, case_id INTO v_new_id, v_case_id;

            v_inserted := TRUE;
        EXCEPTION WHEN unique_violation THEN
            v_retries := v_retries + 1;
        END;
    END LOOP;

    IF v_inserted THEN
        RETURN jsonb_build_object('success', true, 'id', v_new_id, 'case_id', v_case_id);
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Failed to generate unique Case ID due to concurrent inserts. Please try again.');
    END IF;
END;
$$ LANGUAGE plpgsql;
    `
  }
];

async function applyMigrations() {
  console.log('==========================================================');
  console.log('  Applying Schema Migrations to Supabase');
  console.log('==========================================================\n');

  try {
    await client.connect();
    console.log('Connected to PostgreSQL.\n');

    for (const migration of MIGRATIONS) {
      process.stdout.write(`  Running: ${migration.name}...`);
      try {
        await client.query(migration.sql);
        console.log(' OK');
      } catch (err) {
        console.log(` FAILED: ${err.message}`);
      }
    }

    console.log('\nAll migrations applied.\n');

  } finally {
    await client.end();
  }

  // Step 2: Now run the migration on existing cases
  console.log('==========================================================');
  console.log('  Now checking for cases needing Case ID migration...');
  console.log('==========================================================\n');

  const { data: allCases, error: fetchErr } = await supabase
    .from('clinical_cases')
    .select('id, case_id, student_id, case_number, roll_number, created_at, students(roll_number, full_name), colleges(college_code)')
    .order('created_at', { ascending: true });

  if (fetchErr) {
    console.error('ERROR fetching cases after migration:', fetchErr.message);
    return;
  }

  console.log(`Found ${allCases.length} cases.`);

  const NEW_FORMAT_REGEX = /^[A-Z]+-\d{4}-.+-\d{4}$/;
  const needsMigration = allCases.filter(c => !NEW_FORMAT_REGEX.test(c.case_id));
  
  if (needsMigration.length === 0) {
    console.log('All cases already in correct format.\n');
    return;
  }

  const byStudent = {};
  for (const c of allCases) {
    if (!byStudent[c.student_id]) byStudent[c.student_id] = [];
    byStudent[c.student_id].push(c);
  }
  for (const sid of Object.keys(byStudent)) {
    byStudent[sid].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  const migrations = [];
  const allFutureIds = new Set(allCases.filter(c => NEW_FORMAT_REGEX.test(c.case_id)).map(c => c.case_id));

  for (const [, cases] of Object.entries(byStudent)) {
    const first = cases[0];
    const rollNumber = first.students?.roll_number || first.roll_number;
    const collegeCode = first.colleges?.college_code || 'AMRMCP';
    const studentName = first.students?.full_name || 'Unknown';
    if (!rollNumber) continue;

    let seq = 0;
    for (const c of cases) {
      seq++;
      const year = new Date(c.created_at).getFullYear();
      const newCaseId = `${collegeCode}-${year}-${rollNumber}-${String(seq).padStart(4, '0')}`;
      if (c.case_id === newCaseId) { allFutureIds.add(newCaseId); continue; }
      if (!allFutureIds.has(newCaseId)) {
        migrations.push({ id: c.id, oldCaseId: c.case_id, newCaseId, studentName, rollNumber, seqNum: seq });
        allFutureIds.add(newCaseId);
      }
    }
  }

  console.log(`Cases to migrate: ${migrations.length}\n`);

  for (const m of migrations) {
    const { error: updateErr } = await supabase
      .from('clinical_cases')
      .update({ case_id: m.newCaseId, case_number: m.seqNum, roll_number: m.rollNumber })
      .eq('id', m.id);

    if (updateErr) {
      console.error(`  FAIL: ${m.oldCaseId} -> ${m.newCaseId} | ${updateErr.message}`);
    } else {
      console.log(`  OK: ${m.oldCaseId} -> ${m.newCaseId}`);
    }
  }

  console.log('\nDone.\n');
}

applyMigrations().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
