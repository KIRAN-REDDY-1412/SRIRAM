const path = require('path');
const { computeModuleDiffs, isFieldModified } = require('../src/utils/diffEngine.js');

function runReturnedCaseDiffSuite() {
  console.log('----------------------------------------------------');
  console.log('⚡ RETURNED CASE ALL-FIELD DIFF TRACKING TEST SUITE');
  console.log('----------------------------------------------------\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(description, condition, actualResult) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ PASS: ${description}`);
    } else {
      console.log(`  ❌ FAIL: ${description}`);
      console.log(`     Actual:`, actualResult);
    }
  }

  // 1. TEST PATIENT PROFILE DIFFS
  console.log('🔹 Testing Patient Profile Field Differences...');
  const snapshotProfile = {
    patient_name: 'JOHN',
    age: '45',
    chief_complaints: 'Fever and Cough',
    final_diagnosis: 'Community Acquired Pneumonia',
    vital_signs: [{ temp: '98.6', bp: '120/80' }],
    prescribed_drugs: [{ trade_name: 'Amoxil', dose: '500mg' }]
  };

  const currentProfile = {
    patient_name: 'JOHN',
    age: '46', // Modified age
    chief_complaints: 'Fever, Severe Productive Cough, and Dyspnea', // Modified complaints
    final_diagnosis: 'Community Acquired Pneumonia with Pleural Effusion', // Modified diagnosis
    vital_signs: [{ temp: '101.2', bp: '130/85' }], // Modified vitals
    prescribed_drugs: [{ trade_name: 'Amoxil', dose: '500mg' }, { trade_name: 'Azithral', dose: '500mg' }] // Modified drugs
  };

  const profileDiffs = computeModuleDiffs(currentProfile, snapshotProfile, 'profile');
  assert('Identifies modified age in Patient Profile', isFieldModified(profileDiffs, 'age'), profileDiffs.age);
  assert('Identifies modified chief complaints in Patient Profile', isFieldModified(profileDiffs, 'chief_complaints'), profileDiffs.chief_complaints);
  assert('Identifies modified final diagnosis in Patient Profile', isFieldModified(profileDiffs, 'final_diagnosis'), profileDiffs.final_diagnosis);
  assert('Identifies modified vital signs array in Patient Profile', isFieldModified(profileDiffs, 'vital_signs'), profileDiffs.vital_signs);
  assert('Identifies modified prescribed drugs array in Patient Profile', isFieldModified(profileDiffs, 'prescribed_drugs'), profileDiffs.prescribed_drugs);
  assert('Does NOT flag unchanged patient_name', !isFieldModified(profileDiffs, 'patient_name'), profileDiffs.patient_name);

  // 2. TEST PATIENT COUNSELLING DIFFS
  console.log('\n🔹 Testing Patient Counselling Field Differences...');
  const snapshotCounselling = {
    disease_counselled: 'Hypertension',
    medications_counselled: 'Amlodipine 5mg',
    points_covered: ['Dosage regimen', 'Storage recommendations'],
    time_taken: '10 to 20 min.'
  };

  const currentCounselling = {
    disease_counselled: 'Essential Hypertension & Type 2 Diabetes', // Modified
    medications_counselled: 'Amlodipine 5mg, Metformin 500mg', // Modified
    points_covered: ['Dosage regimen', 'Storage recommendations', 'Potential side effects'], // Modified
    time_taken: '10 to 20 min.' // Unchanged
  };

  const counsellingDiffs = computeModuleDiffs(currentCounselling, snapshotCounselling, 'counselling');
  assert('Identifies modified disease_counselled', isFieldModified(counsellingDiffs, 'disease_counselled'), counsellingDiffs.disease_counselled);
  assert('Identifies modified medications_counselled', isFieldModified(counsellingDiffs, 'medications_counselled'), counsellingDiffs.medications_counselled);
  assert('Identifies modified points_covered array', isFieldModified(counsellingDiffs, 'points_covered'), counsellingDiffs.points_covered);
  assert('Does NOT flag unchanged time_taken', !isFieldModified(counsellingDiffs, 'time_taken'), counsellingDiffs.time_taken);

  // 3. TEST PHARMACIST INTERVENTION DIFFS
  console.log('\n🔹 Testing Pharmacist Intervention Field Differences...');
  const snapshotIntervention = {
    present_diagnosis: 'Asthma Exacerbation',
    problem_description: 'High dose prescribed',
    actions_taken: ['Discussion with prescriber'],
    significance_level: 'Major'
  };

  const currentIntervention = {
    present_diagnosis: 'Severe Acute Asthma Exacerbation', // Modified
    problem_description: 'Excessive dose and potential drug interaction with beta blocker', // Modified
    actions_taken: ['Discussion with prescriber', 'Drug information reference consulted'], // Modified
    significance_level: 'Major' // Unchanged
  };

  const interventionDiffs = computeModuleDiffs(currentIntervention, snapshotIntervention, 'intervention');
  assert('Identifies modified present_diagnosis', isFieldModified(interventionDiffs, 'present_diagnosis'), interventionDiffs.present_diagnosis);
  assert('Identifies modified problem_description', isFieldModified(interventionDiffs, 'problem_description'), interventionDiffs.problem_description);
  assert('Identifies modified actions_taken array', isFieldModified(interventionDiffs, 'actions_taken'), interventionDiffs.actions_taken);
  assert('Does NOT flag unchanged significance_level', !isFieldModified(interventionDiffs, 'significance_level'), interventionDiffs.significance_level);

  // 4. TEST DRUG INFORMATION REQUEST DIFFS
  console.log('\n🔹 Testing Drug Information Request Field Differences...');
  const snapshotDir = {
    details_of_enquiry: 'Can Linezolid be given with SSRI?',
    information_provided: 'Initial check done.',
    reply_mode: 'Oral'
  };

  const currentDir = {
    details_of_enquiry: 'Can Linezolid be given with SSRI sertraline? Check for serotonin syndrome risk.', // Modified
    information_provided: 'Linezolid is a weak MAO inhibitor. Co-administration with SSRIs increases serotonin toxicity risk. Monitor closely.', // Modified
    reply_mode: 'Written' // Modified
  };

  const dirDiffs = computeModuleDiffs(currentDir, snapshotDir, 'dir');
  assert('Identifies modified details_of_enquiry', isFieldModified(dirDiffs, 'details_of_enquiry'), dirDiffs.details_of_enquiry);
  assert('Identifies modified information_provided', isFieldModified(dirDiffs, 'information_provided'), dirDiffs.information_provided);
  assert('Identifies modified reply_mode', isFieldModified(dirDiffs, 'reply_mode'), dirDiffs.reply_mode);

  // 5. TEST ADR DOCUMENTATION DIFFS
  console.log('\n🔹 Testing ADR Documentation Field Differences...');
  const snapshotAdr = {
    reaction_title: 'Maculopapular Rash',
    clinical_management: 'Antihistamines given',
    initial_causality_opinion: 'Possible'
  };

  const currentAdr = {
    reaction_title: 'Severe Drug-Induced Maculopapular Rash', // Modified
    clinical_management: 'Offending drug stopped, oral corticosteroids and IV antihistamines administered', // Modified
    initial_causality_opinion: 'Probable' // Modified
  };

  const adrDiffs = computeModuleDiffs(currentAdr, snapshotAdr, 'adr');
  assert('Identifies modified reaction_title', isFieldModified(adrDiffs, 'reaction_title'), adrDiffs.reaction_title);
  assert('Identifies modified clinical_management', isFieldModified(adrDiffs, 'clinical_management'), adrDiffs.clinical_management);
  assert('Identifies modified initial_causality_opinion', isFieldModified(adrDiffs, 'initial_causality_opinion'), adrDiffs.initial_causality_opinion);

  console.log('\n----------------------------------------------------');
  console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('----------------------------------------------------');

  if (passedTests === totalTests && totalTests > 0) {
    console.log('🎉 ALL RETURNED CASE DIFF TRACKING TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('⚠️ Some diff tracking tests failed.');
    process.exit(1);
  }
}

runReturnedCaseDiffSuite();
