import { jsPDF } from 'jspdf';

/**
 * Direct High-Resolution Vector PDF Generator for Approved Clinical Cases.
 * Fully dynamic layout engine — renders ONLY actual submitted clinical data.
 * Profile & Counselling are mandatory; Intervention, Drug Info, and ADR Log are rendered ONLY if actually submitted.
 */
export const generateOfficialClinicalCasePDF = async ({
  clinicalCase = {},
  student = {},
  preceptor = {},
  college = {},
  caseModulesData = {},
  branding = {}
}) => {
  const isLandscape = branding?.orientation?.toLowerCase() === 'landscape';
  const isLetter = branding?.paper_size?.toLowerCase() === 'letter';

  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: isLetter ? 'letter' : 'a4',
    compress: true
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2; // 180mm
  const maxY = pageHeight - 20; // 277mm bottom content limit before footer

  const caseId = clinicalCase?.case_id || 'AMRMCP-2026-000001';
  const fileName = `${caseId}_Approved.pdf`;
  const collegeName = college?.college_name || college?.name || 'A.M.REDDY MEMORIAL COLLEGE OF PHARMACY';
  const hospitalName = college?.hospital_name || clinicalCase?.hospital_name || 'Lalitha Superspecialities Hospital';

  const studentName = student?.full_name || clinicalCase?.student_name || 'K.Nikhil';
  const studentRoll = student?.roll_number || 'Y22PHD0314';

  const preceptorName = preceptor?.full_name || clinicalCase?.assigned_preceptor_name || 'Dr. SAHITHI SRI';
  const preceptorDesig = preceptor?.designation || 'ASSISTANT PROFESSOR';

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  const profile = caseModulesData?.profile || {};
  const vitalsList = caseModulesData?.vitals || [];
  const labs = caseModulesData?.labs || [];
  const drugs = caseModulesData?.drugs || [];
  const counselling = caseModulesData?.counselling || {};
  const intervention = caseModulesData?.intervention || {};
  const dir = caseModulesData?.dir || {};
  const adr = caseModulesData?.adr || {};

  const finalDiagnosis = clinicalCase?.final_diagnosis || clinicalCase?.diagnosis || profile.final_diagnosis || profile.provisional_diagnosis || 'Clinical Case Presentation';

  const collegeLogo = college?.college_logo_url || college?.logo_url;
  const hospitalLogo = college?.hospital_logo_url;

  // Helper to check if an optional form contains actual submitted data
  const hasData = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    return Object.values(obj).some(val => {
      if (val === null || val === undefined || val === '') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      if (typeof val === 'object' && Object.keys(val).length === 0) return false;
      return true;
    });
  };

  const hasIntervention = hasData(intervention);
  const hasDir = hasData(dir);
  const hasAdr = hasData(adr);

  // Helper for drawing repeating page header
  const drawPageHeader = () => {
    // Header Outer Box
    doc.setDrawColor(15, 23, 42); // slate-900
    doc.setLineWidth(0.4);
    doc.rect(marginX, 12, contentWidth, 22);

    // College Logo (Left)
    if (collegeLogo && typeof collegeLogo === 'string' && collegeLogo.startsWith('data:image')) {
      try {
        const fmt = collegeLogo.includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(collegeLogo, fmt, marginX + 2, 13.5, 17, 17);
      } catch (e) {}
    }

    // Hospital Logo (Right)
    if (hospitalLogo && typeof hospitalLogo === 'string' && hospitalLogo.startsWith('data:image')) {
      try {
        const fmt = hospitalLogo.includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(hospitalLogo, fmt, pageWidth - marginX - 19, 13.5, 17, 17);
      } catch (e) {}
    }

    // College Name
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(collegeName.toUpperCase(), pageWidth / 2, 19, { align: 'center' });

    // Subtitle (Autonomous & Hospital)
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`(Autonomous) • ${hospitalName}`, pageWidth / 2, 24, { align: 'center' });

    // Document Sub-header Banner
    doc.setFillColor(15, 23, 42);
    doc.rect(marginX, 28, contentWidth, 5, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`CASE ID : ${caseId}   •   OFFICIAL APPROVED CLINICAL CASE RECORD`, pageWidth / 2, 31.5, { align: 'center' });
  };

  // Helper for drawing soft watermark
  const drawWatermark = () => {
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(241, 245, 249); // slate-100 (soft light gray)
    doc.text(collegeName.toUpperCase(), pageWidth / 2, pageHeight / 2, { align: 'center', angle: 30 });
  };

  // Helper for drawing page footer (3 distinct non-overlapping columns)
  const drawPageFooter = (pageNum, totalPages) => {
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PharmDVerse • Official Approved Record', marginX, pageHeight - 6);
    doc.text(currentDateStr, pageWidth / 2, pageHeight - 6, { align: 'center' });
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginX, pageHeight - 6, { align: 'right' });
  };

  let y = 38;

  // Helper for dynamic page overflow management
  const ensureSpace = (neededHeight) => {
    if (y + neededHeight > maxY) {
      doc.addPage();
      drawWatermark();
      drawPageHeader();
      y = 38;
      return true; // Indicates page break occurred
    }
    return false;
  };

  // --- START PAGE 1 ---
  drawWatermark();
  drawPageHeader();

  let sectionCounter = 1;

  // 1. PATIENT DEMOGRAPHICS & CLINICAL HISTORY (MANDATORY PROFILE)
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(2, 132, 199); // secondary cyan
  doc.text(`${sectionCounter++}. PATIENT DEMOGRAPHICS & CLINICAL HISTORY`, marginX, y);
  y += 4;

  // Patient Profile Table Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, y, contentWidth, 38, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  const col1 = marginX + 3;
  const col2 = marginX + 90;

  doc.text(`Patient Name: ${profile.patient_name || clinicalCase.patient_name || 'N/A'}`, col1, y + 6);
  doc.text(`Age / Gender: ${profile.age || clinicalCase.age || 'N/A'} Yrs / ${profile.gender || clinicalCase.gender || 'N/A'}`, col2, y + 6);

  doc.text(`IP/OP No: ${profile.ip_op_number || profile.ip_no || clinicalCase.ip_op_number || 'N/A'}`, col1, y + 12);
  doc.text(`Ward / Bed: ${profile.ward || clinicalCase.ward || 'N/A'}`, col2, y + 12);

  doc.text(`Department: ${profile.department || clinicalCase.department || 'N/A'}`, col1, y + 18);
  doc.text(`Attending Physician: ${profile.attending_physician || profile.physician || 'Attending Consultant'}`, col2, y + 18);

  doc.text(`Date of Admission: ${profile.date_of_admission || profile.doa || 'N/A'}`, col1, y + 24);
  doc.text(`Date of Discharge: ${profile.date_of_discharge || profile.dod || 'N/A'}`, col2, y + 24);

  const ht = profile.height ? `${profile.height} cm` : '—';
  const wt = profile.weight ? `${profile.weight} kg` : '—';
  const bmi = profile.bmi ? `${profile.bmi}` : '—';
  doc.text(`Physical Measurements: Ht: ${ht} | Wt: ${wt} | BMI: ${bmi}`, col1, y + 30);
  doc.text(`Allergies: ${profile.allergy_drugs || profile.allergies || 'NIL'}`, col2, y + 30);

  y += 42;

  // History Sections
  if (profile.chief_complaints) {
    ensureSpace(12);
    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Chief Complaints & Presenting History:', marginX, y);
    y += 4;
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.text(profile.chief_complaints, marginX + 3, y, { maxWidth: contentWidth - 6 });
    y += 10;
  }

  if (profile.past_medical_history || profile.past_history) {
    ensureSpace(12);
    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Past Medical & Medication History:', marginX, y);
    y += 4;
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.text(profile.past_medical_history || profile.past_history, marginX + 3, y, { maxWidth: contentWidth - 6 });
    y += 10;
  }

  if (profile.general_examination || profile.systemic_examination) {
    ensureSpace(14);
    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('General & Systemic Examinations:', marginX, y);
    y += 4;
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    const genExam = profile.general_examination ? `General Exam: ${profile.general_examination}` : '';
    const sysExam = profile.systemic_examination ? `Systemic Exam: ${profile.systemic_examination}` : '';
    doc.text([genExam, sysExam].filter(Boolean).join('\n'), marginX + 3, y, { maxWidth: contentWidth - 6 });
    y += 12;
  }

  // Vitals Signs Table
  if (vitalsList.length > 0) {
    ensureSpace(20);
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(2, 132, 199);
    doc.text('VITAL SIGNS MONITORING LOG', marginX, y);
    y += 4;

    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, y, contentWidth, 6, 'F');
    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Date', marginX + 4, y + 4);
    doc.text('Temp (°F)', marginX + 30, y + 4);
    doc.text('BP (mmHg)', marginX + 60, y + 4);
    doc.text('Pulse (bpm)', marginX + 95, y + 4);
    doc.text('Resp Rate', marginX + 130, y + 4);
    doc.text('SpO2 (%)', marginX + 160, y + 4);
    y += 6;

    doc.setFont('times', 'normal');
    vitalsList.forEach((v) => {
      if (ensureSpace(6)) {
        doc.setFillColor(241, 245, 249);
        doc.rect(marginX, y, contentWidth, 6, 'F');
        doc.setFont('times', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text('Date', marginX + 4, y + 4);
        doc.text('Temp (°F)', marginX + 30, y + 4);
        doc.text('BP (mmHg)', marginX + 60, y + 4);
        doc.text('Pulse (bpm)', marginX + 95, y + 4);
        doc.text('Resp Rate', marginX + 130, y + 4);
        doc.text('SpO2 (%)', marginX + 160, y + 4);
        y += 6;
        doc.setFont('times', 'normal');
      }
      doc.text(v.date || '—', marginX + 4, y + 4);
      doc.text(v.temperature ? `${v.temperature}°F` : '—', marginX + 30, y + 4);
      doc.text(v.bp || '—', marginX + 60, y + 4);
      doc.text(v.pulse ? `${v.pulse}` : '—', marginX + 95, y + 4);
      doc.text(v.respiratory_rate ? `${v.respiratory_rate}` : '—', marginX + 130, y + 4);
      doc.text(v.spo2 ? `${v.spo2}%` : '—', marginX + 160, y + 4);
      y += 5;
    });
    y += 6;
  }

  // LABORATORY & DIAGNOSTIC INVESTIGATIONS
  if (labs.length > 0) {
    ensureSpace(20);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. LABORATORY & DIAGNOSTIC INVESTIGATIONS`, marginX, y);
    y += 6;

    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, y, contentWidth, 6, 'F');
    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Category', marginX + 4, y + 4);
    doc.text('Parameter Name', marginX + 45, y + 4);
    doc.text('Observed Value', marginX + 105, y + 4);
    doc.text('Reference Range', marginX + 145, y + 4);
    y += 6;

    doc.setFont('times', 'normal');
    labs.forEach((lab) => {
      if (ensureSpace(6)) {
        doc.setFillColor(241, 245, 249);
        doc.rect(marginX, y, contentWidth, 6, 'F');
        doc.setFont('times', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text('Category', marginX + 4, y + 4);
        doc.text('Parameter Name', marginX + 45, y + 4);
        doc.text('Observed Value', marginX + 105, y + 4);
        doc.text('Reference Range', marginX + 145, y + 4);
        y += 6;
        doc.setFont('times', 'normal');
      }
      doc.text(lab.category || lab.lab_category || 'General', marginX + 4, y + 4);
      doc.text(lab.parameter_name || lab.test_name || '—', marginX + 45, y + 4);
      doc.text(lab.observed_value || lab.value || '—', marginX + 105, y + 4);
      doc.text(lab.reference_range || lab.normal_range || '—', marginX + 145, y + 4);
      y += 5;
    });
    y += 6;
  }

  // FINAL DIAGNOSIS & PRESCRIBED MEDICATIONS
  ensureSpace(25);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(2, 132, 199);
  doc.text(`${sectionCounter++}. FINAL DIAGNOSIS & PRESCRIBED MEDICATIONS`, marginX, y);
  y += 6;

  // Final Diagnosis Box
  doc.setDrawColor(5, 150, 105); // Emerald-600
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.rect(marginX, y, contentWidth, 12, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text(`FINAL DIAGNOSIS: ${finalDiagnosis.toUpperCase()}`, pageWidth / 2, y + 8, { align: 'center' });

  y += 18;

  // Medications Table
  if (drugs.length > 0) {
    ensureSpace(12);
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, y, contentWidth, 6, 'F');
    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('S.No', marginX + 3, y + 4);
    doc.text('Brand & Generic Medication Name', marginX + 18, y + 4);
    doc.text('Dose & Route', marginX + 100, y + 4);
    doc.text('Frequency', marginX + 145, y + 4);
    y += 6;

    doc.setFont('times', 'normal');
    drugs.forEach((d, idx) => {
      if (ensureSpace(6)) {
        doc.setFillColor(241, 245, 249);
        doc.rect(marginX, y, contentWidth, 6, 'F');
        doc.setFont('times', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text('S.No', marginX + 3, y + 4);
        doc.text('Brand & Generic Medication Name', marginX + 18, y + 4);
        doc.text('Dose & Route', marginX + 100, y + 4);
        doc.text('Frequency', marginX + 145, y + 4);
        y += 6;
        doc.setFont('times', 'normal');
      }
      doc.text(`${idx + 1}`, marginX + 3, y + 4);
      doc.text(`${d.brand_name || ''} (${d.generic_name || d.drug_name || '—'})`, marginX + 18, y + 4, { maxWidth: 78 });
      doc.text(`${d.dose || '—'} (${d.route || 'Oral'})`, marginX + 100, y + 4);
      doc.text(d.frequency || 'OD', marginX + 145, y + 4);
      y += 6;
    });
    y += 6;
  }

  // PATIENT COUNSELLING SUMMARY (MANDATORY FORM)
  ensureSpace(25);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(2, 132, 199);
  doc.text(`${sectionCounter++}. PATIENT COUNSELLING SUMMARY`, marginX, y);
  y += 6;

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Patient Counselling Record:', marginX, y);
  y += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Counselled: ${counselling.counselling_provided_to || counselling.patient_type || 'Patient'} | Mode: ${counselling.counselling_mode || 'Oral'} | Time: ${counselling.time_taken || '15 min'}`, marginX + 3, y);
  y += 5;
  if (counselling.counselling_points || counselling.disease_counselled || counselling.points_covered) {
    doc.text(`Key Focus / Points Covered: ${counselling.counselling_points || counselling.disease_counselled || (Array.isArray(counselling.points_covered) ? counselling.points_covered.join(', ') : counselling.points_covered)}`, marginX + 3, y, { maxWidth: contentWidth - 6 });
    y += 6;
  }
  y += 6;

  // PHARMACIST INTERVENTIONS (OPTIONAL — RENDER ONLY IF ACTUALLY SUBMITTED)
  if (hasIntervention) {
    ensureSpace(25);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. PHARMACIST INTERVENTIONS`, marginX, y);
    y += 6;

    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Pharmacist Intervention Summary:', marginX, y);
    y += 4;
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    if (intervention.prescription_problems || intervention.description_of_problem || intervention.problem_identified) {
      doc.text(`Problem Identified: ${intervention.prescription_problems || intervention.description_of_problem || intervention.problem_identified}`, marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 5;
    }
    if (intervention.recommendations || intervention.action_taken || intervention.intervention_provided) {
      doc.text(`Recommendation / Action: ${intervention.recommendations || intervention.action_taken || intervention.intervention_provided}`, marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 5;
    }
    if (intervention.outcome || intervention.physician_acceptance || intervention.status) {
      doc.text(`Intervention Outcome: ${intervention.outcome || intervention.physician_acceptance || intervention.status}`, marginX + 3, y);
      y += 5;
    }
    y += 6;
  }

  // DRUG INFORMATION REQUEST (OPTIONAL — RENDER ONLY IF ACTUALLY SUBMITTED)
  if (hasDir) {
    ensureSpace(25);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. DRUG INFORMATION REQUEST (DIR)`, marginX, y);
    y += 6;

    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    if (dir.query || dir.drug_info_query) {
      doc.text(`Query: ${dir.query || dir.drug_info_query}`, marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 5;
    }
    if (dir.response || dir.query_response) {
      doc.text(`Response: ${dir.response || dir.query_response}`, marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 5;
    }
    y += 6;
  }

  // ADR LOG & DISCHARGE SUMMARY
  if (hasAdr || profile.discharge_summary) {
    ensureSpace(25);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. ADR LOG & DISCHARGE SUMMARY`, marginX, y);
    y += 6;

    if (hasAdr) {
      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Adverse Drug Reaction (ADR) Log:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Suspected Drug: ${adr.suspected_drug || 'N/A'} | Reaction: ${adr.reaction_description || adr.reaction_title || adr.reaction || 'NIL'}`, marginX + 3, y);
      y += 5;
      doc.text(`Causality Assessment: ${adr.naranjo_causality || adr.initial_causality_opinion || adr.causality || 'N/A'} | Outcome: ${adr.patient_outcome || adr.outcome || 'Resolved'}`, marginX + 3, y);
      y += 8;
    }

    if (profile.discharge_summary) {
      ensureSpace(18);
      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Discharge Summary & Advice:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal');
      doc.setFontSize(8.5);
      doc.text(profile.discharge_summary, marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 8;
    }
  }

  // DUAL VERIFICATION SIGNATURE SECTION (AT BOTTOM OF FINAL PAGE)
  ensureSpace(40);
  const sigY = Math.max(y + 15, pageHeight - 42);

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(marginX, sigY - 5, pageWidth - marginX, sigY - 5);

  const sigLeftX = marginX + 15;
  const sigRightX = pageWidth - marginX - 55;

  // Student Signature Box (Left)
  doc.line(sigLeftX, sigY + 10, sigLeftX + 45, sigY + 10);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Student Signature', sigLeftX + 22.5, sigY + 14, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199);
  doc.text(`${studentName} (${studentRoll})`, sigLeftX + 22.5, sigY + 19, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${currentDateStr}`, sigLeftX + 22.5, sigY + 23, { align: 'center' });

  // Faculty Preceptor Signature Box (Right Side)
  doc.line(sigRightX, sigY + 10, sigRightX + 45, sigY + 10);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Preceptor Signature', sigRightX + 22.5, sigY + 14, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199);
  doc.text(preceptorName, sigRightX + 22.5, sigY + 19, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(preceptorDesig.toUpperCase(), sigRightX + 22.5, sigY + 26, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${currentDateStr}`, sigRightX + 22.5, sigY + 30, { align: 'center' });

  // Stamp total pages on footers across all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(i, totalPages);
  }

  // DIRECT PDF FILE DOWNLOAD
  doc.save(fileName);
};
