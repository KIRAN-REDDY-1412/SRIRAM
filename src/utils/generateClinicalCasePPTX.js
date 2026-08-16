import pptxgen from 'pptxgenjs';
import { buildNormalizedApprovedCaseData } from './buildNormalizedApprovedCaseData';

/**
 * Generate and download an editable PowerPoint (.pptx) presentation for a Clinical Case.
 * Consumes the central normalized data model from buildNormalizedApprovedCaseData.
 */
export const generateClinicalCasePPTX = async ({
  clinicalCase = {},
  student = {},
  preceptor = {},
  college = {},
  caseModulesData = {},
  pptSettings = {}
}) => {
  const norm = buildNormalizedApprovedCaseData({
    clinicalCase,
    student,
    preceptor,
    college,
    caseModulesData
  });

  const pptx = new pptxgen();

  // Page setup & configuration
  const isWidescreen = (pptSettings?.aspect_ratio || pptSettings?.ppt_aspect_ratio) !== '4:3 (Standard)';
  pptx.layout = isWidescreen ? 'LAYOUT_16x9' : 'LAYOUT_4x3';

  // Fonts & Styling Tokens
  const fontFace = pptSettings?.font_family || pptSettings?.ppt_font_family || 'Times New Roman';
  const titleFontSize = parseInt(pptSettings?.ppt_title_font_size || pptSettings?.title_font_size || '20', 10);
  const subHeadingFontSize = parseInt(pptSettings?.ppt_subheading_font_size || pptSettings?.subheading_font_size || '16', 10);
  const bodyFontSize = parseInt(pptSettings?.ppt_body_font_size || pptSettings?.body_font_size || '13', 10);

  const primaryColor = '0F172A'; // Slate-900
  const emeraldColor = '059669'; // Emerald-600
  const darkBgColor = 'F8FAFC'; // Slate-50

  const slideW = isWidescreen ? 10.0 : 10.0;
  const contentW = isWidescreen ? 9.0 : 9.0;
  const startX = 0.5;

  const collegeName = norm.collegeName;
  const hospitalName = norm.hospitalName;
  const caseId = norm.caseId;
  const studentName = norm.studentName;
  const rollNumber = norm.studentRoll;
  const preceptorName = norm.preceptorName;
  const finalDiagnosis = norm.diagnosis.final;
  const footerText = pptSettings?.footer_text || pptSettings?.ppt_footer_text || `${collegeName} • Clinical Case Presentation`;

  // Module Data from central norm model
  const profile = norm.profile;
  const vitalsList = norm.vitals;
  const labs = norm.labs;
  const drugs = norm.drugs;
  const counselling = norm.counselling;
  const intervention = norm.intervention;
  const dir = norm.dir;
  const adr = norm.adr;

  const addWatermark = (slide) => {
    if (pptSettings?.show_watermark !== false && pptSettings?.ppt_show_watermark !== false) {
      try {
        slide.addText(collegeName.toUpperCase(), {
          x: startX, y: 2.2, w: contentW, h: 1.2,
          fontFace, fontSize: 28, bold: true, color: 'E2E8F0',
          align: 'center', rotate: 330
        });
      } catch (e) {}
    }
  };

  // SLIDE 1: COVER / TITLE SLIDE
  const slide1 = pptx.addSlide();
  slide1.background = { color: 'FFFFFF' };
  addWatermark(slide1);

  // College Banner Header Box
  slide1.addShape(pptx.shapes.RECTANGLE, {
    x: startX, y: 0.3, w: contentW, h: 0.9,
    fill: { color: 'F1F5F9' }, line: { color: '0F172A', width: 1.5 }
  });

  const collegeLogo = college?.college_logo_url || college?.logo_url || '';
  const hospitalLogo = college?.hospital_logo_url || '';
  const showCollegeLogo = pptSettings?.show_college_logo ?? pptSettings?.show_logo ?? true;
  const showHospitalLogo = pptSettings?.show_hospital_logo ?? true;
  const showCollegeName = pptSettings?.show_college_name ?? true;
  const showAutonomous = pptSettings?.show_autonomous ?? true;
  const showHospitalName = pptSettings?.show_hospital_name ?? true;

  // Left Side: College Logo
  if (showCollegeLogo && collegeLogo) {
    try {
      slide1.addImage({
        path: collegeLogo,
        x: startX + 0.1, y: 0.35, w: 0.8, h: 0.8
      });
    } catch (e) {
      console.warn('Could not embed college logo in PPT:', e);
    }
  }

  // Right Side: Hospital Logo
  if (showHospitalLogo && hospitalLogo) {
    try {
      slide1.addImage({
        path: hospitalLogo,
        x: startX + contentW - 0.9, y: 0.35, w: 0.8, h: 0.8
      });
    } catch (e) {
      console.warn('Could not embed hospital logo in PPT:', e);
    }
  }

  // Center Text: College Name & Hospital Subtitle
  if (showCollegeName) {
    slide1.addText(collegeName.toUpperCase(), {
      x: startX + 1.0, y: 0.35, w: contentW - 2.0, h: 0.4,
      fontFace, fontSize: titleFontSize - 3, bold: true, color: primaryColor, align: 'center'
    });
  }

  const subTextParts = [];
  if (showAutonomous) subTextParts.push('(Autonomous)');
  if (showHospitalName) subTextParts.push(hospitalName);

  if (subTextParts.length > 0) {
    slide1.addText(subTextParts.join(' • '), {
      x: startX + 1.0, y: 0.75, w: contentW - 2.0, h: 0.3,
      fontFace, fontSize: Math.max(subHeadingFontSize - 4, 11), italic: true, color: '475569', align: 'center'
    });
  }

  // Case ID Sub-bar
  slide1.addShape(pptx.shapes.RECTANGLE, {
    x: startX, y: 1.3, w: contentW, h: 0.35,
    fill: { color: '0F172A' }
  });

  slide1.addText(`CASE ID : ${caseId}`, {
    x: startX + 0.1, y: 1.32, w: contentW - 0.2, h: 0.3,
    fontFace: 'Courier New', fontSize: bodyFontSize - 1, bold: true, color: 'FFFFFF', align: 'center'
  });

  // Main Presentation Title & Diagnosis
  slide1.addText('CLINICAL CASE PRESENTATION', {
    x: startX + 0.1, y: 1.75, w: contentW - 0.2, h: 0.4,
    fontFace, fontSize: titleFontSize + 2, bold: true, color: emeraldColor, align: 'center'
  });

  slide1.addText(`Final Diagnosis: ${finalDiagnosis}`, {
    x: startX + 0.1, y: 2.15, w: contentW - 0.2, h: 0.4,
    fontFace, fontSize: subHeadingFontSize + 1, bold: true, color: primaryColor, align: 'center'
  });

  // Student & Preceptor Metadata Card (Left: Preceptor, Right: Submitted By Student)
  if (pptSettings?.show_student_preceptor !== false && pptSettings?.ppt_show_student_preceptor !== false) {
    slide1.addShape(pptx.shapes.RECTANGLE, {
      x: startX, y: 2.65, w: contentW, h: 1.6,
      fill: { color: darkBgColor }, line: { color: 'CBD5E1', width: 1 }
    });

    // LEFT COLUMN: Submitted / Presented By (Student)
    slide1.addText([
      { text: 'Submitted / Presented By:\n', options: { bold: true, fontSize: bodyFontSize - 2, color: '64748B' } },
      { text: `${studentName}\n`, options: { bold: true, fontSize: bodyFontSize + 1, color: primaryColor } },
      { text: `Roll No: ${rollNumber}`, options: { fontSize: bodyFontSize - 2, color: '475569' } }
    ], {
      x: startX + 0.3, y: 2.75, w: 4.0, h: 1.4,
      fontFace, align: 'left'
    });

    // RIGHT COLUMN: Evaluated & Approved By (Faculty Preceptor on RIGHT SIDE)
    slide1.addText([
      { text: 'Evaluated & Approved By:\n', options: { bold: true, fontSize: bodyFontSize - 2, color: '64748B' } },
      { text: `${preceptorName}\n`, options: { bold: true, fontSize: bodyFontSize + 1, color: emeraldColor } },
      { text: preceptor?.designation || 'Faculty Preceptor / Evaluator', options: { fontSize: bodyFontSize - 2, color: '475569' } }
    ], {
      x: startX + 4.7, y: 2.75, w: 4.0, h: 1.4,
      fontFace, align: 'right'
    });
  }

  // Footer
  slide1.addText(footerText, {
    x: startX, y: 4.8, w: contentW, h: 0.3,
    fontFace, fontSize: 9, color: '64748B', align: 'center'
  });

  // SLIDE 2: PATIENT PROFILE DOCUMENTATION
  const slide2 = pptx.addSlide();
  slide2.addText('1. PATIENT PROFILE DOCUMENTATION', {
    x: startX, y: 0.3, w: contentW, h: 0.4,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const profileRows = [
    [{ text: 'Field', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } }, { text: 'Clinical Detail', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } }],
    [{ text: 'Patient Name', options: { fontFace, fontSize: 10, bold: true } }, { text: profile.patient_name || 'John Doe', options: { fontFace, fontSize: 10 } }],
    [{ text: 'Age / Gender', options: { fontFace, fontSize: 10, bold: true } }, { text: `${profile.age || '46'} Yrs / ${profile.gender || 'Male'}`, options: { fontFace, fontSize: 10 } }],
    [{ text: 'IP / OP Registration No', options: { fontFace, fontSize: 10, bold: true } }, { text: profile.ip_op_number || 'IP-987654', options: { fontFace, fontSize: 10, bold: true } }],
    [{ text: 'Department & Ward', options: { fontFace, fontSize: 10, bold: true } }, { text: `${profile.department || clinicalCase.department || 'Gastroenterology'} (${profile.ward || 'Male Medical Ward'})`, options: { fontFace, fontSize: 10 } }],
    [{ text: 'Date of Admission', options: { fontFace, fontSize: 10, bold: true } }, { text: profile.date_of_admission || '2026-08-01', options: { fontFace, fontSize: 10 } }],
    [{ text: 'Attending Physician', options: { fontFace, fontSize: 10, bold: true } }, { text: profile.attending_physician || 'Dr. N. Rajesh, M.D.', options: { fontFace, fontSize: 10 } }]
  ];

  slide2.addTable(profileRows, {
    x: startX, y: 0.8, w: contentW, colW: [2.5, 6.5],
    border: { pt: 1, color: 'CBD5E1' }
  });
  slide2.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });

  // SLIDE 3: CHIEF COMPLAINTS & HISTORY
  const slide3 = pptx.addSlide();
  slide3.addText('2. Chief Complaints & Clinical History', {
    x: startX, y: 0.3, w: contentW, h: 0.4,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const historyText = `Chief Complaints:\n${profile.chief_complaints || clinicalCase.chief_complaints || 'Abdominal pain, fever, diarrhea for 5 days.'}\n\nPast Medical History:\n${profile.past_medical_history || 'No significant past medical history.'}\n\nPast Medication History:\n${profile.past_medication_history || 'No long-term medications.'}`;

  slide3.addText(historyText, {
    x: startX, y: 0.8, w: contentW, h: 3.5,
    fontFace, fontSize: bodyFontSize, color: primaryColor, fill: { color: darkBgColor }, line: { color: 'CBD5E1', width: 1 }
  });
  slide3.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });

  // SLIDE 4: CLINICAL EXAMINATION & VITALS LOG
  const slide4 = pptx.addSlide();
  slide4.addText('7. CLINICAL EXAMINATION & VITAL SIGNS', {
    x: startX, y: 0.3, w: contentW, h: 0.4,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const examText = `General Examination:\n${profile.general_examination || 'Conscious, coherent, febrile (100.4°F), no pallor, icterus, or cyanosis.'}\n\nSystemic Examination:\n${profile.systemic_examination || 'CVS: S1, S2 heard. RS: Clear. GI: Tenderness in right lower quadrant. CNS: Intact.'}`;

  slide4.addText(examText, {
    x: startX, y: 0.8, w: contentW, h: 3.5,
    fontFace, fontSize: bodyFontSize, color: primaryColor, fill: { color: darkBgColor }, line: { color: 'CBD5E1', width: 1 }
  });
  slide4.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });

  // SLIDE 5: VITAL SIGNS LOG TABLE
  const slide5 = pptx.addSlide();
  slide5.addText('VITAL SIGNS LOG CHART', {
    x: startX, y: 0.3, w: contentW, h: 0.4,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const vitalsHeader = [
    { text: 'Date', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'Temp (°F)', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'BP (mmHg)', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'Pulse Rate', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'Resp Rate', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'SpO2 (%)', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }
  ];

  const vitalsRows = vitalsList.length > 0
    ? vitalsList.map(v => [
        { text: v.date || '2026-08-01', options: { fontFace, fontSize: 9 } },
        { text: v.temp || '98.6', options: { fontFace, fontSize: 9 } },
        { text: v.bp || '120/80', options: { fontFace, fontSize: 9, bold: true } },
        { text: v.pr || '72', options: { fontFace, fontSize: 9 } },
        { text: v.rr || '18', options: { fontFace, fontSize: 9 } },
        { text: v.spo2 ? `${v.spo2}%` : '98%', options: { fontFace, fontSize: 9, bold: true } }
      ])
    : [
        [{ text: '2026-08-01', options: { fontFace, fontSize: 9 } }, { text: '100.4', options: { fontFace, fontSize: 9 } }, { text: '130/85', options: { fontFace, fontSize: 9, bold: true } }, { text: '88', options: { fontFace, fontSize: 9 } }, { text: '20', options: { fontFace, fontSize: 9 } }, { text: '98%', options: { fontFace, fontSize: 9, bold: true } }],
        [{ text: '2026-08-02', options: { fontFace, fontSize: 9 } }, { text: '98.6', options: { fontFace, fontSize: 9 } }, { text: '120/78', options: { fontFace, fontSize: 9, bold: true } }, { text: '76', options: { fontFace, fontSize: 9 } }, { text: '18', options: { fontFace, fontSize: 9 } }, { text: '99%', options: { fontFace, fontSize: 9, bold: true } }]
      ];

  slide5.addTable([vitalsHeader, ...vitalsRows], {
    x: startX, y: 1.7, w: contentW, border: { pt: 1, color: 'CBD5E1' }
  });
  slide5.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });

  // SLIDE 6: LABORATORY INVESTIGATIONS
  const slide6 = pptx.addSlide();
  slide6.addText('8. LABORATORY INVESTIGATIONS', {
    x: startX, y: 0.3, w: contentW, h: 0.4,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const labHeader = [
    { text: 'Category', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'Parameter Name', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'Observed Value', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'Reference Range', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'Inference', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }
  ];

  const labRows = labs.length > 0
    ? labs.map(l => [
        { text: l.category || 'Haematology', options: { fontFace, fontSize: 9 } },
        { text: l.parameter_name || 'Hb', options: { fontFace, fontSize: 9, bold: true } },
        { text: `${l.test_value || '10.2'} ${l.unit || ''}`, options: { fontFace, fontSize: 9, bold: true } },
        { text: l.reference_range || '13-17 g/dL', options: { fontFace, fontSize: 9 } },
        { text: l.clinical_inference || 'Normal', options: { fontFace, fontSize: 9, bold: true, color: '0284C7' } }
      ])
    : [
        [{ text: 'Haematology', options: { fontFace, fontSize: 9 } }, { text: 'Hemoglobin (Hb)', options: { fontFace, fontSize: 9, bold: true } }, { text: '10.2 g/dL', options: { fontFace, fontSize: 9, bold: true } }, { text: '13.0 - 17.0 g/dL', options: { fontFace, fontSize: 9 } }, { text: 'Anemia', options: { fontFace, fontSize: 9, bold: true, color: 'DC2626' } }],
        [{ text: 'Haematology', options: { fontFace, fontSize: 9 } }, { text: 'Total WBC Count', options: { fontFace, fontSize: 9, bold: true } }, { text: '13,500 /cu.mm', options: { fontFace, fontSize: 9, bold: true } }, { text: '4000 - 11000', options: { fontFace, fontSize: 9 } }, { text: 'Leukocytosis', options: { fontFace, fontSize: 9, bold: true, color: 'DC2626' } }],
        [{ text: 'Biochemistry', options: { fontFace, fontSize: 9 } }, { text: 'CRP', options: { fontFace, fontSize: 9, bold: true } }, { text: '28.5 mg/L', options: { fontFace, fontSize: 9, bold: true } }, { text: '0 - 5.0 mg/L', options: { fontFace, fontSize: 9 } }, { text: 'Inflammation', options: { fontFace, fontSize: 9, bold: true, color: 'DC2626' } }]
      ];

  slide6.addTable([labHeader, ...labRows], {
    x: startX, y: 0.8, w: contentW, colW: [1.8, 2.5, 1.8, 1.8, 1.1],
    border: { pt: 1, color: 'CBD5E1' }
  });
  slide6.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });

  // SLIDE 7: OTHER INVESTIGATIONS
  const slide7 = pptx.addSlide();
  slide7.addText('Radiological & Diagnostic Reports', {
    x: startX, y: 0.3, w: contentW, h: 0.4,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const otherInvText = `Other Diagnostic Investigations:\n${profile.other_investigations || 'US SCAN OF WHOLE ABDOMEN: Wall thickening in terminal ileum (4.2mm).\n\nCOLONOSCOPY & HISTOPATHOLOGY REPORT: Transmural lymphoid aggregates consistent with Crohn\'s Terminal Ileitis.\n\nCHEST X-RAY: Normal lung fields.'}`;
  slide7.addText(otherInvText, {
    x: startX, y: 0.8, w: contentW, h: 3.5,
    fontFace, fontSize: 11, color: '0369A1', fill: { color: 'F0F9FF' }, line: { color: 'BAE6FD', width: 1.5 }
  });
  slide7.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });

  // SLIDE 8: DIAGNOSIS
  const slide8 = pptx.addSlide();
  slide8.addText('9. PROVISIONAL & FINAL DIAGNOSIS', {
    x: startX, y: 0.3, w: contentW, h: 0.4,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  slide8.addShape(pptx.shapes.RECTANGLE, {
    x: startX, y: 0.8, w: contentW, h: 1.1,
    fill: { color: 'ECFDF5' }, line: { color: emeraldColor, width: 2 }
  });

  slide8.addText(`FINAL DIAGNOSIS :\n${finalDiagnosis}`, {
    x: startX + 0.1, y: 0.9, w: contentW - 0.2, h: 0.9,
    fontFace, fontSize: titleFontSize, bold: true, color: emeraldColor, align: 'center'
  });

  slide8.addText(`Diagnostic Reasoning & Summary:\nConfirmed via colonoscopic biopsy histopathology and inflammatory marker elevations (CRP 28.5 mg/L).`, {
    x: startX, y: 2.1, w: contentW, h: 2.2,
    fontFace, fontSize: 11, color: '1E293B', fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 }
  });
  slide8.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });

  // SLIDE 9: TREATMENT / MEDICATION
  const slide9 = pptx.addSlide();
  slide9.addText('10. MEDICATION PROFILE / DISCHARGE SUMMARY', {
    x: startX, y: 0.3, w: contentW, h: 0.4,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const drugHeader = [
    { text: 'S.No', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'Brand & Generic Name', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'Dose & Route', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'Frequency', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } },
    { text: 'Indication', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }
  ];

  const drugRows = drugs.length > 0
    ? drugs.map((d, idx) => [
        { text: `${d.s_no || idx + 1}`, options: { fontFace, fontSize: 9, align: 'center' } },
        { text: `${d.trade_name || d.brand_name || ''} ${d.generic_name || d.drug_name ? `(${d.generic_name || d.drug_name})` : ''}`, options: { fontFace, fontSize: 9, bold: true } },
        { text: `${d.dose || '—'} (${d.route_of_admin || d.route || 'Oral'})`, options: { fontFace, fontSize: 9 } },
        { text: d.frequency || 'OD', options: { fontFace, fontSize: 9, bold: true } },
        { text: d.indication || '—', options: { fontFace, fontSize: 9 } }
      ])
    : [
        [{ text: '—', options: { fontFace, fontSize: 9, align: 'center' } }, { text: 'No medications logged', options: { fontFace, fontSize: 9, italic: true } }, { text: '—', options: { fontFace, fontSize: 9 } }, { text: '—', options: { fontFace, fontSize: 9 } }, { text: '—', options: { fontFace, fontSize: 9 } }]
      ];

  slide9.addTable([drugHeader, ...drugRows], {
    x: startX, y: 0.8, w: contentW, colW: [0.6, 3.2, 1.8, 1.4, 2.0],
    border: { pt: 1, color: 'CBD5E1' }
  });
  slide9.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });

  // SLIDE 10: CLINICAL ASSESSMENT / PHARMACIST INTERVENTION & COUNSELLING
  const slide10 = pptx.addSlide();
  slide10.addText('9. Counselling & Pharmacist Interventions', {
    x: startX, y: 0.3, w: contentW, h: 0.4,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const counsellingRows = [
    [{ text: 'Clinical Aspect', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }, { text: 'Details & Action Taken', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }],
    [{ text: 'Counselled Provided To', options: { fontFace, fontSize: 9, bold: true } }, { text: counselling.counselling_provided_to || counselling.patient_type || 'Patient', options: { fontFace, fontSize: 9 } }],
    [{ text: 'Counselling Mode & Time', options: { fontFace, fontSize: 9, bold: true } }, { text: `${counselling.counselling_mode || 'Oral'} (${counselling.time_taken || '15 min'})`, options: { fontFace, fontSize: 9 } }],
    [{ text: 'Intervention Problem Identified', options: { fontFace, fontSize: 9, bold: true } }, { text: intervention.prescription_problems || intervention.description_of_problem || intervention.problem_identified || 'Not Applicable / None Submitted', options: { fontFace, fontSize: 9 } }],
    [{ text: 'Pharmacist Recommendation', options: { fontFace, fontSize: 9, bold: true } }, { text: intervention.recommendations || intervention.action_taken || intervention.intervention_provided || 'Not Applicable / None Submitted', options: { fontFace, fontSize: 9 } }],
    [{ text: 'Physician Acceptance Status', options: { fontFace, fontSize: 9, bold: true } }, { text: intervention.physician_acceptance || intervention.outcome || intervention.status || 'Not Applicable', options: { fontFace, fontSize: 9, color: emeraldColor, bold: true } }]
  ];

  slide10.addTable(counsellingRows, {
    x: startX, y: 0.8, w: contentW, colW: [2.8, 6.2],
    border: { pt: 1, color: 'CBD5E1' }
  });
  slide10.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });

  // SLIDE 11: DISCHARGE SUMMARY & PRECEPTOR APPROVAL
  const slide11 = pptx.addSlide();
  slide11.addText('10. Discharge Summary & Preceptor Verification', {
    x: startX, y: 0.3, w: contentW, h: 0.4,
    fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
  });

  const adrRows = [
    [{ text: 'Record Section', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }, { text: 'Summary Information & Verification Status', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }],
    [{ text: 'ADR Suspected Drug & Reaction', options: { fontFace, fontSize: 9, bold: true } }, { text: adr.suspected_drug ? `${adr.suspected_drug} — ${adr.reaction_description || adr.reaction_title || adr.reaction}` : 'No ADR Reported', options: { fontFace, fontSize: 9 } }],
    [{ text: 'Discharge Summary Notes', options: { fontFace, fontSize: 9, bold: true } }, { text: profile.discharge_summary || 'Discharged in stable condition as per physician advice.', options: { fontFace, fontSize: 9 } }],
    [{ text: 'Institutional Case Status', options: { fontFace, fontSize: 9, bold: true } }, { text: 'OFFICIALLY APPROVED & VERIFIED', options: { fontFace, fontSize: 9, bold: true, color: emeraldColor } }],
    [{ text: 'Candidate Student Signature', options: { fontFace, fontSize: 9, bold: true } }, { text: `Digitally Signed by ${studentName} (${rollNumber})`, options: { fontFace, fontSize: 9 } }],
    [{ text: 'Faculty Preceptor Signature', options: { fontFace, fontSize: 9, bold: true } }, { text: `Verified & Approved by ${preceptorName}`, options: { fontFace, fontSize: 9, bold: true, color: primaryColor } }]
  ];

  slide11.addTable(adrRows, {
    x: startX, y: 0.8, w: contentW, colW: [2.8, 6.2],
    border: { pt: 1, color: 'CBD5E1' }
  });
  slide11.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });

  // Save presentation file directly
  const fileName = `${caseId}_Presentation.pptx`;
  await pptx.writeFile({ fileName });
};
