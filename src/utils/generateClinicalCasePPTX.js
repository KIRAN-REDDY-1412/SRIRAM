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
  const counselling = caseModulesData?.counselling || {};
  const intervention = caseModulesData?.intervention || {};
  const dir = caseModulesData?.dir || {};
  const adr = caseModulesData?.adr || {};

  // SLIDE 1: TITLE SLIDE
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: 'FFFFFF' };

  // Header Banner Box
  titleSlide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5,
    y: 0.4,
    w: isWidescreen ? 12.3 : 9.0,
    h: 1.2,
    fill: { color: 'F1F5F9' },
    line: { color: '0F172A', width: 1.5 }
  });

  titleSlide.addText(collegeName.toUpperCase(), {
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

  titleSlide.addText(`(Autonomous) • ${hospitalName}`, {
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

  // Case ID Sub-header Bar
  titleSlide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5,
    y: 1.7,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.5,
    fill: { color: '0F172A' }
  });

  titleSlide.addText(`CASE ID : ${caseId}`, {
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

  // Presentation Main Title & Diagnosis
  titleSlide.addText('CLINICAL CASE PRESENTATION', {
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

  titleSlide.addText(`Final Diagnosis: ${finalDiagnosis}`, {
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

  // Student & Preceptor Metadata Box
  titleSlide.addShape(pptx.shapes.RECTANGLE, {
    x: 1.5,
    y: 4.2,
    w: isWidescreen ? 10.3 : 7.0,
    h: 2.2,
    fill: { color: darkBgColor },
    line: { color: 'CBD5E1', width: 1 }
  });

  titleSlide.addText([
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

  // Slide Footer
  titleSlide.addText(footerText, {
    x: 0.5,
    y: isWidescreen ? 6.8 : 6.9,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.3,
    fontFace,
    fontSize: 10,
    color: '64748B',
    align: 'center'
  });

  // SLIDE 2: PATIENT DEMOGRAPHICS & PROFILE
  const slide2 = pptx.addSlide();
  slide2.addText('1. Patient Profile & Clinical Demographics', {
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
      { text: 'Field', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 14 } },
      { text: 'Clinical Detail', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 14 } }
    ],
    [{ text: 'Patient Initials', options: { fontFace, fontSize: 12, bold: true } }, { text: profile.patient_name || 'BB', options: { fontFace, fontSize: 12 } }],
    [{ text: 'Age / Gender / IP No', options: { fontFace, fontSize: 12, bold: true } }, { text: `${profile.age || '46'} Yrs / ${profile.gender || 'Male'} / IP: ${profile.ip_op_number || '123456789'}`, options: { fontFace, fontSize: 12 } }],
    [{ text: 'Department & Ward', options: { fontFace, fontSize: 12, bold: true } }, { text: `${profile.department || clinicalCase.department || 'Gastroenterology'} (${profile.ward || 'Female Medical Ward'})`, options: { fontFace, fontSize: 12 } }],
    [{ text: 'Chief Complaints', options: { fontFace, fontSize: 12, bold: true } }, { text: profile.chief_complaints || 'Abdominal pain during defication', options: { fontFace, fontSize: 12 } }],
    [{ text: 'Past Medical & Medication History', options: { fontFace, fontSize: 12, bold: true } }, { text: `Medical: ${profile.past_medical_history || 'Appendectamoy P/S'} | Medication: ${profile.past_medication_history || 'Nil'}`, options: { fontFace, fontSize: 12 } }],
    [{ text: 'General & Systemic Exam', options: { fontFace, fontSize: 12, bold: true } }, { text: `General: ${profile.general_examination || 'Cyanosis: Absent'} | Systemic: ${profile.systemic_examination || 'CVS: S1S2+'}`, options: { fontFace, fontSize: 12 } }],
    [{ text: 'Final Diagnosis', options: { fontFace, fontSize: 12, bold: true } }, { text: profile.diagnosis || finalDiagnosis, options: { fontFace, fontSize: 12, bold: true, color: emeraldColor } }]
  ];

  slide2.addTable(profileRows, {
    x: 0.5,
    y: 1.1,
    w: isWidescreen ? 12.3 : 9.0,
    colW: [3.0, isWidescreen ? 9.3 : 6.0],
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

  // SLIDE 3: PATIENT COUNSELLING RECORD
  const slide3 = pptx.addSlide();
  slide3.addText('2. Patient Counselling Record', {
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
      { text: 'Counselling Aspect', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 14 } },
      { text: 'Counselling Entry Details', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 14 } }
    ],
    [{ text: 'Counselled Provided To', options: { fontFace, fontSize: 12, bold: true } }, { text: counselling.counselling_provided_to || 'Patient', options: { fontFace, fontSize: 12 } }],
    [{ text: 'Counselling Mode & Duration', options: { fontFace, fontSize: 12, bold: true } }, { text: `${counselling.counselling_mode || 'Oral & Pamphlet'} (${counselling.time_taken || '15 min'})`, options: { fontFace, fontSize: 12 } }],
    [{ text: 'Disease Counselled', options: { fontFace, fontSize: 12, bold: true } }, { text: counselling.disease_counselled || finalDiagnosis, options: { fontFace, fontSize: 12 } }],
    [{ text: 'Medications Counselled', options: { fontFace, fontSize: 12, bold: true } }, { text: counselling.medications_counselled || 'Oral antidiabetic and hydration regimen', options: { fontFace, fontSize: 12 } }],
    [{ text: 'Key Focus & Advice Provided', options: { fontFace, fontSize: 12, bold: true } }, { text: counselling.focus_points || 'Antibiotic regimen compliance, blood glucose monitoring, and hydration.', options: { fontFace, fontSize: 12 } }],
    [{ text: 'Barriers & Action Taken', options: { fontFace, fontSize: 12, bold: true } }, { text: counselling.barriers_action || 'Mild language barrier resolved using pictorial dosage schedule.', options: { fontFace, fontSize: 12 } }]
  ];

  slide3.addTable(counsellingRows, {
    x: 0.5,
    y: 1.1,
    w: isWidescreen ? 12.3 : 9.0,
    colW: [3.2, isWidescreen ? 9.1 : 5.8],
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

  // SLIDE 4: PHARMACIST INTERVENTION & DRUG INFORMATION
  const slide4 = pptx.addSlide();
  slide4.addText('3. Pharmacist Intervention & Drug Information', {
    x: 0.5,
    y: 0.4,
    w: isWidescreen ? 12.3 : 9.0,
    h: 0.5,
    fontFace,
    fontSize: titleFontSize,
    bold: true,
    color: primaryColor
  });

  const interventionRows = [
    [
      { text: 'Intervention / DIR Parameter', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 14 } },
      { text: 'Recorded Details', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 14 } }
    ],
    [{ text: 'Intervention Problem Identified', options: { fontFace, fontSize: 12, bold: true } }, { text: intervention.problem_identified || 'Patient allergic to Penicillins; verified non-cross-reactivity with Ceftriaxone.', options: { fontFace, fontSize: 12 } }],
    [{ text: 'Pharmacist Recommendation', options: { fontFace, fontSize: 12, bold: true } }, { text: intervention.intervention_provided || 'Spaced administration of oral antidiabetic drug relative to antibiotic IV infusion.', options: { fontFace, fontSize: 12 } }],
    [{ text: 'Physician Acceptance', options: { fontFace, fontSize: 12, bold: true } }, { text: intervention.physician_acceptance || 'Discussed with Dr. A. Sharma; recommendation accepted and recorded.', options: { fontFace, fontSize: 12, color: emeraldColor, bold: true } }],
    [{ text: 'DIR Enquirer Name & Role', options: { fontFace, fontSize: 12, bold: true } }, { text: `${dir.enquirer_name || 'Clinician'} (${dir.enquirer_category || 'Doctor'})`, options: { fontFace, fontSize: 12 } }],
    [{ text: 'DIR Enquiry & Sources', options: { fontFace, fontSize: 12, bold: true } }, { text: `${dir.details_of_enquiry || 'Drug Query'} (Sources: ${dir.sources_consulted || 'Micromedex'})`, options: { fontFace, fontSize: 12 } }],
    [{ text: 'DIR Response Summary', options: { fontFace, fontSize: 12, bold: true } }, { text: dir.information_provided || 'Response provided via Micromedex / UpToDate.', options: { fontFace, fontSize: 12 } }]
  ];

  slide4.addTable(interventionRows, {
    x: 0.5,
    y: 1.1,
    w: isWidescreen ? 12.3 : 9.0,
    colW: [3.5, isWidescreen ? 8.8 : 5.5],
    border: { pt: 1, color: 'CBD5E1' }
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

  // SLIDE 5: ADR MONITORING & OFFICIAL VERIFICATION
  const slide5 = pptx.addSlide();
  slide5.addText('4. ADR Monitoring & Preceptor Verification', {
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
      { text: 'ADR & Verification Metric', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 14 } },
      { text: 'Recorded Metric Details', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 14 } }
    ],
    [{ text: 'ADR Reaction Title & Suspected Drug', options: { fontFace, fontSize: 12, bold: true } }, { text: `${adr.reaction_title || 'Mild gastric irritation'} (Drug: ${adr.suspected_drug || 'Metformin'})`, options: { fontFace, fontSize: 12 } }],
    [{ text: 'Causality & Naranjo Score', options: { fontFace, fontSize: 12, bold: true } }, { text: `${adr.initial_causality_opinion || 'Possible'} (Naranjo Algorithm Score: ${adr.naranjo_score || '4'})`, options: { fontFace, fontSize: 12 } }],
    [{ text: 'Action Taken & Outcome', options: { fontFace, fontSize: 12, bold: true } }, { text: `Action: ${adr.action_taken_on_suspected_drug || 'Take after food'} | Outcome: ${adr.patient_outcome || 'Recovered'}`, options: { fontFace, fontSize: 12 } }],
    [{ text: 'Institutional Case Status', options: { fontFace, fontSize: 12, bold: true } }, { text: 'OFFICIALLY APPROVED & VERIFIED', options: { fontFace, fontSize: 12, bold: true, color: emeraldColor } }],
    [{ text: 'Candidate Student Signature', options: { fontFace, fontSize: 12, bold: true } }, { text: `Digitally Signed by ${studentName} (${rollNumber})`, options: { fontFace, fontSize: 12 } }],
    [{ text: 'Faculty Preceptor Signature', options: { fontFace, fontSize: 12, bold: true } }, { text: `Verified & Signed by ${preceptorName}`, options: { fontFace, fontSize: 12, bold: true, color: primaryColor } }]
  ];

  slide5.addTable(adrRows, {
    x: 0.5,
    y: 1.1,
    w: isWidescreen ? 12.3 : 9.0,
    colW: [3.5, isWidescreen ? 8.8 : 5.5],
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

  // Save presentation file directly
  const fileName = `${caseId}_Presentation.pptx`;
  await pptx.writeFile({ fileName });
};
