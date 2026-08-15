import { jsPDF } from 'jspdf';

/**
 * Direct High-Resolution Vector PDF Generator for Approved Clinical Cases.
 * Pure jsPDF vector implementation — completely bypasses html2canvas and oklch CSS parsing errors.
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

  // Helper for drawing repeating page header
  const drawPageHeader = () => {
    // Header Outer Box
    doc.setDrawColor(15, 23, 42); // slate-900
    doc.setLineWidth(0.4);
    doc.rect(marginX, 12, contentWidth, 22);

    // College Name
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(collegeName.toUpperCase(), pageWidth / 2, 19, { align: 'center' });

    // Subtitle (Autonomous & Hospital)
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`(Autonomous) • ${hospitalName}`, pageWidth / 2, 24, { align: 'center' });

    // Document Sub-header Banner
    doc.setFillColor(15, 23, 42);
    doc.rect(marginX, 28, contentWidth, 5, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`CASE ID : ${caseId}   •   OFFICIAL APPROVED CLINICAL CASE RECORD`, pageWidth / 2, 31.5, { align: 'center' });
  };

  // Helper for drawing watermark
  const drawWatermark = () => {
    doc.setFont('times', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(226, 232, 240); // slate-200
    doc.text(collegeName.toUpperCase(), pageWidth / 2, pageHeight / 2, { align: 'center', angle: 30 });
  };

  // Helper for drawing page footer
  const drawPageFooter = (pageNum, totalPages) => {
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${collegeName} • Official Approved Clinical Document`, marginX, pageHeight - 7);
    doc.text(currentDateStr, pageWidth / 2, pageHeight - 7, { align: 'center' });
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  };

  // --- PAGE 1: DEMOGRAPHICS & CLINICAL HISTORY ---
  drawWatermark();
  drawPageHeader();

  let y = 38;

  // Module Title
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(2, 132, 199); // secondary cyan
  doc.text('1. PATIENT DEMOGRAPHICS & CLINICAL HISTORY', marginX, y);
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
  doc.text(`Attending Physician: ${profile.attending_physician || 'Attending Consultant'}`, col2, y + 18);

  doc.text(`Date of Admission: ${profile.date_of_admission || profile.doa || 'N/A'}`, col1, y + 24);
  doc.text(`Date of Discharge: ${profile.date_of_discharge || profile.dod || 'N/A'}`, col2, y + 24);

  const ht = profile.height ? `${profile.height} cm` : '—';
  const wt = profile.weight ? `${profile.weight} kg` : '—';
  const bmi = profile.bmi ? `${profile.bmi}` : '—';
  doc.text(`Physical Measurements: Ht: ${ht} | Wt: ${wt} | BMI: ${bmi}`, col1, y + 30);
  doc.text(`Allergies: ${profile.allergy_drugs || 'None Reported'}`, col2, y + 30);

  y += 42;

  // History Sections
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Chief Complaints & Presenting History:', marginX, y);
  y += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text(profile.chief_complaints || 'Patient presented with chief complaints as documented in medical records.', marginX + 3, y, { maxWidth: contentWidth - 6 });

  y += 12;
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('Past Medical & Medication History:', marginX, y);
  y += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text(profile.past_medical_history || profile.past_history || 'No significant past medical history reported.', marginX + 3, y, { maxWidth: contentWidth - 6 });

  y += 12;
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('General & Systemic Examinations:', marginX, y);
  y += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  const genExam = profile.general_examination || 'General Exam: Conscious, coherent, no acute distress.';
  const sysExam = profile.systemic_examination || 'CVS: S1S2 heard | RS: NVBS | GI: Soft | CNS: Intact.';
  doc.text(`${genExam}\n${sysExam}`, marginX + 3, y, { maxWidth: contentWidth - 6 });

  y += 16;

  // Vitals Signs Table
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(2, 132, 199);
  doc.text('VITAL SIGNS MONITORING LOG', marginX, y);
  y += 4;

  if (vitalsList.length > 0) {
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
    vitalsList.slice(0, 6).forEach((v) => {
      doc.text(v.date || '—', marginX + 4, y + 4);
      doc.text(v.temperature ? `${v.temperature}°F` : '—', marginX + 30, y + 4);
      doc.text(v.bp || '—', marginX + 60, y + 4);
      doc.text(v.pulse ? `${v.pulse}` : '—', marginX + 95, y + 4);
      doc.text(v.respiratory_rate ? `${v.respiratory_rate}` : '—', marginX + 130, y + 4);
      doc.text(v.spo2 ? `${v.spo2}%` : '—', marginX + 160, y + 4);
      y += 5;
    });
  }

  // --- PAGE 2: LABORATORY & DIAGNOSTIC INVESTIGATIONS ---
  doc.addPage();
  drawWatermark();
  drawPageHeader();
  y = 38;

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(2, 132, 199);
  doc.text('2. LABORATORY & DIAGNOSTIC INVESTIGATIONS', marginX, y);
  y += 6;

  if (labs.length > 0) {
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
      if (y > pageHeight - 25) {
        doc.addPage();
        drawWatermark();
        drawPageHeader();
        y = 38;
      }
      doc.text(lab.category || lab.lab_category || 'General', marginX + 4, y + 4);
      doc.text(lab.parameter_name || lab.test_name || '—', marginX + 45, y + 4);
      doc.text(lab.observed_value || lab.value || '—', marginX + 105, y + 4);
      doc.text(lab.reference_range || lab.normal_range || '—', marginX + 145, y + 4);
      y += 5;
    });
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.text('No routine laboratory values logged for this case.', marginX + 4, y + 4);
    y += 8;
  }

  // --- PAGE 3: DIAGNOSIS & PRESCRIBED MEDICATION THERAPY ---
  if (y > pageHeight - 60) {
    doc.addPage();
    drawWatermark();
    drawPageHeader();
    y = 38;
  }

  y += 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(2, 132, 199);
  doc.text('3. FINAL DIAGNOSIS & PRESCRIBED MEDICATIONS', marginX, y);
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
      if (y > pageHeight - 25) {
        doc.addPage();
        drawWatermark();
        drawPageHeader();
        y = 38;
      }
      doc.text(`${idx + 1}`, marginX + 3, y + 4);
      doc.text(`${d.brand_name || ''} (${d.generic_name || d.drug_name || '—'})`, marginX + 18, y + 4, { maxWidth: 78 });
      doc.text(`${d.dose || '—'} (${d.route || 'Oral'})`, marginX + 100, y + 4);
      doc.text(d.frequency || 'OD', marginX + 145, y + 4);
      y += 6;
    });
  }

  // --- PAGE 4: COUNSELLING & PHARMACIST INTERVENTION ---
  doc.addPage();
  drawWatermark();
  drawPageHeader();
  y = 38;

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(2, 132, 199);
  doc.text('4. PATIENT COUNSELLING & PHARMACIST INTERVENTIONS', marginX, y);
  y += 6;

  // Counselling Box
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Patient Counselling Summary:', marginX, y);
  y += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text(`Counselled: ${counselling.counselling_provided_to || 'Patient'} | Mode: ${counselling.counselling_mode || 'Oral'} | Time: ${counselling.time_taken || '15 min'}`, marginX + 3, y);
  y += 5;
  doc.text(`Key Focus: ${counselling.counselling_points || counselling.disease_counselled || 'Medication adherence, lifestyle modifications, and dietary precautions.'}`, marginX + 3, y, { maxWidth: contentWidth - 6 });

  y += 14;

  // Pharmacist Intervention Box
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('Pharmacist Intervention Summary:', marginX, y);
  y += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text(`Problem Identified: ${intervention.prescription_problems || intervention.description_of_problem || 'Therapeutic optimization and dosage spacing.'}`, marginX + 3, y, { maxWidth: contentWidth - 6 });
  y += 5;
  doc.text(`Recommendation: ${intervention.recommendations || intervention.action_taken || 'Discussed with attending physician for optimal therapy.'}`, marginX + 3, y, { maxWidth: contentWidth - 6 });
  y += 5;
  doc.text(`Intervention Outcome: ${intervention.outcome || intervention.status || 'Accepted and implemented.'}`, marginX + 3, y);

  // --- PAGE 5: ADR LOG, DISCHARGE SUMMARY & DUAL SIGNATURES ---
  doc.addPage();
  drawWatermark();
  drawPageHeader();
  y = 38;

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(2, 132, 199);
  doc.text('5. ADR LOG, DISCHARGE SUMMARY & VERIFICATION', marginX, y);
  y += 6;

  // ADR Log
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Adverse Drug Reaction (ADR) Log:', marginX, y);
  y += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text(`Suspected Drug: ${adr.suspected_drug || 'None Reported'} | Reaction: ${adr.reaction_description || adr.reaction || 'Nil'}`, marginX + 3, y);
  y += 5;
  doc.text(`Causality Assessment: ${adr.naranjo_causality || adr.causality || 'Unlikely'} | Outcome: ${adr.outcome || 'Resolved'}`, marginX + 3, y);

  y += 12;

  // Discharge Summary
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('Discharge Summary & Advice:', marginX, y);
  y += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text(profile.discharge_summary || 'Patient managed symptomatically and discharged in stable condition with advice to follow up as prescribed.', marginX + 3, y, { maxWidth: contentWidth - 6 });

  // DUAL VERIFICATION SIGNATURE SECTION (AT BOTTOM OF PAGE 5)
  const sigY = pageHeight - 45;

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(marginX, sigY - 5, pageWidth - marginX, sigY - 5);

  const sigLeftX = marginX + 15;
  const sigRightX = pageWidth - marginX - 55;

  // Student Signature Box (Left)
  doc.line(sigLeftX, sigY + 12, sigLeftX + 45, sigY + 12);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Student Signature', sigLeftX + 22.5, sigY + 16, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(2, 132, 199);
  doc.text(`${studentName} (${studentRoll})`, sigLeftX + 22.5, sigY + 21, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${currentDateStr}`, sigLeftX + 22.5, sigY + 25, { align: 'center' });

  // Faculty Preceptor Signature Box (Right Side)
  doc.line(sigRightX, sigY + 12, sigRightX + 45, sigY + 12);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Preceptor Signature', sigRightX + 22.5, sigY + 16, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(2, 132, 199);
  doc.text(preceptorName, sigRightX + 22.5, sigY + 21, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(preceptorDesig.toUpperCase(), sigRightX + 22.5, sigY + 29, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${currentDateStr}`, sigRightX + 22.5, sigY + 33, { align: 'center' });

  // Stamp total pages on footers across all 5 pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(i, totalPages);
  }

  // DIRECT PDF FILE DOWNLOAD
  doc.save(fileName);
};
