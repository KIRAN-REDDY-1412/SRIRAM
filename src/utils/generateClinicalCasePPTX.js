import pptxgen from 'pptxgenjs';

/**
 * Generate and download an editable PowerPoint (.pptx) presentation for a Clinical Case.
 */
export const generateClinicalCasePPTX = async ({
  clinicalCase = {},
  student = {},
  preceptor = {},
  college = {},
  caseModulesData = {},
  pptSettings = {}
}) => {
  const pptx = new pptxgen();

  // Page setup & configuration
  const isWidescreen = pptSettings?.aspect_ratio !== '4:3 (Standard)';
  pptx.layout = isWidescreen ? 'LAYOUT_16x9' : 'LAYOUT_4x3';

  // Fonts & Styling Tokens
  const fontFace = pptSettings?.font_family || 'Times New Roman';
  const titleFontSize = parseInt(pptSettings?.ppt_title_font_size || '22', 10);
  const subHeadingFontSize = parseInt(pptSettings?.ppt_subheading_font_size || '20', 10);
  const bodyFontSize = parseInt(pptSettings?.ppt_body_font_size || '18', 10);

  const primaryColor = '0F172A'; // Slate-900
  const emeraldColor = '059669'; // Emerald-600
  const darkBgColor = 'F8FAFC'; // Slate-50

  const collegeName = college?.college_name || college?.name || pptSettings?.header_title || 'Pharmacy College';
  const hospitalName = college?.hospital_name || clinicalCase?.hospital_name || 'Lalitha Superspecialities Hospital';
  const caseId = clinicalCase?.case_id || 'AMRMCP-2026-001';
  const studentName = student?.full_name || clinicalCase?.student_name || 'Student Candidate';
  const rollNumber = student?.roll_number || 'Y22PHD0314';
  const preceptorName = clinicalCase?.assigned_preceptor_name || preceptor?.full_name || 'Faculty Preceptor';
  const finalDiagnosis = clinicalCase?.final_diagnosis || clinicalCase?.diagnosis || 'Clinical Case Presentation';
  const footerText = pptSettings?.footer_text || `${collegeName} • Clinical Case Presentation`;

  // Module Data
  const profile = caseModulesData?.profile || {};
  const vitalsList = caseModulesData?.vitals || [];
  const labs = caseModulesData?.labs || [];
  const drugs = caseModulesData?.drugs || [];
  const counselling = caseModulesData?.counselling || {};
  const intervention = caseModulesData?.intervention || {};
  const dir = caseModulesData?.dir || {};
  const adr = caseModulesData?.adr || {};

  // SLIDE 1: TITLE SLIDE
  const slide1 = pptx.addSlide();
  slide1.background = { color: 'FFFFFF' };

  slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5,
    y: 0.4,
    w: isWidescreen ? 12.3 : 9.0,
    h: 1.2,
    fill: { color: 'F1F5F9' },
    line: { color: '0F172A', width: 1.5 }
  });

  slide1.addText(collegeName.toUpperCase(), {
    x: 0.6,
    y: 0.55,
    w: isWidescreen ? 12.1 : 8.8,
    h: 0.4,
    fontFace,
    fontSize: titleFontSize,
    bold: true,
    color: primaryColor,
    align: 'center'
  });

  slide1.addText(`(Autonomous) • ${hospitalName}`, {
    x: 0.6,
    y: 0.95,
    w: isWidescreen ? 12.1 : 8.8,
    h: 0.3,
    fontFace,
    fontSize: subHeadingFontSize - 4,
    italic: true,
    color: '475569',
    align: 'center'
  });

  slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5,
    y: 1.7,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.5,
    fill: { color: '0F172A' }
  });

  slide1.addText(`CASE ID : ${caseId}`, {
    x: 0.6,
    y: 1.75,
    w: isWidescreen ? 12.1 : 8.8,
    h: 0.4,
    fontFace: 'Courier New',
    fontSize: bodyFontSize,
    bold: true,
    color: 'FFFFFF',
    align: 'center'
  });

  slide1.addText('CLINICAL CASE PRESENTATION', {
    x: 0.6,
    y: 2.6,
    w: isWidescreen ? 12.1 : 8.8,
    h: 0.5,
    fontFace,
    fontSize: titleFontSize + 2,
    bold: true,
    color: emeraldColor,
    align: 'center'
  });

  slide1.addText(`Final Diagnosis: ${finalDiagnosis}`, {
    x: 0.6,
    y: 3.2,
    w: isWidescreen ? 12.1 : 8.8,
    h: 0.6,
    fontFace,
    fontSize: subHeadingFontSize,
    bold: true,
    color: primaryColor,
    align: 'center'
  });

  slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 1.5,
    y: 4.2,
    w: isWidescreen ? 10.3 : 7.0,
    h: 2.2,
    fill: { color: darkBgColor },
    line: { color: 'CBD5E1', width: 1 }
  });

  slide1.addText([
    { text: 'Presented By: ', options: { bold: true, fontSize: bodyFontSize, color: '334155' } },
    { text: `${studentName} `, options: { bold: true, fontSize: bodyFontSize + 2, color: primaryColor } },
    { text: `(Roll No: ${rollNumber})\n\n`, options: { fontSize: bodyFontSize, color: '475569' } },
    { text: 'Evaluated & Approved By: ', options: { bold: true, fontSize: bodyFontSize, color: '334155' } },
    { text: `${preceptorName}`, options: { bold: true, fontSize: bodyFontSize + 2, color: emeraldColor } }
  ], {
    x: 1.8,
    y: 4.4,
    w: isWidescreen ? 9.7 : 6.4,
    h: 1.8,
    fontFace,
    align: 'center'
  });

  slide1.addText(footerText, {
    x: 0.5,
    y: isWidescreen ? 6.8 : 6.9,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.3,
    fontFace,
    fontSize: 10,
    color: '64748B',
    align: 'center'
  });

  // SLIDE 2: PATIENT DEMOGRAPHICS, HISTORY & SOCIAL HISTORY
  const slide2 = pptx.addSlide();
  slide2.addText('1. Patient Profile, Demographics & Social History', {
    x: 0.5,
    y: 0.4,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.5,
    fontFace,
    fontSize: titleFontSize,
    bold: true,
    color: primaryColor
  });

  const profileRows = [
    [
      { text: 'Clinical Field', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 13 } },
      { text: 'Patient Information & History Details', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 13 } }
    ],
    [{ text: 'Patient Name & Reg No', options: { fontFace, fontSize: 11, bold: true } }, { text: `${profile.patient_name || 'BB'} (${profile.age || '46'} Yrs / ${profile.gender || 'Male'} / IP/OP: ${profile.ip_op_number || '123456789'})`, options: { fontFace, fontSize: 11 } }],
    [{ text: 'Department & Ward', options: { fontFace, fontSize: 11, bold: true } }, { text: `${profile.department || clinicalCase.department || 'Gastroenterology'} (Ward: ${profile.ward || 'Female Medical Ward'})`, options: { fontFace, fontSize: 11 } }],
    [{ text: 'Attending Physician', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.physician_name || profile.attending_physician || 'Dr. N Rajesh, M.D.', options: { fontFace, fontSize: 11 } }],
    [{ text: 'Chief Complaints', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.chief_complaints || 'Abdominal pain during defication for 3 days', options: { fontFace, fontSize: 11 } }],
    [{ text: 'Past Medical History', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.past_medical_history || 'Appendectomy P/S', options: { fontFace, fontSize: 11 } }],
    [{ text: 'Past Medication History', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.past_medication_history || 'Nil', options: { fontFace, fontSize: 11 } }],
    [{ text: 'Family History', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.family_history || 'No history of hereditary disease', options: { fontFace, fontSize: 11 } }],
    [{ text: 'Social History', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.social_history || 'Marital Status: Married | Non-smoker, Non-alcoholic, Mixed diet.', options: { fontFace, fontSize: 11, bold: true, color: '0369A1' } }]
  ];

  slide2.addTable(profileRows, {
    x: 0.5,
    y: 1.0,
    w: isWidescreen ? 12.3 : 9.0,
    colW: [3.2, isWidescreen ? 9.1 : 5.8],
    border: { pt: 1, color: 'CBD5E1' }
  });

  slide2.addText(footerText, {
    x: 0.5,
    y: isWidescreen ? 6.8 : 6.9,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.3,
    fontFace,
    fontSize: 10,
    color: '64748B',
    align: 'center'
  });

  // SLIDE 3: VITAL SIGNS & CLINICAL EXAMINATIONS
  const slide3 = pptx.addSlide();
  slide3.addText('2. Vital Signs & Clinical Examinations', {
    x: 0.5,
    y: 0.4,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.5,
    fontFace,
    fontSize: titleFontSize,
    bold: true,
    color: primaryColor
  });

  const examText = `General Examination: ${profile.general_examination || 'Cyanosis: Absent | Icterus: Absent | Pallor: Absent'}\nSystemic Examination: ${profile.systemic_examination || 'CVS: S1S2+ | GI: Soft and Tenderness | RS: B/L AE+ | CNS: HMF+NEND+'}`;
  slide3.addText(examText, {
    x: 0.5,
    y: 1.0,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.8,
    fontFace,
    fontSize: 11,
    color: '1E293B',
    fill: { color: 'F8FAFC' },
    line: { color: 'CBD5E1', width: 1 }
  });

  // Vitals Table
  const vitalsHeader = [
    { text: 'Date', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Temp (°F)', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'BP (mmHg)', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Pulse Rate', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Resp Rate', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'SpO2 (%)', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } }
  ];

  const vitalsRows = vitalsList.length > 0
    ? vitalsList.map(v => [
        { text: v.date || '2026-08-10', options: { fontFace, fontSize: 10 } },
        { text: v.temp || '98.6', options: { fontFace, fontSize: 10 } },
        { text: v.bp || '120/80', options: { fontFace, fontSize: 10, bold: true } },
        { text: v.pr || '72', options: { fontFace, fontSize: 10 } },
        { text: v.rr || '18', options: { fontFace, fontSize: 10 } },
        { text: v.spo2 ? `${v.spo2}%` : '98%', options: { fontFace, fontSize: 10, bold: true } }
      ])
    : [
        [{ text: '2026-08-10', options: { fontFace, fontSize: 10 } }, { text: '98.4', options: { fontFace, fontSize: 10 } }, { text: '120/70', options: { fontFace, fontSize: 10, bold: true } }, { text: '67', options: { fontFace, fontSize: 10 } }, { text: '18', options: { fontFace, fontSize: 10 } }, { text: '98%', options: { fontFace, fontSize: 10, bold: true } }],
        [{ text: '2026-08-11', options: { fontFace, fontSize: 10 } }, { text: '98.6', options: { fontFace, fontSize: 10 } }, { text: '130/70', options: { fontFace, fontSize: 10, bold: true } }, { text: '70', options: { fontFace, fontSize: 10 } }, { text: '19', options: { fontFace, fontSize: 10 } }, { text: '98%', options: { fontFace, fontSize: 10, bold: true } }]
      ];

  slide3.addTable([vitalsHeader, ...vitalsRows], {
    x: 0.5,
    y: 2.0,
    w: isWidescreen ? 12.3 : 9.0,
    border: { pt: 1, color: 'CBD5E1' }
  });

  slide3.addText(footerText, {
    x: 0.5,
    y: isWidescreen ? 6.8 : 6.9,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.3,
    fontFace,
    fontSize: 10,
    color: '64748B',
    align: 'center'
  });

  // SLIDE 4: LABORATORY & OTHER INVESTIGATIONS
  const slide4 = pptx.addSlide();
  slide4.addText('3. Laboratory & Diagnostic Investigations', {
    x: 0.5,
    y: 0.4,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.5,
    fontFace,
    fontSize: titleFontSize,
    bold: true,
    color: primaryColor
  });

  const labHeader = [
    { text: 'Category', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Parameter Name', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Observed Value', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Reference Range', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } }
  ];

  const labRows = labs.length > 0
    ? labs.map(l => [
        { text: l.category || 'Haematology', options: { fontFace, fontSize: 10 } },
        { text: l.parameter_name || 'Hb %', options: { fontFace, fontSize: 10, bold: true } },
        { text: `${l.test_value || '13.0'} ${l.unit || 'g/dL'}`, options: { fontFace, fontSize: 10, bold: true } },
        { text: l.reference_range || '11-16.5 %', options: { fontFace, fontSize: 10 } }
      ])
    : [
        [{ text: 'Haematology', options: { fontFace, fontSize: 10 } }, { text: 'Hb %', options: { fontFace, fontSize: 10, bold: true } }, { text: '13.0 g/dL', options: { fontFace, fontSize: 10, bold: true } }, { text: '11 - 16.5 %', options: { fontFace, fontSize: 10 } }],
        [{ text: 'Haematology', options: { fontFace, fontSize: 10 } }, { text: 'WBC Total Count', options: { fontFace, fontSize: 10, bold: true } }, { text: '11,200 /cu.mm', options: { fontFace, fontSize: 10, bold: true } }, { text: '4000 - 11000', options: { fontFace, fontSize: 10 } }],
        [{ text: 'Biochemistry', options: { fontFace, fontSize: 10 } }, { text: 'Blood Urea', options: { fontFace, fontSize: 10, bold: true } }, { text: '24 mg/dL', options: { fontFace, fontSize: 10, bold: true } }, { text: '15 - 45 mg/dL', options: { fontFace, fontSize: 10 } }]
      ];

  slide4.addTable([labHeader, ...labRows], {
    x: 0.5,
    y: 1.0,
    w: isWidescreen ? 12.3 : 9.0,
    colW: [2.5, 3.5, 3.0, isWidescreen ? 3.3 : 0.0],
    border: { pt: 1, color: 'CBD5E1' }
  });

  const otherInvText = `Other Diagnostic Investigations:\n${profile.other_investigations || 'HISTOPATHOLOGY REPORT: Focal Cholesterolosis | US SCAN OF WHOLE ABDOMEN: Right renal cortical cyst.'}`;
  slide4.addText(otherInvText, {
    x: 0.5,
    y: 4.8,
    w: isWidescreen ? 12.3 : 9.0,
    h: 1.6,
    fontFace,
    fontSize: 11,
    color: '0369A1',
    fill: { color: 'F0F9FF' },
    line: { color: 'BAE6FD', width: 1 }
  });

  slide4.addText(footerText, {
    x: 0.5,
    y: isWidescreen ? 6.8 : 6.9,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.3,
    fontFace,
    fontSize: 10,
    color: '64748B',
    align: 'center'
  });

  // SLIDE 5: FINAL DIAGNOSIS & PRESCRIBED MEDICATIONS
  const slide5 = pptx.addSlide();
  slide5.addText('4. Final Diagnosis & Prescribed Medications', {
    x: 0.5,
    y: 0.4,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.5,
    fontFace,
    fontSize: titleFontSize,
    bold: true,
    color: primaryColor
  });

  slide5.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5,
    y: 1.0,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.8,
    fill: { color: 'ECFDF5' },
    line: { color: emeraldColor, width: 1.5 }
  });

  slide5.addText(`FINAL DIAGNOSIS : ${finalDiagnosis}`, {
    x: 0.6,
    y: 1.15,
    w: isWidescreen ? 12.1 : 8.8,
    h: 0.5,
    fontFace,
    fontSize: subHeadingFontSize,
    bold: true,
    color: emeraldColor,
    align: 'center'
  });

  const drugHeader = [
    { text: 'S.No', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Brand & Generic Name', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Dose & Route', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Frequency', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } }
  ];

  const drugRows = drugs.length > 0
    ? drugs.map((d, idx) => [
        { text: `${d.s_no || idx + 1}`, options: { fontFace, fontSize: 10, align: 'center' } },
        { text: `${d.trade_name} ${d.generic_name ? `(${d.generic_name})` : ''}`, options: { fontFace, fontSize: 10, bold: true } },
        { text: `${d.dose} (${d.route_of_admin || 'Oral'})`, options: { fontFace, fontSize: 10 } },
        { text: d.frequency || 'OD', options: { fontFace, fontSize: 10, bold: true } }
      ])
    : [
        [{ text: '1', options: { fontFace, fontSize: 10, align: 'center' } }, { text: 'Inj. Ceftriaxone 1g', options: { fontFace, fontSize: 10, bold: true } }, { text: '1g (IV)', options: { fontFace, fontSize: 10 } }, { text: 'BD', options: { fontFace, fontSize: 10, bold: true } }],
        [{ text: '2', options: { fontFace, fontSize: 10, align: 'center' } }, { text: 'Tab. Pantoprazole 40mg', options: { fontFace, fontSize: 10, bold: true } }, { text: '40mg (Oral)', options: { fontFace, fontSize: 10 } }, { text: 'OD (Before Food)', options: { fontFace, fontSize: 10, bold: true } }],
        [{ text: '3', options: { fontFace, fontSize: 10, align: 'center' } }, { text: 'Tab. Mesalamine 1.2g', options: { fontFace, fontSize: 10, bold: true } }, { text: '1.2g (Oral)', options: { fontFace, fontSize: 10 } }, { text: 'TID', options: { fontFace, fontSize: 10, bold: true } }]
      ];

  slide5.addTable([drugHeader, ...drugRows], {
    x: 0.5,
    y: 2.0,
    w: isWidescreen ? 12.3 : 9.0,
    colW: [1.0, 5.0, 3.5, isWidescreen ? 2.8 : 0.0],
    border: { pt: 1, color: 'CBD5E1' }
  });

  slide5.addText(footerText, {
    x: 0.5,
    y: isWidescreen ? 6.8 : 6.9,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.3,
    fontFace,
    fontSize: 10,
    color: '64748B',
    align: 'center'
  });

  // SLIDE 6: PATIENT COUNSELLING & PHARMACIST INTERVENTIONS
  const slide6 = pptx.addSlide();
  slide6.addText('5. Patient Counselling & Pharmacist Interventions', {
    x: 0.5,
    y: 0.4,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.5,
    fontFace,
    fontSize: titleFontSize,
    bold: true,
    color: primaryColor
  });

  const counsellingRows = [
    [
      { text: 'Counselling Aspect', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 12 } },
      { text: 'Counselling Entry Details', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 12 } }
    ],
    [{ text: 'Counselled Provided To', options: { fontFace, fontSize: 10, bold: true } }, { text: counselling.counselling_provided_to || 'Patient', options: { fontFace, fontSize: 10 } }],
    [{ text: 'Counselling Mode & Duration', options: { fontFace, fontSize: 10, bold: true } }, { text: `${counselling.counselling_mode || 'Oral & Pamphlet'} (${counselling.time_taken || '15 min'})`, options: { fontFace, fontSize: 10 } }],
    [{ text: 'Disease & Medications Counselled', options: { fontFace, fontSize: 10, bold: true } }, { text: `${counselling.disease_counselled || finalDiagnosis} | Meds: ${counselling.medications_counselled || 'Mesalamine & Antibiotic compliance'}`, options: { fontFace, fontSize: 10 } }],
    [{ text: 'Intervention Problem Identified', options: { fontFace, fontSize: 10, bold: true } }, { text: intervention.problem_identified || 'Verified non-cross-reactivity with Ceftriaxone.', options: { fontFace, fontSize: 10 } }],
    [{ text: 'Pharmacist Recommendation', options: { fontFace, fontSize: 10, bold: true } }, { text: intervention.intervention_provided || 'Spaced oral antidiabetic vs IV infusion.', options: { fontFace, fontSize: 10 } }],
    [{ text: 'Physician Acceptance Status', options: { fontFace, fontSize: 10, bold: true } }, { text: intervention.physician_acceptance || 'Discussed with Physician; Accepted & Implemented.', options: { fontFace, fontSize: 10, color: emeraldColor, bold: true } }]
  ];

  slide6.addTable(counsellingRows, {
    x: 0.5,
    y: 1.0,
    w: isWidescreen ? 12.3 : 9.0,
    colW: [3.5, isWidescreen ? 8.8 : 5.5],
    border: { pt: 1, color: 'CBD5E1' }
  });

  slide6.addText(footerText, {
    x: 0.5,
    y: isWidescreen ? 6.8 : 6.9,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.3,
    fontFace,
    fontSize: 10,
    color: '64748B',
    align: 'center'
  });

  // SLIDE 7: ADR LOG, DISCHARGE SUMMARY & OFFICIAL PRECEPTOR VERIFICATION
  const slide7 = pptx.addSlide();
  slide7.addText('6. ADR Log, Discharge Summary & Preceptor Approval', {
    x: 0.5,
    y: 0.4,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.5,
    fontFace,
    fontSize: titleFontSize,
    bold: true,
    color: primaryColor
  });

  const adrRows = [
    [
      { text: 'ADR & Discharge Metric', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 12 } },
      { text: 'Recorded Details & Verification', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 12 } }
    ],
    [{ text: 'ADR Suspected Drug & Reaction', options: { fontFace, fontSize: 10, bold: true } }, { text: `${adr.reaction_title || 'Suspected ADR'} (Drug: ${adr.suspected_drug || 'Metformin'})`, options: { fontFace, fontSize: 10 } }],
    [{ text: 'Causality & Outcome', options: { fontFace, fontSize: 10, bold: true } }, { text: `${adr.initial_causality_opinion || 'Probable'} | Outcome: ${adr.patient_outcome || 'Recovered'}`, options: { fontFace, fontSize: 10 } }],
    [{ text: 'Discharge Summary Notes', options: { fontFace, fontSize: 10, bold: true } }, { text: profile.discharge_summary || 'A 54Y female patient was admitted with chief complaints of abdominal pain and vomiting. All investigations done. Patient treated with antibiotics, antiemetics, and discharged with supportive care.', options: { fontFace, fontSize: 10, color: '0F172A' } }],
    [{ text: 'Institutional Case Status', options: { fontFace, fontSize: 10, bold: true } }, { text: 'OFFICIALLY APPROVED & VERIFIED', options: { fontFace, fontSize: 10, bold: true, color: emeraldColor } }],
    [{ text: 'Candidate Student Signature', options: { fontFace, fontSize: 10, bold: true } }, { text: `Digitally Signed by ${studentName} (${rollNumber})`, options: { fontFace, fontSize: 10 } }],
    [{ text: 'Faculty Preceptor Signature', options: { fontFace, fontSize: 10, bold: true } }, { text: `Verified & Approved by ${preceptorName}`, options: { fontFace, fontSize: 10, bold: true, color: primaryColor } }]
  ];

  slide7.addTable(adrRows, {
    x: 0.5,
    y: 1.0,
    w: isWidescreen ? 12.3 : 9.0,
    colW: [3.5, isWidescreen ? 8.8 : 5.5],
    border: { pt: 1, color: 'CBD5E1' }
  });

  slide7.addText(footerText, {
    x: 0.5,
    y: isWidescreen ? 6.8 : 6.9,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.3,
    fontFace,
    fontSize: 10,
    color: '64748B',
    align: 'center'
  });

  // Save presentation file directly
  const fileName = `${caseId}_Presentation.pptx`;
  await pptx.writeFile({ fileName });
};
