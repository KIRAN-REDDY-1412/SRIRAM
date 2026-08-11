/**
 * Case ID Migration Script - Production Ready
 * Standardizes all existing clinical_cases to: AMRMCP-YYYY-ROLLNUMBER-XXXX
 * Handles missing case_number / roll_number columns gracefully.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://uvvzhrvrqtqwyhlptvnx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// New format regex: PREFIX-YYYY-ROLLNUMBER-XXXX
const NEW_FORMAT_REGEX = /^[A-Z]+-\d{4}-.+-\d{4}$/;

async function migrate() {
  console.log('==========================================================');
  console.log('  Case ID Migration: AMRMCP-YYYY-ROLLNUMBER-XXXX');
  console.log('==========================================================\n');

  // Step 1: Detect which optional columns exist
  console.log('Step 1: Detecting schema...');
  const { data: sampleCase, error: sampleErr } = await supabase
    .from('clinical_cases')
    .select('id, case_id, student_id, created_at')
    .limit(1)
    .maybeSingle();

  if (sampleErr) {
    console.error('ERROR fetching sample case:', sampleErr.message);
    process.exit(1);
  }

  // Try fetching with optional columns
  let hasCaseNumber = false;
  let hasRollNumber = false;

  const { error: extendedErr } = await supabase
    .from('clinical_cases')
    .select('case_number, roll_number')
    .limit(1);

  if (!extendedErr) {
    hasCaseNumber = true;
    hasRollNumber = true;
    console.log('  case_number column: EXISTS');
    console.log('  roll_number column: EXISTS');
  } else {
    console.log('  case_number / roll_number columns: NOT PRESENT (will skip updating them)');
  }

  // Step 2: Fetch all clinical cases
  console.log('\nStep 2: Fetching all clinical cases...');
  const selectFields = 'id, case_id, student_id, created_at, students(roll_number, full_name), colleges(college_code)';
  const { data: allCases, error: fetchErr } = await supabase
    .from('clinical_cases')
    .select(selectFields)
    .order('created_at', { ascending: true });

  if (fetchErr) {
    console.error('ERROR fetching cases:', fetchErr.message);
    process.exit(1);
  }

  console.log(`  Found ${allCases.length} total cases.`);

  const needsMigration = allCases.filter(c => !NEW_FORMAT_REGEX.test(c.case_id));
  const alreadyCorrect = allCases.filter(c => NEW_FORMAT_REGEX.test(c.case_id));

  console.log(`  Already correct format: ${alreadyCorrect.length}`);
  console.log(`  Need migration:         ${needsMigration.length}\n`);

  if (needsMigration.length === 0) {
    console.log('All cases already in correct format. Nothing to do.\n');
    return;
  }

  // Step 3: Group by student, sort by created_at
  const byStudent = {};
  for (const c of allCases) {
    if (!byStudent[c.student_id]) byStudent[c.student_id] = [];
    byStudent[c.student_id].push(c);
  }
  for (const sid of Object.keys(byStudent)) {
    byStudent[sid].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  // Step 4: Build migration plan
  const migrations = [];
  const skipped = [];
  const allFutureIds = new Set(alreadyCorrect.map(c => c.case_id));

  for (const [, cases] of Object.entries(byStudent)) {
    const firstCase = cases[0];
    const rollNumber = firstCase.students?.roll_number;
    const collegeCode = firstCase.colleges?.college_code || 'AMRMCP';
    const studentName = firstCase.students?.full_name || 'Unknown';

    if (!rollNumber) {
      for (const c of cases) {
        if (!NEW_FORMAT_REGEX.test(c.case_id)) {
          skipped.push({ id: c.id, caseId: c.case_id, studentName, reason: 'No roll number on student record' });
        }
      }
      continue;
    }

    let seq = 0;
    for (const c of cases) {
      seq++;
      const year = new Date(c.created_at).getFullYear();
      const newCaseId = `${collegeCode}-${year}-${rollNumber}-${String(seq).padStart(4, '0')}`;

      if (c.case_id === newCaseId) {
        allFutureIds.add(newCaseId);
        continue; // already exactly correct
      }

      if (allFutureIds.has(newCaseId)) {
        skipped.push({ id: c.id, caseId: c.case_id, studentName, reason: `Target ID ${newCaseId} already taken` });
      } else {
        migrations.push({ id: c.id, oldCaseId: c.case_id, newCaseId, studentName, rollNumber, seqNum: seq });
        allFutureIds.add(newCaseId);
      }
    }
  }

  // Step 5: Show plan
  console.log(`Step 3: Migration Plan`);
  console.log(`  To migrate: ${migrations.length}`);
  console.log(`  To skip:    ${skipped.length}\n`);

  for (const m of migrations) {
    console.log(`  [${m.studentName}] ${m.oldCaseId}  -->  ${m.newCaseId}`);
  }

  if (skipped.length > 0) {
    console.log('\n  SKIPPED:');
    for (const s of skipped) {
      console.log(`  [${s.studentName}] ${s.caseId} | ${s.reason}`);
    }
  }

  if (migrations.length === 0) {
    console.log('No actual migrations needed.\n');
    return;
  }

  // Step 6: Execute
  console.log('\nStep 4: Executing...\n');
  let ok = 0;
  let fail = 0;

  for (const m of migrations) {
    // Build update payload — only include optional columns if they exist
    const updatePayload = { case_id: m.newCaseId };
    if (hasCaseNumber) updatePayload.case_number = m.seqNum;
    if (hasRollNumber) updatePayload.roll_number = m.rollNumber;

    const { error: updateErr } = await supabase
      .from('clinical_cases')
      .update(updatePayload)
      .eq('id', m.id);

    if (updateErr) {
      console.error(`  FAIL: ${m.oldCaseId} --> ${m.newCaseId} | ${updateErr.message}`);
      fail++;
    } else {
      console.log(`  OK: ${m.oldCaseId} --> ${m.newCaseId}`);
      ok++;
    }
  }

  console.log('\n==========================================================');
  console.log(`  DONE  |  Migrated: ${ok}  |  Failed: ${fail}  |  Skipped: ${skipped.length}`);
  console.log('==========================================================\n');
}

migrate().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
