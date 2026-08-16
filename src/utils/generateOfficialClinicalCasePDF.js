import { jsPDF } from 'jspdf';
import { buildNormalizedApprovedCaseData } from './buildNormalizedApprovedCaseData';

/**
 * Direct High-Resolution Vector PDF Generator for Approved Clinical Cases.
 * Consumes the central normalized data model from buildNormalizedApprovedCaseData.
 */
export const generateOfficialClinicalCasePDF = async ({
  clinicalCase = {},
  student = {},
  preceptor = {},
  college = {},
  caseModulesData = {},
  branding = {}
}) => {
  const norm = buildNormalizedApprovedCaseData({
    clinicalCase,
    student,
    preceptor,
    college,
    caseModulesData
  });

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
  const col1X = marginX + 3;
  const col2X = marginX + 92;
  const maxY = pageHeight - 20;

  const fileName = `${norm.caseId}_Approved.pdf`;
  const collegeName = norm.collegeName;
  const hospitalName = norm.hospitalName;

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  const collegeLogo = college?.college_logo_url || college?.logo_url;
  const hospitalLogo = college?.hospital_logo_url;

  // Helper for drawing repeating page header
  const drawPageHeader = () => {
    doc.setDrawColor(15, 23, 42); // slate-900
    doc.setLineWidth(0.4);
    doc.rect(marginX, 12, contentWidth, 22);

    if (collegeLogo && typeof collegeLogo === 'string' && collegeLogo.startsWith('data:image')) {
      try {
        const fmt = collegeLogo.includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(collegeLogo, fmt, marginX + 2, 13.5, 17, 17);
      } catch (e) {}
    }

    if (hospitalLogo && typeof hospitalLogo === 'string' && hospitalLogo.startsWith('data:image')) {
      try {
        const fmt = hospitalLogo.includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(hospitalLogo, fmt, pageWidth - marginX - 19, 13.5, 17, 17);
      } catch (e) {}
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(collegeName.toUpperCase(), pageWidth / 2, 19, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`(Autonomous) • ${hospitalName}`, pageWidth / 2, 24, { align: 'center' });

    doc.setFillColor(15, 23, 42);
    doc.rect(marginX, 28, contentWidth, 5, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`CASE ID : ${norm.caseId}   •   OFFICIAL APPROVED CLINICAL CASE RECORD`, pageWidth / 2, 31.5, { align: 'center' });
  };

  const drawWatermark = () => {
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(241, 245, 249);
    doc.text(collegeName.toUpperCase(), pageWidth / 2, pageHeight / 2, { align: 'center', angle: 30 });
  };

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

  const ensureSpace = (neededHeight) => {
    if (y + neededHeight > maxY) {
      doc.addPage();
      drawWatermark();
      drawPageHeader();
      y = 38;
      return true;
    }
    return false;
  };

  // --- START PAGE 1 ---
  drawWatermark();
  drawPageHeader();

  let sectionCounter = 1;

  // 1. PATIENT DEMOGRAPHICS & CLINICAL HISTORY (PROFILE)
  if (norm.isProfileCompleted) {
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. PATIENT DEMOGRAPHICS & CLINICAL HISTORY`, marginX, y);
    y += 4;

    // Structured 2-Column Profile Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, y, contentWidth, 42, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    doc.setFont('times', 'bold'); doc.text('Patient Name:', col1X, y + 6);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.patientName, col1X + 24, y + 6);

    doc.setFont('times', 'bold'); doc.text('Age / Gender:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.demographics.age} Yrs / ${norm.demographics.gender}`, col2X + 24, y + 6);

    doc.setFont('times', 'bold'); doc.text('IP/OP No:', col1X, y + 12);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.ipOpNo, col1X + 24, y + 12);

    doc.setFont('times', 'bold'); doc.text('Ward / Bed:', col2X, y + 12);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.wardBed, col2X + 24, y + 12);

    doc.setFont('times', 'bold'); doc.text('Department:', col1X, y + 18);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.department, col1X + 24, y + 18);

    doc.setFont('times', 'bold'); doc.text('Attending Physician:', col2X, y + 18);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.physician, col2X + 32, y + 18);

    doc.setFont('times', 'bold'); doc.text('Date of Admission:', col1X, y + 24);
    doc.setFont('times', 'normal'); doc.text(norm.dates.doa, col1X + 28, y + 24);

    doc.setFont('times', 'bold'); doc.text('Date of Discharge:', col2X, y + 24);
    doc.setFont('times', 'normal'); doc.text(norm.dates.dod, col2X + 28, y + 24);

    doc.setFont('times', 'bold'); doc.text('Physical Measurements:', col1X, y + 30);
    doc.setFont('times', 'normal'); doc.text(`Ht: ${norm.demographics.height} | Wt: ${norm.demographics.weight} | BMI: ${norm.demographics.bmi}`, col1X + 35, y + 30);

    doc.setFont('times', 'bold'); doc.text('Allergies:', col2X, y + 30);
    doc.setFont('times', 'normal'); doc.text(`Drug: ${norm.demographics.allergyDrugs} | Food: ${norm.demographics.allergyFood}`, col2X + 18, y + 30);

    doc.setFont('times', 'bold'); doc.text('Social History:', col1X, y + 36);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.socialHistory, col1X + 24, y + 36);

    doc.setFont('times', 'bold'); doc.text('Diet & Lifestyle:', col2X, y + 36);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.diet, col2X + 24, y + 36);

    y += 46;

    // History & Examination Blocks
    if (norm.history.chiefComplaints) {
      ensureSpace(12);
      doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
      doc.text('Chief Complaints & Presenting History:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal'); doc.setFontSize(8.5);
      doc.text(norm.history.chiefComplaints, marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 9;
    }

    if (norm.history.pastMedicalHistory) {
      ensureSpace(12);
      doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
      doc.text('Past Medical & Medication History:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal'); doc.setFontSize(8.5);
      const pastMed = norm.history.pastMedicationHistory ? ` (Meds: ${norm.history.pastMedicationHistory})` : '';
      doc.text(`${norm.history.pastMedicalHistory}${pastMed}`, marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 9;
    }

    if (norm.history.familyHistory) {
      ensureSpace(10);
      doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
      doc.text('Family Medical History:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal'); doc.setFontSize(8.5);
      doc.text(norm.history.familyHistory, marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 8;
    }

    if (norm.history.generalExam || norm.history.systemicExam) {
      ensureSpace(14);
      doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
      doc.text('General & Systemic Examinations:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal'); doc.setFontSize(8.5);
      const genExam = norm.history.generalExam ? `General Exam: ${norm.history.generalExam}` : '';
      const sysExam = norm.history.systemicExam ? `Systemic Exam: ${norm.history.systemicExam}` : '';
      doc.text([genExam, sysExam].filter(Boolean).join('\n'), marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 11;
    }
  }

  // VITAL SIGNS MONITORING LOG TABLE
  if (norm.vitals.length > 0) {
    ensureSpace(20);
    doc.setFont('times', 'bold'); doc.setFontSize(10); doc.setTextColor(2, 132, 199);
    doc.text('VITAL SIGNS MONITORING LOG', marginX, y);
    y += 4;

    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, y, contentWidth, 6, 'F');
    doc.setFont('times', 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    doc.text('Date', marginX + 4, y + 4);
    doc.text('Temp (°F)', marginX + 30, y + 4);
    doc.text('BP (mmHg)', marginX + 60, y + 4);
    doc.text('Pulse (bpm)', marginX + 95, y + 4);
    doc.text('Resp Rate', marginX + 130, y + 4);
    doc.text('SpO2 (%)', marginX + 160, y + 4);
    y += 6;

    doc.setFont('times', 'normal');
    norm.vitals.forEach((v) => {
      if (ensureSpace(6)) {
        doc.setFillColor(241, 245, 249);
        doc.rect(marginX, y, contentWidth, 6, 'F');
        doc.setFont('times', 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
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
      doc.text(v.temperature || v.temp ? `${v.temperature || v.temp}°F` : '—', marginX + 30, y + 4);
      doc.text(v.bp || '—', marginX + 60, y + 4);
      doc.text(v.pulse || v.pr ? `${v.pulse || v.pr}` : '—', marginX + 95, y + 4);
      doc.text(v.respiratory_rate || v.rr ? `${v.respiratory_rate || v.rr}` : '—', marginX + 130, y + 4);
      doc.text(v.spo2 ? `${v.spo2}%` : '—', marginX + 160, y + 4);
      y += 5;
    });
    y += 6;
  }

  // LABORATORY & DIAGNOSTIC INVESTIGATIONS TABLE
  if (norm.labs.length > 0) {
    ensureSpace(20);
    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. LABORATORY & DIAGNOSTIC INVESTIGATIONS`, marginX, y);
    y += 6;

    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, y, contentWidth, 6, 'F');
    doc.setFont('times', 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    doc.text('Category', marginX + 4, y + 4);
    doc.text('Parameter Name', marginX + 45, y + 4);
    doc.text('Observed Value', marginX + 105, y + 4);
    doc.text('Reference Range', marginX + 145, y + 4);
    y += 6;

    doc.setFont('times', 'normal');
    norm.labs.forEach((lab) => {
      if (ensureSpace(6)) {
        doc.setFillColor(241, 245, 249);
        doc.rect(marginX, y, contentWidth, 6, 'F');
        doc.setFont('times', 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
        doc.text('Category', marginX + 4, y + 4);
        doc.text('Parameter Name', marginX + 45, y + 4);
        doc.text('Observed Value', marginX + 105, y + 4);
        doc.text('Reference Range', marginX + 145, y + 4);
        y += 6;
        doc.setFont('times', 'normal');
      }
      doc.text(lab.category || lab.lab_category || 'General', marginX + 4, y + 4);
      doc.text(lab.parameter_name || lab.test_name || '—', marginX + 45, y + 4);
      doc.text(lab.observed_value || lab.test_value || lab.value || '—', marginX + 105, y + 4);
      doc.text(lab.reference_range || lab.normal_range || '—', marginX + 145, y + 4);
      y += 5;
    });
    y += 6;
  }

  // FINAL DIAGNOSIS & PRESCRIBED MEDICATIONS TABLE
  ensureSpace(25);
  doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
  doc.text(`${sectionCounter++}. FINAL DIAGNOSIS & PRESCRIBED MEDICATIONS`, marginX, y);
  y += 6;

  doc.setDrawColor(5, 150, 105);
  doc.setFillColor(236, 253, 245);
  doc.rect(marginX, y, contentWidth, 12, 'FD');
  doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(5, 150, 105);
  doc.text(`FINAL DIAGNOSIS: ${norm.diagnosis.final.toUpperCase()}`, pageWidth / 2, y + 8, { align: 'center' });

  y += 18;

  if (norm.drugs.length > 0) {
    ensureSpace(12);
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, y, contentWidth, 6, 'F');
    doc.setFont('times', 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    doc.text('S.No', marginX + 3, y + 4);
    doc.text('Brand & Generic Medication Name', marginX + 18, y + 4);
    doc.text('Dose & Route', marginX + 100, y + 4);
    doc.text('Frequency', marginX + 145, y + 4);
    y += 6;

    doc.setFont('times', 'normal');
    norm.drugs.forEach((d, idx) => {
      if (ensureSpace(6)) {
        doc.setFillColor(241, 245, 249);
        doc.rect(marginX, y, contentWidth, 6, 'F');
        doc.setFont('times', 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
        doc.text('S.No', marginX + 3, y + 4);
        doc.text('Brand & Generic Medication Name', marginX + 18, y + 4);
        doc.text('Dose & Route', marginX + 100, y + 4);
        doc.text('Frequency', marginX + 145, y + 4);
        y += 6;
        doc.setFont('times', 'normal');
      }
      doc.text(`${d.s_no || idx + 1}`, marginX + 3, y + 4);
      doc.text(`${d.trade_name || d.brand_name || ''} (${d.generic_name || d.drug_name || '—'})`, marginX + 18, y + 4, { maxWidth: 78 });
      doc.text(`${d.dose || '—'} (${d.route_of_admin || d.route || 'Oral'})`, marginX + 100, y + 4);
      doc.text(d.frequency || 'OD', marginX + 145, y + 4);
      y += 6;
    });
    y += 6;
  }

  // 4. PATIENT COUNSELLING SUMMARY (STRUCTURED 2-COLUMN BOX)
  if (norm.isCounsellingCompleted) {
    ensureSpace(32);
    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. PATIENT COUNSELLING SUMMARY`, marginX, y);
    y += 5;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, y, contentWidth, 26, 'FD');

    doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

    doc.setFont('times', 'bold'); doc.text('Counselling Date / Duration:', col1X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.dates.counsellingDate} (${norm.counselling.time_taken || '15 min'})`, col1X + 42, y + 6);

    doc.setFont('times', 'bold'); doc.text('Provided To / Mode:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.counselling.counselling_provided_to || 'Patient'} (${norm.counselling.counselling_mode || 'Oral'})`, col2X + 30, y + 6);

    doc.setFont('times', 'bold'); doc.text('Disease Counselled:', col1X, y + 12);
    doc.setFont('times', 'normal'); doc.text(`${norm.counselling.disease_counselled || norm.diagnosis.final}`, col1X + 30, y + 12);

    doc.setFont('times', 'bold'); doc.text('Key Focus Points:', col1X, y + 18);
    doc.setFont('times', 'normal'); doc.text(`${norm.counselling.counselling_points || norm.counselling.points_covered || 'Medication compliance, lifestyle & dietary restrictions.'}`, col1X + 28, y + 18, { maxWidth: contentWidth - 32 });

    if (norm.counselling.barriers_action || norm.counselling.barrier_details) {
      doc.setFont('times', 'bold'); doc.text('Barriers & Action Taken:', col1X, y + 24);
      doc.setFont('times', 'normal'); doc.text(`${norm.counselling.barriers_action || norm.counselling.barrier_details}`, col1X + 35, y + 24, { maxWidth: contentWidth - 40 });
    }

    y += 32;
  }

  // 5. PHARMACIST INTERVENTIONS (STRUCTURED 2-COLUMN BOX — ONLY IF COMPLETED)
  if (norm.isInterventionCompleted) {
    ensureSpace(32);
    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. PHARMACIST INTERVENTIONS`, marginX, y);
    y += 5;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, y, contentWidth, 26, 'FD');

    doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

    doc.setFont('times', 'bold'); doc.text('Intervention Date:', col1X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.dates.interventionDate}`, col1X + 28, y + 6);

    doc.setFont('times', 'bold'); doc.text('Reporting Date:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.dates.reportingDate}`, col2X + 24, y + 6);

    doc.setFont('times', 'bold'); doc.text('Problem Identified:', col1X, y + 12);
    doc.setFont('times', 'normal'); doc.text(`${norm.intervention.prescription_problems || norm.intervention.description_of_problem || norm.intervention.problem_identified || 'None'}`, col1X + 30, y + 12, { maxWidth: contentWidth - 34 });

    doc.setFont('times', 'bold'); doc.text('Action & Recommendation:', col1X, y + 18);
    doc.setFont('times', 'normal'); doc.text(`${norm.intervention.recommendations || norm.intervention.action_taken || norm.intervention.intervention_provided || 'None'}`, col1X + 42, y + 18, { maxWidth: contentWidth - 46 });

    doc.setFont('times', 'bold'); doc.text('Physician Acceptance:', col1X, y + 24);
    doc.setFont('times', 'normal'); doc.text(`${norm.intervention.physician_acceptance || norm.intervention.status || 'Accepted'}`, col1X + 34, y + 24);

    doc.setFont('times', 'bold'); doc.text('Clinical Outcome:', col2X, y + 24);
    doc.setFont('times', 'normal'); doc.text(`${norm.intervention.outcome || norm.intervention.clinical_outcome || 'Positive / Resolved'}`, col2X + 28, y + 24);

    y += 32;
  }

  // 6. DRUG INFORMATION REQUEST (DIR — STRUCTURED 2-COLUMN BOX — ONLY IF COMPLETED)
  if (norm.isDirCompleted) {
    ensureSpace(32);
    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. DRUG INFORMATION REQUEST (DIR)`, marginX, y);
    y += 5;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, y, contentWidth, 26, 'FD');

    doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

    doc.setFont('times', 'bold'); doc.text('Query Date:', col1X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.dates.queryDate}`, col1X + 20, y + 6);

    doc.setFont('times', 'bold'); doc.text('Enquirer Name & Status:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.dir.enquirer_name || 'Physician'} (${norm.dir.enquirer_category || norm.dir.professional_status || 'Doctor'})`, col2X + 36, y + 6);

    doc.setFont('times', 'bold'); doc.text('Category of Enquiry:', col1X, y + 12);
    doc.setFont('times', 'normal'); doc.text(`${norm.dir.category_of_enquiry || 'Therapeutic Dosing'}`, col1X + 32, y + 12);

    doc.setFont('times', 'bold'); doc.text('Turnaround Time:', col2X, y + 12);
    doc.setFont('times', 'normal'); doc.text(`${norm.dir.turnaround_time || 'Immediate (<1 hr)'}`, col2X + 28, y + 12);

    doc.setFont('times', 'bold'); doc.text('Details of Query:', col1X, y + 18);
    doc.setFont('times', 'normal'); doc.text(`${norm.dir.details_of_enquiry || norm.dir.query || 'N/A'}`, col1X + 26, y + 18, { maxWidth: contentWidth - 30 });

    doc.setFont('times', 'bold'); doc.text('Response Provided:', col1X, y + 24);
    doc.setFont('times', 'normal'); doc.text(`${norm.dir.information_provided || norm.dir.response || 'N/A'}`, col1X + 30, y + 24, { maxWidth: contentWidth - 34 });

    y += 32;
  }

  // 7. ADR LOG & DISCHARGE SUMMARY (STRUCTURED 2-COLUMN BOX — ONLY IF COMPLETED)
  if (norm.isAdrCompleted || norm.diagnosis.dischargeSummary) {
    ensureSpace(32);
    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. ADR LOG & DISCHARGE SUMMARY`, marginX, y);
    y += 5;

    if (norm.isAdrCompleted) {
      doc.setDrawColor(252, 211, 77);
      doc.setFillColor(254, 252, 232);
      doc.rect(marginX, y, contentWidth, 24, 'FD');

      doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

      doc.setFont('times', 'bold'); doc.text('ADR Onset Date:', col1X, y + 6);
      doc.setFont('times', 'normal'); doc.text(`${norm.dates.adrOnsetDate}`, col1X + 26, y + 6);

      doc.setFont('times', 'bold'); doc.text('Suspected Drug:', col2X, y + 6);
      doc.setFont('times', 'normal'); doc.text(`${norm.adr.suspected_drug || 'N/A'}`, col2X + 26, y + 6);

      doc.setFont('times', 'bold'); doc.text('Reaction Title:', col1X, y + 12);
      doc.setFont('times', 'normal'); doc.text(`${norm.adr.reaction_title || norm.adr.reaction_description || 'Nil'}`, col1X + 24, y + 12, { maxWidth: contentWidth - 28 });

      doc.setFont('times', 'bold'); doc.text('Causality (Naranjo):', col1X, y + 18);
      doc.setFont('times', 'normal'); doc.text(`${norm.adr.naranjo_causality || norm.adr.initial_causality_opinion || 'Possible'}`, col1X + 32, y + 18);

      doc.setFont('times', 'bold'); doc.text('Reaction Severity:', col2X, y + 18);
      doc.setFont('times', 'normal'); doc.text(`${norm.adr.reaction_severity || 'Moderate'}`, col2X + 28, y + 18);

      y += 28;
    }

    if (norm.diagnosis.dischargeSummary) {
      ensureSpace(18);
      doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
      doc.text('Discharge Summary & Advice:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal'); doc.setFontSize(8.5);
      doc.text(norm.diagnosis.dischargeSummary, marginX + 3, y, { maxWidth: contentWidth - 6 });
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
  doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
  doc.text('Student Signature', sigLeftX + 22.5, sigY + 14, { align: 'center' });
  doc.setFont('times', 'normal'); doc.setFontSize(8.5); doc.setTextColor(2, 132, 199);
  doc.text(`${norm.studentName} (${norm.studentRoll})`, sigLeftX + 22.5, sigY + 19, { align: 'center' });
  doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${currentDateStr}`, sigLeftX + 22.5, sigY + 23, { align: 'center' });

  // Faculty Preceptor Signature Box (Right Side)
  doc.line(sigRightX, sigY + 10, sigRightX + 45, sigY + 10);
  doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
  doc.text('Preceptor Signature', sigRightX + 22.5, sigY + 14, { align: 'center' });
  doc.setFont('times', 'normal'); doc.setFontSize(8.5); doc.setTextColor(2, 132, 199);
  doc.text(norm.preceptorName, sigRightX + 22.5, sigY + 19, { align: 'center' });
  doc.setFontSize(7.5); doc.setTextColor(15, 23, 42);
  doc.text(norm.preceptorDesig.toUpperCase(), sigRightX + 22.5, sigY + 26, { align: 'center' });
  doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
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
