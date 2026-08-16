import pptxgen from 'pptxgenjs';
import { buildNormalizedApprovedCaseData } from './buildNormalizedApprovedCaseData';

/**
 * Generate and download an editable PowerPoint (.pptx) presentation for a Clinical Case.
 * Consumes the central normalized data model from buildNormalizedApprovedCaseData.
 * Respects strict form boundaries and excludes unsubmitted/unapproved forms.
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

  const contentW = 9.0;
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
  const profile = norm.profile || {};
  const vitalsList = norm.vitals || [];
  const labs = norm.labs || [];
  const drugs = norm.drugs || [];
  const counselling = norm.counselling || {};
  const intervention = norm.intervention || {};
  const dir = norm.dir || {};
  const adr = norm.adr || {};

  const addWatermark = (slide) => {
    if (pptSettings?.show_watermark !== false && pptSettings?.ppt_show_watermark !== false) {
      try {
        slide.addText(collegeName.toUpperCase(), {
          x: startX, y: 2.2, w: contentW, h: 1.2,
          fontFace, fontSize: 26, bold: true, color: 'E2E8F0',
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

  if (showCollegeLogo && collegeLogo) {
    try {
      slide1.addImage({ path: collegeLogo, x: startX + 0.1, y: 0.35, w: 0.8, h: 0.8 });
    } catch (e) {}
  }

  if (showHospitalLogo && hospitalLogo) {
    try {
      slide1.addImage({ path: hospitalLogo, x: startX + contentW - 0.9, y: 0.35, w: 0.8, h: 0.8 });
    } catch (e) {}
  }

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

  // Student & Preceptor Metadata Card
  if (pptSettings?.show_student_preceptor !== false && pptSettings?.ppt_show_student_preceptor !== false) {
    slide1.addShape(pptx.shapes.RECTANGLE, {
      x: startX, y: 2.65, w: contentW, h: 1.6,
      fill: { color: darkBgColor }, line: { color: 'CBD5E1', width: 1 }
    });

    slide1.addText([
      { text: 'Submitted / Presented By:\n', options: { bold: true, fontSize: bodyFontSize - 2, color: '64748B' } },
      { text: `${studentName}\n`, options: { bold: true, fontSize: bodyFontSize + 1, color: primaryColor } },
      { text: `Roll No: ${rollNumber}`, options: { fontSize: bodyFontSize - 2, color: '475569' } }
    ], {
      x: startX + 0.3, y: 2.75, w: 4.0, h: 1.4,
      fontFace, align: 'left'
    });

    slide1.addText([
      { text: 'Evaluated & Approved By:\n', options: { bold: true, fontSize: bodyFontSize - 2, color: '64748B' } },
      { text: `${preceptorName}\n`, options: { bold: true, fontSize: bodyFontSize + 1, color: emeraldColor } },
      { text: preceptor?.designation || 'Faculty Preceptor / Evaluator', options: { fontSize: bodyFontSize - 2, color: '475569' } }
    ], {
      x: startX + 4.7, y: 2.75, w: 4.0, h: 1.4,
      fontFace, align: 'right'
    });
  }

  slide1.addText(footerText, {
    x: startX, y: 4.8, w: contentW, h: 0.3,
    fontFace, fontSize: 9, color: '64748B', align: 'center'
  });

  // FORM 1: PATIENT PROFILE DOCUMENTATION (SLIDE 2)
  if (norm.isProfileCompleted) {
    const slide2 = pptx.addSlide();
    addWatermark(slide2);
    slide2.addText('1. PATIENT PROFILE DOCUMENTATION', {
      x: startX, y: 0.3, w: contentW, h: 0.4,
      fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
    });

    const profileRows = [
      [{ text: 'Field', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } }, { text: 'Clinical Detail', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 11 } }],
      [{ text: 'Patient Name', options: { fontFace, fontSize: 10, bold: true } }, { text: norm.demographics.patientName, options: { fontFace, fontSize: 10 } }],
      [{ text: 'Age / Gender', options: { fontFace, fontSize: 10, bold: true } }, { text: `${norm.demographics.age} Yrs / ${norm.demographics.gender}`, options: { fontFace, fontSize: 10 } }],
      [{ text: 'IP / OP Registration No', options: { fontFace, fontSize: 10, bold: true } }, { text: norm.demographics.ipOpNo, options: { fontFace, fontSize: 10, bold: true } }],
      [{ text: 'Department & Ward', options: { fontFace, fontSize: 10, bold: true } }, { text: `${norm.demographics.department} (${norm.demographics.wardBed})`, options: { fontFace, fontSize: 10 } }],
      [{ text: 'Date of Admission', options: { fontFace, fontSize: 10, bold: true } }, { text: norm.dates.doa, options: { fontFace, fontSize: 10 } }],
      [{ text: 'Attending Physician', options: { fontFace, fontSize: 10, bold: true } }, { text: norm.demographics.physician, options: { fontFace, fontSize: 10 } }],
      [{ text: 'Chief Complaints', options: { fontFace, fontSize: 10, bold: true } }, { text: norm.history.chiefComplaints, options: { fontFace, fontSize: 10 } }],
      [{ text: 'Past Medical History', options: { fontFace, fontSize: 10, bold: true } }, { text: norm.history.pastMedicalHistory, options: { fontFace, fontSize: 10 } }]
    ];

    slide2.addTable(profileRows, {
      x: startX, y: 0.8, w: contentW, colW: [2.5, 6.5],
      border: { pt: 1, color: 'CBD5E1' }
    });
    slide2.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });

    // SLIDE 3: CLINICAL EXAMINATIONS & VITALS
    const slide3 = pptx.addSlide();
    addWatermark(slide3);
    slide3.addText('Clinical Examinations & Vital Signs', {
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
          { text: v.date || norm.dates.doa, options: { fontFace, fontSize: 9 } },
          { text: v.temp || '98.6', options: { fontFace, fontSize: 9 } },
          { text: v.bp || '120/80', options: { fontFace, fontSize: 9, bold: true } },
          { text: v.pr || '72', options: { fontFace, fontSize: 9 } },
          { text: v.rr || '18', options: { fontFace, fontSize: 9 } },
          { text: v.spo2 ? `${v.spo2}%` : '98%', options: { fontFace, fontSize: 9, bold: true } }
        ])
      : [
          [{ text: norm.dates.doa, options: { fontFace, fontSize: 9 } }, { text: '98.6', options: { fontFace, fontSize: 9 } }, { text: '120/80', options: { fontFace, fontSize: 9, bold: true } }, { text: '72', options: { fontFace, fontSize: 9 } }, { text: '18', options: { fontFace, fontSize: 9 } }, { text: '98%', options: { fontFace, fontSize: 9, bold: true } }]
        ];

    slide3.addTable([vitalsHeader, ...vitalsRows], {
      x: startX, y: 0.8, w: contentW, border: { pt: 1, color: 'CBD5E1' }
    });

    slide3.addText(`General Exam: ${norm.history.generalExam || 'Conscious & coherent.'}\nSystemic Exam: ${norm.history.systemicExam || 'CVS: S1S2, RS: Clear, GI: Soft.'}`, {
      x: startX, y: 2.8, w: contentW, h: 1.8,
      fontFace, fontSize: bodyFontSize - 1, color: primaryColor, fill: { color: darkBgColor }, line: { color: 'CBD5E1', width: 1 }
    });
    slide3.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });

    // SLIDE 4: LABORATORY & MEDICATION PROFILE
    const slide4 = pptx.addSlide();
    addWatermark(slide4);
    slide4.addText('Laboratory & Prescribed Medication Profile', {
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
          [{ text: '1', options: { fontFace, fontSize: 9, align: 'center' } }, { text: profile.medications || 'Symptomatic Treatment', options: { fontFace, fontSize: 9, bold: true } }, { text: 'As prescribed', options: { fontFace, fontSize: 9 } }, { text: 'OD', options: { fontFace, fontSize: 9 } }, { text: 'Symptomatic', options: { fontFace, fontSize: 9 } }]
        ];

    slide4.addTable([drugHeader, ...drugRows], {
      x: startX, y: 0.8, w: contentW, colW: [0.6, 3.2, 1.8, 1.4, 2.0],
      border: { pt: 1, color: 'CBD5E1' }
    });

    if (profile.discharge_summary) {
      slide4.addText(`Discharge Summary & Instructions:\n${profile.discharge_summary}`, {
        x: startX, y: 3.0, w: contentW, h: 1.6,
        fontFace, fontSize: bodyFontSize - 1, color: primaryColor, fill: { color: darkBgColor }, line: { color: 'CBD5E1', width: 1 }
      });
    }

    slide4.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });
  }

  // FORM 2: PATIENT COUNSELLING DOCUMENTATION
  if (norm.isCounsellingCompleted) {
    const slideCounselling = pptx.addSlide();
    addWatermark(slideCounselling);
    slideCounselling.addText('2. PATIENT COUNSELLING DOCUMENTATION', {
      x: startX, y: 0.3, w: contentW, h: 0.4,
      fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
    });

    const counsellingRows = [
      [{ text: 'Clinical Aspect', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }, { text: 'Details & Action Taken', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }],
      [{ text: 'Counselled Provided To', options: { fontFace, fontSize: 9, bold: true } }, { text: counselling.counselling_provided_to || counselling.patient_type || 'Patient', options: { fontFace, fontSize: 9 } }],
      [{ text: 'Counselling Mode & Time', options: { fontFace, fontSize: 9, bold: true } }, { text: `${counselling.counselling_mode || 'Oral'} (${counselling.time_taken || '15 min'})`, options: { fontFace, fontSize: 9 } }],
      [{ text: 'Disease Counselled', options: { fontFace, fontSize: 9, bold: true } }, { text: counselling.disease_counselled || finalDiagnosis, options: { fontFace, fontSize: 9 } }],
      [{ text: 'Key Focus Points', options: { fontFace, fontSize: 9, bold: true } }, { text: counselling.counselling_points || counselling.points_covered || 'Medication compliance and lifestyle modifications.', options: { fontFace, fontSize: 9 } }],
      [{ text: 'Student Signature', options: { fontFace, fontSize: 9, bold: true } }, { text: `Digitally Signed by ${studentName} (${rollNumber})`, options: { fontFace, fontSize: 9 } }],
      [{ text: 'Preceptor Signature', options: { fontFace, fontSize: 9, bold: true } }, { text: `Verified & Approved by ${preceptorName}`, options: { fontFace, fontSize: 9, bold: true, color: primaryColor } }]
    ];

    slideCounselling.addTable(counsellingRows, {
      x: startX, y: 0.8, w: contentW, colW: [2.8, 6.2],
      border: { pt: 1, color: 'CBD5E1' }
    });
    slideCounselling.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });
  }

  // FORM 3: PHARMACIST INTERVENTION DOCUMENTATION
  if (norm.isInterventionCompleted) {
    const slideIntervention = pptx.addSlide();
    addWatermark(slideIntervention);
    slideIntervention.addText('3. PHARMACIST INTERVENTION DOCUMENTATION', {
      x: startX, y: 0.3, w: contentW, h: 0.4,
      fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
    });

    const interventionRows = [
      [{ text: 'Intervention Aspect', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }, { text: 'Details & Recommendations', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }],
      [{ text: 'Problem Identified', options: { fontFace, fontSize: 9, bold: true } }, { text: intervention.prescription_problems || intervention.description_of_problem || intervention.problem_identified || 'None', options: { fontFace, fontSize: 9 } }],
      [{ text: 'Action & Recommendation', options: { fontFace, fontSize: 9, bold: true } }, { text: intervention.recommendations || intervention.action_taken || intervention.intervention_provided || 'None', options: { fontFace, fontSize: 9 } }],
      [{ text: 'Physician Acceptance', options: { fontFace, fontSize: 9, bold: true } }, { text: intervention.physician_acceptance || intervention.status || 'Accepted', options: { fontFace, fontSize: 9, color: emeraldColor, bold: true } }],
      [{ text: 'Student Signature', options: { fontFace, fontSize: 9, bold: true } }, { text: `Digitally Signed by ${studentName} (${rollNumber})`, options: { fontFace, fontSize: 9 } }],
      [{ text: 'Preceptor Signature', options: { fontFace, fontSize: 9, bold: true } }, { text: `Verified & Approved by ${preceptorName}`, options: { fontFace, fontSize: 9, bold: true, color: primaryColor } }]
    ];

    slideIntervention.addTable(interventionRows, {
      x: startX, y: 0.8, w: contentW, colW: [2.8, 6.2],
      border: { pt: 1, color: 'CBD5E1' }
    });
    slideIntervention.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });
  }

  // FORM 4: DRUG INFORMATION REQUEST DOCUMENTATION
  if (norm.isDirCompleted) {
    const slideDir = pptx.addSlide();
    addWatermark(slideDir);
    slideDir.addText('4. DRUG INFORMATION REQUEST DOCUMENTATION', {
      x: startX, y: 0.3, w: contentW, h: 0.4,
      fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
    });

    const dirRows = [
      [{ text: 'Enquiry Aspect', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }, { text: 'Details & Response', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }],
      [{ text: 'Query Date', options: { fontFace, fontSize: 9, bold: true } }, { text: norm.dates.queryDate, options: { fontFace, fontSize: 9 } }],
      [{ text: 'Enquirer Name & Category', options: { fontFace, fontSize: 9, bold: true } }, { text: `${dir.enquirer_name || 'Physician'} (${dir.enquirer_category || 'Doctor'})`, options: { fontFace, fontSize: 9 } }],
      [{ text: 'Details of Query', options: { fontFace, fontSize: 9, bold: true } }, { text: dir.details_of_enquiry || dir.query || 'N/A', options: { fontFace, fontSize: 9 } }],
      [{ text: 'Response Provided', options: { fontFace, fontSize: 9, bold: true } }, { text: dir.information_provided || dir.response || 'N/A', options: { fontFace, fontSize: 9 } }],
      [{ text: 'Student Signature', options: { fontFace, fontSize: 9, bold: true } }, { text: `Digitally Signed by ${studentName} (${rollNumber})`, options: { fontFace, fontSize: 9 } }],
      [{ text: 'Preceptor Signature', options: { fontFace, fontSize: 9, bold: true } }, { text: `Verified & Approved by ${preceptorName}`, options: { fontFace, fontSize: 9, bold: true, color: primaryColor } }]
    ];

    slideDir.addTable(dirRows, {
      x: startX, y: 0.8, w: contentW, colW: [2.8, 6.2],
      border: { pt: 1, color: 'CBD5E1' }
    });
    slideDir.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });
  }

  // FORM 5: ADR DOCUMENTATION LOG
  if (norm.isAdrCompleted) {
    const slideAdr = pptx.addSlide();
    addWatermark(slideAdr);
    slideAdr.addText('5. ADR DOCUMENTATION LOG', {
      x: startX, y: 0.3, w: contentW, h: 0.4,
      fontFace, fontSize: titleFontSize, bold: true, color: primaryColor
    });

    const adrRows = [
      [{ text: 'Record Section', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }, { text: 'Summary Information & Verification Status', options: { bold: true, fill: { color: 'F1F5F9' }, fontFace, fontSize: 10 } }],
      [{ text: 'ADR Onset Date', options: { fontFace, fontSize: 9, bold: true } }, { text: norm.dates.adrOnsetDate || 'N/A', options: { fontFace, fontSize: 9 } }],
      [{ text: 'Suspected Drug & Reaction', options: { fontFace, fontSize: 9, bold: true } }, { text: adr.suspected_drug ? `${adr.suspected_drug} — ${adr.reaction_description || adr.reaction_title || 'Reaction Reported'}` : 'No ADR Reported', options: { fontFace, fontSize: 9 } }],
      [{ text: 'Causality & Severity', options: { fontFace, fontSize: 9, bold: true } }, { text: `Causality: ${adr.naranjo_causality || 'Possible'} | Severity: ${adr.reaction_severity || 'Moderate'}`, options: { fontFace, fontSize: 9 } }],
      [{ text: 'Student Signature', options: { fontFace, fontSize: 9, bold: true } }, { text: `Digitally Signed by ${studentName} (${rollNumber})`, options: { fontFace, fontSize: 9 } }],
      [{ text: 'Preceptor Signature', options: { fontFace, fontSize: 9, bold: true } }, { text: `Verified & Approved by ${preceptorName}`, options: { fontFace, fontSize: 9, bold: true, color: primaryColor } }]
    ];

    slideAdr.addTable(adrRows, {
      x: startX, y: 0.8, w: contentW, colW: [2.8, 6.2],
      border: { pt: 1, color: 'CBD5E1' }
    });
    slideAdr.addText(footerText, { x: startX, y: 4.8, w: contentW, h: 0.3, fontFace, fontSize: 9, color: '64748B', align: 'center' });
  }

  // Save presentation file directly
  const fileName = `${caseId}_Presentation.pptx`;
  await pptx.writeFile({ fileName });
};
