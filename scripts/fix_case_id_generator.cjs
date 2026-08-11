const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.uvvzhrvrqtqwyhlptvnx:kNJuN5IIKtogQWKT@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixCaseIdGenerator() {
  await client.connect();
  console.log('=== Fixing Case ID Generator & NULL case_numbers ===\n');

  // 1. Fix existing null case_numbers and roll_numbers
  await client.query(`
    UPDATE public.clinical_cases c
    SET 
      case_number = COALESCE(c.case_number, NULLIF(regexp_replace(c.case_id, '^.*-(\\d+)$', '$1'), c.case_id)::integer, 1),
      roll_number = COALESCE(c.roll_number, s.roll_number)
    FROM public.students s
    WHERE c.student_id = s.id AND (c.case_number IS NULL OR c.roll_number IS NULL);
  `);
  console.log('✅ Updated null case_number and roll_number values for existing cases!');

  // 2. Update create_clinical_case function
  const sql = `
  CREATE OR REPLACE FUNCTION public.create_clinical_case(
      p_college_id UUID,
      p_student_id UUID,
      p_preceptor_id UUID,
      p_hospital_name TEXT,
      p_department TEXT,
      p_ward_unit TEXT,
      p_ip_op_type TEXT,
      p_date_of_admission DATE,
      p_academic_year TEXT DEFAULT '2026–2027',
      p_status TEXT DEFAULT 'Draft'
  ) RETURNS JSONB AS $$
  DECLARE
      v_college_code TEXT;
      v_roll_number TEXT;
      v_year TEXT;
      v_case_number INTEGER;
      v_case_id TEXT;
      v_new_id UUID;
      v_inserted BOOLEAN := FALSE;
      v_retries INTEGER := 0;
  BEGIN
      -- Fetch college code
      SELECT college_code INTO v_college_code
      FROM public.colleges
      WHERE id = p_college_id;
      
      IF v_college_code IS NULL OR v_college_code = '' THEN
          v_college_code := 'AMRMCP';
      END IF;

      -- Fetch student roll number
      SELECT roll_number INTO v_roll_number
      FROM public.students
      WHERE id = p_student_id;

      -- Current Year
      v_year := to_char(CURRENT_DATE, 'YYYY');

      -- Get base case number for this student using max of case_number, parsed suffix, or count
      SELECT COALESCE(
          GREATEST(
              MAX(case_number),
              MAX(NULLIF(regexp_replace(case_id, '^.*-(\\d+)$', '$1'), case_id)::integer),
              COUNT(*)
          ), 0) + 1 INTO v_case_number 
      FROM public.clinical_cases 
      WHERE student_id = p_student_id;

      -- Concurrency handling loop (max 10 retries)
      WHILE NOT v_inserted AND v_retries < 10 LOOP
          BEGIN
              -- Format Case ID: e.g. AMRMCP-2026-Y22PHD0314-0001
              v_case_id := v_college_code || '-' || v_year || '-' || COALESCE(v_roll_number, 'UNKNOWN') || '-' || lpad(v_case_number::text, 4, '0');

              -- Insert directly
              INSERT INTO public.clinical_cases (
                  college_id,
                  student_id,
                  preceptor_id,
                  hospital_name,
                  department,
                  ward_unit,
                  ip_op_type,
                  date_of_admission,
                  date_of_collection,
                  academic_year,
                  status,
                  case_number,
                  roll_number,
                  case_id
              ) VALUES (
                  p_college_id,
                  p_student_id,
                  p_preceptor_id,
                  p_hospital_name,
                  p_department,
                  p_ward_unit,
                  p_ip_op_type,
                  p_date_of_admission,
                  p_date_of_admission,
                  p_academic_year,
                  p_status,
                  v_case_number,
                  v_roll_number,
                  v_case_id
              ) RETURNING id, case_id INTO v_new_id, v_case_id;

              v_inserted := TRUE;
          EXCEPTION WHEN unique_violation THEN
              v_case_number := v_case_number + 1;
              v_retries := v_retries + 1;
          END;
      END LOOP;

      IF v_inserted THEN
          RETURN jsonb_build_object(
              'success', true,
              'id', v_new_id,
              'case_id', v_case_id
          );
      ELSE
          RETURN jsonb_build_object(
              'success', false,
              'error', 'Failed to generate unique Case ID due to concurrent inserts. Please try again.'
          );
      END IF;
  END;
  $$ LANGUAGE plpgsql;
  `;

  await client.query(sql);
  console.log('✅ Updated create_clinical_case function in PostgreSQL!');

  const check = await client.query(`
    SELECT id, case_id, case_number, student_id, roll_number 
    FROM public.clinical_cases;
  `);
  console.table(check.rows);

  await client.end();
}

fixCaseIdGenerator().catch(console.error);
