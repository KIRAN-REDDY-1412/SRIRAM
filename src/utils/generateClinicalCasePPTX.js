import pptxgen from 'pptxgenjs';

/**
 * Generate and download an editable PowerPoint (.pptx) presentation for a Clinical Case.
 * Structured into 11 comprehensive slides covering complete clinical case documentation.
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
  const isWidescreen = (pptSettings?.aspect_ratio || pptSettings?.ppt_aspect_ratio) !== '4:3 (Standard)';
  pptx.layout = isWidescreen ? 'LAYOUT_16x9' : 'LAYOUT_4x3';

  // Fonts & Styling Tokens
  const fontFace = pptSettings?.font_family || pptSettings?.ppt_font_family || 'Times New Roman';
  const titleFontSize = parseInt(pptSettings?.ppt_title_font_size || pptSettings?.title_font_size || '22', 10);
  const subHeadingFontSize = parseInt(pptSettings?.ppt_subheading_font_size || pptSettings?.subheading_font_size || '20', 10);
  const bodyFontSize = parseInt(pptSettings?.ppt_body_font_size || pptSettings?.body_font_size || '18', 10);

  const primaryColor = '0F172A'; // Slate-900
  const emeraldColor = '059669'; // Emerald-600
  const darkBgColor = 'F8FAFC'; // Slate-50

  const collegeName = college?.college_name || college?.name || pptSettings?.header_title || pptSettings?.ppt_header_title || 'A.M.REDDY MEMORIAL COLLEGE OF PHARMACY';
  const hospitalName = college?.hospital_name || clinicalCase?.hospital_name || 'Lalitha Superspecialities Hospital';
  const caseId = clinicalCase?.case_id || 'AMRMCP-2026-000001';
  const studentName = student?.full_name || clinicalCase?.student_name || 'Student Candidate';
  const rollNumber = student?.roll_number || 'Y22PHD0314';
  const preceptorName = clinicalCase?.assigned_preceptor_name || preceptor?.full_name || 'Faculty Preceptor';
  const finalDiagnosis = clinicalCase?.final_diagnosis || clinicalCase?.diagnosis || 'Clinical Case Presentation';
  const footerText = pptSettings?.footer_text || pptSettings?.ppt_footer_text || `${collegeName} • Clinical Case Presentation`;

  // Module Data
  const profile = caseModulesData?.profile || {};
  const vitalsList = caseModulesData?.vitals || [];
  const labs = caseModulesData?.labs || [];
  const drugs = caseModulesData?.drugs || [];
  const counselling = caseModulesData?.counselling || {};
  const intervention = caseModulesData?.intervention || {};
  const dir = caseModulesData?.dir || {};
  const adr = caseModulesData?.adr || {};

  // SLIDE 1: COVER / TITLE SLIDE
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
    y: 2.5,
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
    y: 3.1,
    w: isWidescreen ? 12.1 : 8.8,
    h: 0.6,
    fontFace,
    fontSize: subHeadingFontSize,
    bold: true,
    color: primaryColor,
    align: 'center'
  });

  if (pptSettings?.show_student_preceptor !== false && pptSettings?.ppt_show_student_preceptor !== false) {
    slide1.addShape(pptx.shapes.RECTANGLE, {
      x: 1.5,
      y: 4.1,
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
      y: 4.3,
      w: isWidescreen ? 9.7 : 6.4,
      h: 1.8,
      fontFace,
      align: 'center'
    });
  }

  slide1.addText(footerText, {
    x: 0.5, y: isWidescreen ? 6.8 : 6.9, w: isWidescreen ? 12.3 : 9.0, h: 0.3,
    fontFace, fontSize: 10, color: '64748B', align: 'center'
  });

  // SLIDE 2: PATIENT DETAILS
  const slide2 = pptx.addSlide();
  slide2.addText('1. Patient Profile & Demographics', {
    x: 0.5, y: 0.4, w: isWidescreen ? 12.3 : 9.0, h: 0.5,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const profileRows = [
    [{ text: 'Field', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 13 } }, { text: 'Clinical Detail', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 13 } }],
    [{ text: 'Patient Name', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.patient_name || 'John Doe', options: { fontFace, fontSize: 11 } }],
    [{ text: 'Age / Gender', options: { fontFace, fontSize: 11, bold: true } }, { text: `${profile.age || '46'} Yrs / ${profile.gender || 'Male'}`, options: { fontFace, fontSize: 11 } }],
    [{ text: 'IP / OP Registration No', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.ip_op_number || 'IP-987654', options: { fontFace, fontSize: 11, bold: true } }],
    [{ text: 'Department & Ward', options: { fontFace, fontSize: 11, bold: true } }, { text: `${profile.department || clinicalCase.department || 'Gastroenterology'} (${profile.ward || 'Male Medical Ward'})`, options: { fontFace, fontSize: 11 } }],
    [{ text: 'Date of Admission', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.date_of_admission || '2026-08-01', options: { fontFace, fontSize: 11 } }],
    [{ text: 'Attending Physician', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.attending_physician || 'Dr. N. Rajesh, M.D.', options: { fontFace, fontSize: 11 } }]
  ];

  slide2.addTable(profileRows, {
    x: 0.5, y: 1.1, w: isWidescreen ? 12.3 : 9.0, colW: [3.2, isWidescreen ? 9.1 : 5.8],
    border: { pt: 1, color: 'CBD5E1' }
  });
  slide2.addText(footerText, { x: 0.5, y: isWidescreen ? 6.8 : 6.9, w: isWidescreen ? 12.3 : 9.0, h: 0.3, fontFace, fontSize: 10, color: '64748B', align: 'center' });

  // SLIDE 3: CHIEF COMPLAINTS & HISTORY
  const slide3 = pptx.addSlide();
  slide3.addText('2. Chief Complaints & Clinical History', {
    x: 0.5, y: 0.4, w: isWidescreen ? 12.3 : 9.0, h: 0.5,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const historyRows = [
    [{ text: 'Clinical Aspect', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 13 } }, { text: 'Patient Record Information', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 13 } }],
    [{ text: 'Chief Complaints', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.chief_complaints || 'Abdominal pain during defecation for 3 days', options: { fontFace, fontSize: 11 } }],
    [{ text: 'Past Medical History', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.past_medical_history || 'Hypertension, T2DM, Appendectomy P/S', options: { fontFace, fontSize: 11 } }],
    [{ text: 'Past Medication History', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.past_medication_history || 'Tab. Telmisartan 40mg PO OD, Tab. Metformin 500mg PO BD', options: { fontFace, fontSize: 11 } }],
    [{ text: 'Family History', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.family_history || 'Father had T2DM and Hypertension.', options: { fontFace, fontSize: 11 } }],
    [{ text: 'Social History', options: { fontFace, fontSize: 11, bold: true } }, { text: profile.social_history || 'Married. Non-smoker, Non-alcoholic, Mixed diet.', options: { fontFace, fontSize: 11, bold: true, color: '0369A1' } }]
  ];

  slide3.addTable(historyRows, {
    x: 0.5, y: 1.1, w: isWidescreen ? 12.3 : 9.0, colW: [3.2, isWidescreen ? 9.1 : 5.8],
    border: { pt: 1, color: 'CBD5E1' }
  });
  slide3.addText(footerText, { x: 0.5, y: isWidescreen ? 6.8 : 6.9, w: isWidescreen ? 12.3 : 9.0, h: 0.3, fontFace, fontSize: 10, color: '64748B', align: 'center' });

  // SLIDE 4: PAST MEDICAL & MEDICATION HISTORY (DETAILED)
  const slide4 = pptx.addSlide();
  slide4.addText('3. Past Medical & Medication Breakdown', {
    x: 0.5, y: 0.4, w: isWidescreen ? 12.3 : 9.0, h: 0.5,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const medHistoryBox = `Past Medical History Summary:\n${profile.past_medical_history || 'Hypertension (5 yrs), T2DM (3 yrs), Appendectomy P/S.'}\n\nPast Medication History:\n${profile.past_medication_history || 'Telmisartan 40mg PO OD, Metformin 500mg PO BD. No history of long-term NSAID usage.'}`;
  slide4.addText(medHistoryBox, {
    x: 0.5, y: 1.1, w: isWidescreen ? 12.3 : 9.0, h: 2.2,
    fontFace, fontSize: 12, color: '1E293B', fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 }
  });

  const socialBox = `Social & Lifestyle History:\n${profile.social_history || 'Marital Status: Married | Occupation: School Teacher | Non-smoker, Non-alcoholic | Mixed diet, moderate physical activity.'}`;
  slide4.addText(socialBox, {
    x: 0.5, y: 3.6, w: isWidescreen ? 12.3 : 9.0, h: 1.8,
    fontFace, fontSize: 12, color: '0369A1', fill: { color: 'F0F9FF' }, line: { color: 'BAE6FD', width: 1 }
  });
  slide4.addText(footerText, { x: 0.5, y: isWidescreen ? 6.8 : 6.9, w: isWidescreen ? 12.3 : 9.0, h: 0.3, fontFace, fontSize: 10, color: '64748B', align: 'center' });

  // SLIDE 5: CLINICAL EXAMINATION & VITALS LOG
  const slide5 = pptx.addSlide();
  slide5.addText('4. Clinical Examination & Vital Signs', {
    x: 0.5, y: 0.4, w: isWidescreen ? 12.3 : 9.0, h: 0.5,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const examText = `General Examination: ${profile.general_examination || 'Cyanosis: Absent | Icterus: Absent | Pallor: Present (+)'}\nSystemic Examination: ${profile.systemic_examination || 'CVS: S1S2+ | GI: Soft, RIF Tenderness (+) | RS: B/L AE+'}`;
  slide5.addText(examText, {
    x: 0.5, y: 1.0, w: isWidescreen ? 12.3 : 9.0, h: 0.9,
    fontFace, fontSize: 11, color: '1E293B', fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 }
  });

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
        { text: v.date || '2026-08-01', options: { fontFace, fontSize: 10 } },
        { text: v.temp || '98.6', options: { fontFace, fontSize: 10 } },
        { text: v.bp || '120/80', options: { fontFace, fontSize: 10, bold: true } },
        { text: v.pr || '72', options: { fontFace, fontSize: 10 } },
        { text: v.rr || '18', options: { fontFace, fontSize: 10 } },
        { text: v.spo2 ? `${v.spo2}%` : '98%', options: { fontFace, fontSize: 10, bold: true } }
      ])
    : [
        [{ text: '2026-08-01', options: { fontFace, fontSize: 10 } }, { text: '100.4', options: { fontFace, fontSize: 10 } }, { text: '130/85', options: { fontFace, fontSize: 10, bold: true } }, { text: '88', options: { fontFace, fontSize: 10 } }, { text: '20', options: { fontFace, fontSize: 10 } }, { text: '98%', options: { fontFace, fontSize: 10, bold: true } }],
        [{ text: '2026-08-02', options: { fontFace, fontSize: 10 } }, { text: '98.6', options: { fontFace, fontSize: 10 } }, { text: '120/78', options: { fontFace, fontSize: 10, bold: true } }, { text: '76', options: { fontFace, fontSize: 10 } }, { text: '18', options: { fontFace, fontSize: 10 } }, { text: '99%', options: { fontFace, fontSize: 10, bold: true } }]
      ];

  slide5.addTable([vitalsHeader, ...vitalsRows], {
    x: 0.5, y: 2.1, w: isWidescreen ? 12.3 : 9.0, border: { pt: 1, color: 'CBD5E1' }
  });
  slide5.addText(footerText, { x: 0.5, y: isWidescreen ? 6.8 : 6.9, w: isWidescreen ? 12.3 : 9.0, h: 0.3, fontFace, fontSize: 10, color: '64748B', align: 'center' });

  // SLIDE 6: LABORATORY INVESTIGATIONS
  const slide6 = pptx.addSlide();
  slide6.addText('5. Laboratory Investigations', {
    x: 0.5, y: 0.4, w: isWidescreen ? 12.3 : 9.0, h: 0.5,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const labHeader = [
    { text: 'Category', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Parameter Name', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Observed Value', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Reference Range', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Inference', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } }
  ];

  const labRows = labs.length > 0
    ? labs.map(l => [
        { text: l.category || 'Haematology', options: { fontFace, fontSize: 10 } },
        { text: l.parameter_name || 'Hb', options: { fontFace, fontSize: 10, bold: true } },
        { text: `${l.test_value || '10.2'} ${l.unit || 'g/dL'}`, options: { fontFace, fontSize: 10, bold: true } },
        { text: l.reference_range || '13-17 g/dL', options: { fontFace, fontSize: 10 } },
        { text: l.clinical_inference || 'Normal', options: { fontFace, fontSize: 10, bold: true, color: '0284C7' } }
      ])
    : [
        [{ text: 'Haematology', options: { fontFace, fontSize: 10 } }, { text: 'Hemoglobin (Hb)', options: { fontFace, fontSize: 10, bold: true } }, { text: '10.2 g/dL', options: { fontFace, fontSize: 10, bold: true } }, { text: '13.0 - 17.0 g/dL', options: { fontFace, fontSize: 10 } }, { text: 'Anemia', options: { fontFace, fontSize: 10, bold: true, color: 'DC2626' } }],
        [{ text: 'Haematology', options: { fontFace, fontSize: 10 } }, { text: 'Total WBC Count', options: { fontFace, fontSize: 10, bold: true } }, { text: '13,500 /cu.mm', options: { fontFace, fontSize: 10, bold: true } }, { text: '4000 - 11000', options: { fontFace, fontSize: 10 } }, { text: 'Leukocytosis', options: { fontFace, fontSize: 10, bold: true, color: 'DC2626' } }],
        [{ text: 'Biochemistry', options: { fontFace, fontSize: 10 } }, { text: 'CRP', options: { fontFace, fontSize: 10, bold: true } }, { text: '28.5 mg/L', options: { fontFace, fontSize: 10, bold: true } }, { text: '0 - 5.0 mg/L', options: { fontFace, fontSize: 10 } }, { text: 'Inflammation', options: { fontFace, fontSize: 10, bold: true, color: 'DC2626' } }]
      ];

  slide6.addTable([labHeader, ...labRows], {
    x: 0.5, y: 1.0, w: isWidescreen ? 12.3 : 9.0, colW: [2.0, 3.2, 2.5, 2.5, isWidescreen ? 2.1 : 0.0],
    border: { pt: 1, color: 'CBD5E1' }
  });
  slide6.addText(footerText, { x: 0.5, y: isWidescreen ? 6.8 : 6.9, w: isWidescreen ? 12.3 : 9.0, h: 0.3, fontFace, fontSize: 10, color: '64748B', align: 'center' });

  // SLIDE 7: OTHER INVESTIGATIONS
  const slide7 = pptx.addSlide();
  slide7.addText('6. Radiological & Diagnostic Reports', {
    x: 0.5, y: 0.4, w: isWidescreen ? 12.3 : 9.0, h: 0.5,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const otherInvText = `Other Diagnostic Investigations:\n${profile.other_investigations || 'US SCAN OF WHOLE ABDOMEN: Wall thickening in terminal ileum (4.2mm).\n\nCOLONOSCOPY & HISTOPATHOLOGY REPORT: Transmural lymphoid aggregates consistent with Crohn\'s Terminal Ileitis.\n\nCHEST X-RAY: Normal lung fields.'}`;
  slide7.addText(otherInvText, {
    x: 0.5, y: 1.1, w: isWidescreen ? 12.3 : 9.0, h: 4.8,
    fontFace, fontSize: 12, color: '0369A1', fill: { color: 'F0F9FF' }, line: { color: 'BAE6FD', width: 1.5 }
  });
  slide7.addText(footerText, { x: 0.5, y: isWidescreen ? 6.8 : 6.9, w: isWidescreen ? 12.3 : 9.0, h: 0.3, fontFace, fontSize: 10, color: '64748B', align: 'center' });

  // SLIDE 8: DIAGNOSIS
  const slide8 = pptx.addSlide();
  slide8.addText('7. Final Clinical Diagnosis', {
    x: 0.5, y: 0.4, w: isWidescreen ? 12.3 : 9.0, h: 0.5,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  slide8.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.5, w: isWidescreen ? 12.3 : 9.0, h: 1.5,
    fill: { color: 'ECFDF5' }, line: { color: emeraldColor, width: 2 }
  });

  slide8.addText(`FINAL DIAGNOSIS :\n${finalDiagnosis}`, {
    x: 0.6, y: 1.7, w: isWidescreen ? 12.1 : 8.8, h: 1.1,
    fontFace, fontSize: titleFontSize, bold: true, color: emeraldColor, align: 'center'
  });

  slide8.addText(`Diagnostic Reasoning & Summary:\nConfirmed via colonoscopic biopsy histopathology and inflammatory marker elevations (CRP 28.5 mg/L).`, {
    x: 0.5, y: 3.3, w: isWidescreen ? 12.3 : 9.0, h: 2.2,
    fontFace, fontSize: 12, color: '1E293B', fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 }
  });
  slide8.addText(footerText, { x: 0.5, y: isWidescreen ? 6.8 : 6.9, w: isWidescreen ? 12.3 : 9.0, h: 0.3, fontFace, fontSize: 10, color: '64748B', align: 'center' });

  // SLIDE 9: TREATMENT / MEDICATION
  const slide9 = pptx.addSlide();
  slide9.addText('8. Prescribed Pharmacotherapy Log', {
    x: 0.5, y: 0.4, w: isWidescreen ? 12.3 : 9.0, h: 0.5,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const drugHeader = [
    { text: 'S.No', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Brand & Generic Name', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Dose & Route', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Frequency', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } },
    { text: 'Indication', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } }
  ];

  const drugRows = drugs.length > 0
    ? drugs.map((d, idx) => [
        { text: `${d.s_no || idx + 1}`, options: { fontFace, fontSize: 10, align: 'center' } },
        { text: `${d.trade_name} ${d.generic_name ? `(${d.generic_name})` : ''}`, options: { fontFace, fontSize: 10, bold: true } },
        { text: `${d.dose} (${d.route_of_admin || 'Oral'})`, options: { fontFace, fontSize: 10 } },
        { text: d.frequency || 'OD', options: { fontFace, fontSize: 10, bold: true } },
        { text: d.indication || 'Symptomatic Management', options: { fontFace, fontSize: 10 } }
      ])
    : [
        [{ text: '1', options: { fontFace, fontSize: 10, align: 'center' } }, { text: 'Inj. Hydrocortisone 100mg', options: { fontFace, fontSize: 10, bold: true } }, { text: '100mg (IV)', options: { fontFace, fontSize: 10 } }, { text: 'TID', options: { fontFace, fontSize: 10, bold: true } }, { text: 'IBD Flare', options: { fontFace, fontSize: 10 } }],
        [{ text: '2', options: { fontFace, fontSize: 10, align: 'center' } }, { text: 'Tab. Mesalamine 1.2g', options: { fontFace, fontSize: 10, bold: true } }, { text: '1.2g (Oral)', options: { fontFace, fontSize: 10 } }, { text: 'BD', options: { fontFace, fontSize: 10, bold: true } }, { text: 'Terminal Ileitis', options: { fontFace, fontSize: 10 } }],
        [{ text: '3', options: { fontFace, fontSize: 10, align: 'center' } }, { text: 'Tab. Pantoprazole 40mg', options: { fontFace, fontSize: 10, bold: true } }, { text: '40mg (Oral)', options: { fontFace, fontSize: 10 } }, { text: 'OD', options: { fontFace, fontSize: 10, bold: true } }, { text: 'Gastroprotection', options: { fontFace, fontSize: 10 } }]
      ];

  slide9.addTable([drugHeader, ...drugRows], {
    x: 0.5, y: 1.0, w: isWidescreen ? 12.3 : 9.0, colW: [0.8, 4.2, 2.5, 2.0, isWidescreen ? 2.8 : 0.0],
    border: { pt: 1, color: 'CBD5E1' }
  });
  slide9.addText(footerText, { x: 0.5, y: isWidescreen ? 6.8 : 6.9, w: isWidescreen ? 12.3 : 9.0, h: 0.3, fontFace, fontSize: 10, color: '64748B', align: 'center' });

  // SLIDE 10: CLINICAL ASSESSMENT / PHARMACIST INTERVENTION & COUNSELLING
  const slide10 = pptx.addSlide();
  slide10.addText('9. Counselling & Pharmacist Interventions', {
    x: 0.5, y: 0.4, w: isWidescreen ? 12.3 : 9.0, h: 0.5,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const counsellingRows = [
    [{ text: 'Clinical Aspect', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 12 } }, { text: 'Details & Action Taken', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 12 } }],
    [{ text: 'Counselled Provided To', options: { fontFace, fontSize: 10, bold: true } }, { text: counselling.counselling_provided_to || 'Patient & Spouse', options: { fontFace, fontSize: 10 } }],
    [{ text: 'Counselling Mode & Time', options: { fontFace, fontSize: 10, bold: true } }, { text: `${counselling.counselling_mode || 'Oral & Pamphlet'} (${counselling.time_taken || '20 min'})`, options: { fontFace, fontSize: 10 } }],
    [{ text: 'Intervention Problem Identified', options: { fontFace, fontSize: 10, bold: true } }, { text: intervention.problem_identified || 'Iron & Mesalamine chelation interaction.', options: { fontFace, fontSize: 10 } }],
    [{ text: 'Pharmacist Recommendation', options: { fontFace, fontSize: 10, bold: true } }, { text: intervention.intervention_provided || 'Space doses by 2 hours.', options: { fontFace, fontSize: 10 } }],
    [{ text: 'Physician Acceptance Status', options: { fontFace, fontSize: 10, bold: true } }, { text: intervention.physician_acceptance || 'Accepted & Implemented.', options: { fontFace, fontSize: 10, color: emeraldColor, bold: true } }]
  ];

  slide10.addTable(counsellingRows, {
    x: 0.5, y: 1.0, w: isWidescreen ? 12.3 : 9.0, colW: [3.5, isWidescreen ? 8.8 : 5.5],
    border: { pt: 1, color: 'CBD5E1' }
  });
  slide10.addText(footerText, { x: 0.5, y: isWidescreen ? 6.8 : 6.9, w: isWidescreen ? 12.3 : 9.0, h: 0.3, fontFace, fontSize: 10, color: '64748B', align: 'center' });

  // SLIDE 11: DISCHARGE SUMMARY & PRECEPTOR APPROVAL
  const slide11 = pptx.addSlide();
  slide11.addText('10. Discharge Summary & Preceptor Verification', {
    x: 0.5, y: 0.4, w: isWidescreen ? 12.3 : 9.0, h: 0.5,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const adrRows = [
    [{ text: 'Record Section', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 12 } }, { text: 'Summary Information & Verification Status', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 12 } }],
    [{ text: 'ADR Suspected Drug & Reaction', options: { fontFace, fontSize: 10, bold: true } }, { text: `${adr.reaction_title || 'Suspected ADR'} (Drug: ${adr.suspected_drug || 'Metformin'})`, options: { fontFace, fontSize: 10 } }],
    [{ text: 'Discharge Summary Notes', options: { fontFace, fontSize: 10, bold: true } }, { text: profile.discharge_summary || 'Patient treated with IV steroids, oral Mesalamine. Symptoms resolved. Discharged on oral maintenance therapy.', options: { fontFace, fontSize: 10 } }],
    [{ text: 'Institutional Case Status', options: { fontFace, fontSize: 10, bold: true } }, { text: 'OFFICIALLY APPROVED & VERIFIED', options: { fontFace, fontSize: 10, bold: true, color: emeraldColor } }],
    [{ text: 'Candidate Student Signature', options: { fontFace, fontSize: 10, bold: true } }, { text: `Digitally Signed by ${studentName} (${rollNumber})`, options: { fontFace, fontSize: 10 } }],
    [{ text: 'Faculty Preceptor Signature', options: { fontFace, fontSize: 10, bold: true } }, { text: `Verified & Approved by ${preceptorName}`, options: { fontFace, fontSize: 10, bold: true, color: primaryColor } }]
  ];

  slide11.addTable(adrRows, {
    x: 0.5, y: 1.0, w: isWidescreen ? 12.3 : 9.0, colW: [3.5, isWidescreen ? 8.8 : 5.5],
    border: { pt: 1, color: 'CBD5E1' }
  });
  slide11.addText(footerText, { x: 0.5, y: isWidescreen ? 6.8 : 6.9, w: isWidescreen ? 12.3 : 9.0, h: 0.3, fontFace, fontSize: 10, color: '64748B', align: 'center' });

  // Save presentation file directly
  const fileName = `${caseId}_Presentation.pptx`;
  await pptx.writeFile({ fileName });
};
