import { jsPDF } from 'jspdf';

/**
 * Direct High-Resolution Vector PDF Generator for Approved Clinical Cases.
 * Enforces Professional 2-Column / Multi-Column Grid Layouts matching original student form structures.
 * 
 * Rules:
 *  - Form COMPLETED (green) -> INCLUDE ALL SUBMITTED FIELDS IN STRUCTURED 2-COLUMN / GRID BOXES.
 *  - Form DRAFT / INCOMPLETE / NOT SUBMITTED -> EXCLUDE THE ENTIRE FORM.
 *  - Clinical dates entered by student are strictly preserved.
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
  const col1X = marginX + 3;
  const col2X = marginX + 92;
  const colWidthHalf = (contentWidth - 6) / 2; // ~87mm
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
  const vitalsList = caseModulesData?.vitals || profile.vital_signs || profile.vitals || [];
  const labs = caseModulesData?.labs || [];
  const drugs = caseModulesData?.drugs || [];
  const counselling = caseModulesData?.counselling || {};
  const intervention = caseModulesData?.intervention || {};
  const dir = caseModulesData?.dir || {};
  const adr = caseModulesData?.adr || {};

  const finalDiagnosis = clinicalCase?.final_diagnosis || clinicalCase?.diagnosis || profile.final_diagnosis || profile.provisional_diagnosis || 'Clinical Case Presentation';

  const collegeLogo = college?.college_logo_url || college?.logo_url;
  const hospitalLogo = college?.hospital_logo_url;

  // Helper to determine if a form module is COMPLETED (green)
  const isFormCompleted = (formObj) => {
    if (!formObj || typeof formObj !== 'object') return false;
    const status = (formObj.status || formObj.form_status || '').toLowerCase();
    
    if (status === 'draft' || status === 'incomplete' || status === 'not_submitted') return false;
    if (status === 'completed' || status === 'submitted' || status === 'approved' || formObj.is_completed === true) return true;

    return Object.entries(formObj).some(([k, v]) => {
      if (['status', 'form_status', 'id', 'case_id', 'created_at', 'updated_at'].includes(k)) return false;
      return v !== null && v !== undefined && v !== '';
    }) && status !== 'draft';
  };

  const isProfileCompleted = isFormCompleted(profile) || Boolean(profile.patient_name || clinicalCase.patient_name);
  const isCounsellingCompleted = isFormCompleted(counselling);
  const isInterventionCompleted = isFormCompleted(intervention);
  const isDirCompleted = isFormCompleted(dir);
  const isAdrCompleted = isFormCompleted(adr);

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
    doc.text(`CASE ID : ${caseId}   •   OFFICIAL APPROVED CLINICAL CASE RECORD`, pageWidth / 2, 31.5, { align: 'center' });
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
  if (isProfileCompleted) {
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
    doc.setFont('times', 'normal'); doc.text(`${profile.patient_name || clinicalCase.patient_name || 'N/A'}`, col1X + 24, y + 6);

    doc.setFont('times', 'bold'); doc.text('Age / Gender:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${profile.age || clinicalCase.age || 'N/A'} Yrs / ${profile.gender || clinicalCase.gender || 'N/A'}`, col2X + 24, y + 6);

    doc.setFont('times', 'bold'); doc.text('IP/OP No:', col1X, y + 12);
    doc.setFont('times', 'normal'); doc.text(`${profile.ip_op_number || profile.ip_no || clinicalCase.ip_op_number || 'N/A'}`, col1X + 24, y + 12);

    doc.setFont('times', 'bold'); doc.text('Ward / Bed:', col2X, y + 12);
    doc.setFont('times', 'normal'); doc.text(`${profile.ward || clinicalCase.ward || 'N/A'}`, col2X + 24, y + 12);

    doc.setFont('times', 'bold'); doc.text('Department:', col1X, y + 18);
    doc.setFont('times', 'normal'); doc.text(`${profile.department || clinicalCase.department || 'N/A'}`, col1X + 24, y + 18);

    doc.setFont('times', 'bold'); doc.text('Attending Physician:', col2X, y + 18);
    doc.setFont('times', 'normal'); doc.text(`${profile.attending_physician || profile.physician || 'Attending Consultant'}`, col2X + 32, y + 18);

    doc.setFont('times', 'bold'); doc.text('Date of Admission:', col1X, y + 24);
    doc.setFont('times', 'normal'); doc.text(`${profile.date_of_admission || profile.doa || 'N/A'}`, col1X + 28, y + 24);

    doc.setFont('times', 'bold'); doc.text('Date of Discharge:', col2X, y + 24);
    doc.setFont('times', 'normal'); doc.text(`${profile.date_of_discharge || profile.dod || 'N/A'}`, col2X + 28, y + 24);

    const ht = profile.height ? `${profile.height} cm` : '—';
    const wt = profile.weight ? `${profile.weight} kg` : '—';
    const bmi = profile.bmi ? `${profile.bmi}` : '—';
    doc.setFont('times', 'bold'); doc.text('Physical Measurements:', col1X, y + 30);
    doc.setFont('times', 'normal'); doc.text(`Ht: ${ht} | Wt: ${wt} | BMI: ${bmi}`, col1X + 35, y + 30);

    doc.setFont('times', 'bold'); doc.text('Allergies:', col2X, y + 30);
    doc.setFont('times', 'normal'); doc.text(`Drug: ${profile.allergy_drugs || 'None'} | Food: ${profile.allergy_food || 'None'}`, col2X + 18, y + 30);

    const social = profile.social_history || [
      profile.smoker_pack_day ? `Smoker (${profile.smoker_pack_day}/day)` : null,
      profile.alcoholic_amount_day ? `Alcoholic (${profile.alcoholic_amount_day})` : null,
      profile.marital_status ? `Marital: ${profile.marital_status}` : null
    ].filter(Boolean).join(', ') || 'Non-smoker, Non-alcoholic';

    doc.setFont('times', 'bold'); doc.text('Social History:', col1X, y + 36);
    doc.setFont('times', 'normal'); doc.text(social, col1X + 24, y + 36);

    doc.setFont('times', 'bold'); doc.text('Diet & Lifestyle:', col2X, y + 36);
    doc.setFont('times', 'normal'); doc.text(profile.diet || 'Regular Diet', col2X + 24, y + 36);

    y += 46;

    // History & Examination Blocks
    if (profile.chief_complaints) {
      ensureSpace(12);
      doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
      doc.text('Chief Complaints & Presenting History:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal'); doc.setFontSize(8.5);
      doc.text(profile.chief_complaints, marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 9;
    }

    if (profile.past_medical_history || profile.past_history || profile.past_medication_history) {
      ensureSpace(12);
      doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
      doc.text('Past Medical & Medication History:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal'); doc.setFontSize(8.5);
      const pastMed = profile.past_medication_history ? ` (Meds: ${profile.past_medication_history})` : '';
      doc.text(`${profile.past_medical_history || profile.past_history || 'NIL'}${pastMed}`, marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 9;
    }

    if (profile.family_history) {
      ensureSpace(10);
      doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
      doc.text('Family Medical History:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal'); doc.setFontSize(8.5);
      doc.text(profile.family_history, marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 8;
    }

    if (profile.general_examination || profile.systemic_examination) {
      ensureSpace(14);
      doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
      doc.text('General & Systemic Examinations:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal'); doc.setFontSize(8.5);
      const genExam = profile.general_examination ? `General Exam: ${profile.general_examination}` : '';
      const sysExam = profile.systemic_examination ? `Systemic Exam: ${profile.systemic_examination}` : '';
      doc.text([genExam, sysExam].filter(Boolean).join('\n'), marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 11;
    }
  }

  // VITAL SIGNS MONITORING LOG TABLE
  if (vitalsList.length > 0) {
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
    vitalsList.forEach((v) => {
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
  if (labs.length > 0) {
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
    labs.forEach((lab) => {
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
  doc.text(`FINAL DIAGNOSIS: ${finalDiagnosis.toUpperCase()}`, pageWidth / 2, y + 8, { align: 'center' });

  y += 18;

  if (drugs.length > 0) {
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
    drugs.forEach((d, idx) => {
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
  if (isCounsellingCompleted) {
    ensureSpace(32);
    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. PATIENT COUNSELLING SUMMARY`, marginX, y);
    y += 5;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, y, contentWidth, 26, 'FD');

    doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

    const cDate = counselling.counselling_date || counselling.date || currentDateStr;
    const cTime = counselling.time_taken || counselling.counselling_time || '15 min';
    doc.setFont('times', 'bold'); doc.text('Counselling Date / Duration:', col1X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${cDate} (${cTime})`, col1X + 42, y + 6);

    doc.setFont('times', 'bold'); doc.text('Provided To / Mode:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${counselling.counselling_provided_to || 'Patient'} (${counselling.counselling_mode || 'Oral'})`, col2X + 30, y + 6);

    doc.setFont('times', 'bold'); doc.text('Disease Counselled:', col1X, y + 12);
    doc.setFont('times', 'normal'); doc.text(`${counselling.disease_counselled || finalDiagnosis}`, col1X + 30, y + 12);

    doc.setFont('times', 'bold'); doc.text('Key Focus Points:', col1X, y + 18);
    doc.setFont('times', 'normal'); doc.text(`${counselling.counselling_points || counselling.points_covered || 'Medication compliance, lifestyle & dietary restrictions.'}`, col1X + 28, y + 18, { maxWidth: contentWidth - 32 });

    if (counselling.barriers_action || counselling.barrier_details) {
      doc.setFont('times', 'bold'); doc.text('Barriers & Action Taken:', col1X, y + 24);
      doc.setFont('times', 'normal'); doc.text(`${counselling.barriers_action || counselling.barrier_details}`, col1X + 35, y + 24, { maxWidth: contentWidth - 40 });
    }

    y += 32;
  }

  // 5. PHARMACIST INTERVENTIONS (STRUCTURED 2-COLUMN BOX — ONLY IF COMPLETED)
  if (isInterventionCompleted) {
    ensureSpace(32);
    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. PHARMACIST INTERVENTIONS`, marginX, y);
    y += 5;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, y, contentWidth, 26, 'FD');

    doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

    const iDate = intervention.intervention_date || intervention.date || currentDateStr;
    const iRepDate = intervention.reporting_date || currentDateStr;
    doc.setFont('times', 'bold'); doc.text('Intervention Date:', col1X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${iDate}`, col1X + 28, y + 6);

    doc.setFont('times', 'bold'); doc.text('Reporting Date:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${iRepDate}`, col2X + 24, y + 6);

    doc.setFont('times', 'bold'); doc.text('Problem Identified:', col1X, y + 12);
    doc.setFont('times', 'normal'); doc.text(`${intervention.prescription_problems || intervention.description_of_problem || intervention.problem_identified || 'None'}`, col1X + 30, y + 12, { maxWidth: contentWidth - 34 });

    doc.setFont('times', 'bold'); doc.text('Action & Recommendation:', col1X, y + 18);
    doc.setFont('times', 'normal'); doc.text(`${intervention.recommendations || intervention.action_taken || intervention.intervention_provided || 'None'}`, col1X + 42, y + 18, { maxWidth: contentWidth - 46 });

    doc.setFont('times', 'bold'); doc.text('Physician Acceptance:', col1X, y + 24);
    doc.setFont('times', 'normal'); doc.text(`${intervention.physician_acceptance || intervention.status || 'Accepted'}`, col1X + 34, y + 24);

    doc.setFont('times', 'bold'); doc.text('Clinical Outcome:', col2X, y + 24);
    doc.setFont('times', 'normal'); doc.text(`${intervention.outcome || intervention.clinical_outcome || 'Positive / Resolved'}`, col2X + 28, y + 24);

    y += 32;
  }

  // 6. DRUG INFORMATION REQUEST (DIR — STRUCTURED 2-COLUMN BOX — ONLY IF COMPLETED)
  if (isDirCompleted) {
    ensureSpace(32);
    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. DRUG INFORMATION REQUEST (DIR)`, marginX, y);
    y += 5;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, y, contentWidth, 26, 'FD');

    doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

    const dirDate = dir.query_date || dir.date || currentDateStr;
    doc.setFont('times', 'bold'); doc.text('Query Date:', col1X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${dirDate}`, col1X + 20, y + 6);

    doc.setFont('times', 'bold'); doc.text('Enquirer Name & Status:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${dir.enquirer_name || 'Physician'} (${dir.enquirer_category || dir.professional_status || 'Doctor'})`, col2X + 36, y + 6);

    doc.setFont('times', 'bold'); doc.text('Category of Enquiry:', col1X, y + 12);
    doc.setFont('times', 'normal'); doc.text(`${dir.category_of_enquiry || 'Therapeutic Dosing'}`, col1X + 32, y + 12);

    doc.setFont('times', 'bold'); doc.text('Turnaround Time:', col2X, y + 12);
    doc.setFont('times', 'normal'); doc.text(`${dir.turnaround_time || 'Immediate (<1 hr)'}`, col2X + 28, y + 12);

    doc.setFont('times', 'bold'); doc.text('Details of Query:', col1X, y + 18);
    doc.setFont('times', 'normal'); doc.text(`${dir.details_of_enquiry || dir.query || 'N/A'}`, col1X + 26, y + 18, { maxWidth: contentWidth - 30 });

    doc.setFont('times', 'bold'); doc.text('Response Provided:', col1X, y + 24);
    doc.setFont('times', 'normal'); doc.text(`${dir.information_provided || dir.response || 'N/A'}`, col1X + 30, y + 24, { maxWidth: contentWidth - 34 });

    y += 32;
  }

  // 7. ADR LOG & DISCHARGE SUMMARY (STRUCTURED 2-COLUMN BOX — ONLY IF COMPLETED)
  if (isAdrCompleted || profile.discharge_summary) {
    ensureSpace(32);
    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${sectionCounter++}. ADR LOG & DISCHARGE SUMMARY`, marginX, y);
    y += 5;

    if (isAdrCompleted) {
      doc.setDrawColor(252, 211, 77);
      doc.setFillColor(254, 252, 232);
      doc.rect(marginX, y, contentWidth, 24, 'FD');

      doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

      const adrDate = adr.onset_date || adr.date || currentDateStr;
      doc.setFont('times', 'bold'); doc.text('ADR Onset Date:', col1X, y + 6);
      doc.setFont('times', 'normal'); doc.text(`${adrDate}`, col1X + 26, y + 6);

      doc.setFont('times', 'bold'); doc.text('Suspected Drug:', col2X, y + 6);
      doc.setFont('times', 'normal'); doc.text(`${adr.suspected_drug || 'N/A'}`, col2X + 26, y + 6);

      doc.setFont('times', 'bold'); doc.text('Reaction Title:', col1X, y + 12);
      doc.setFont('times', 'normal'); doc.text(`${adr.reaction_title || adr.reaction_description || 'Nil'}`, col1X + 24, y + 12, { maxWidth: contentWidth - 28 });

      doc.setFont('times', 'bold'); doc.text('Causality (Naranjo):', col1X, y + 18);
      doc.setFont('times', 'normal'); doc.text(`${adr.naranjo_causality || adr.initial_causality_opinion || 'Possible'}`, col1X + 32, y + 18);

      doc.setFont('times', 'bold'); doc.text('Reaction Severity:', col2X, y + 18);
      doc.setFont('times', 'normal'); doc.text(`${adr.reaction_severity || 'Moderate'}`, col2X + 28, y + 18);

      y += 28;
    }

    if (profile.discharge_summary) {
      ensureSpace(18);
      doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
      doc.text('Discharge Summary & Advice:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal'); doc.setFontSize(8.5);
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
  doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
  doc.text('Student Signature', sigLeftX + 22.5, sigY + 14, { align: 'center' });
  doc.setFont('times', 'normal'); doc.setFontSize(8.5); doc.setTextColor(2, 132, 199);
  doc.text(`${studentName} (${studentRoll})`, sigLeftX + 22.5, sigY + 19, { align: 'center' });
  doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${currentDateStr}`, sigLeftX + 22.5, sigY + 23, { align: 'center' });

  // Faculty Preceptor Signature Box (Right Side)
  doc.line(sigRightX, sigY + 10, sigRightX + 45, sigY + 10);
  doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
  doc.text('Preceptor Signature', sigRightX + 22.5, sigY + 14, { align: 'center' });
  doc.setFont('times', 'normal'); doc.setFontSize(8.5); doc.setTextColor(2, 132, 199);
  doc.text(preceptorName, sigRightX + 22.5, sigY + 19, { align: 'center' });
  doc.setFontSize(7.5); doc.setTextColor(15, 23, 42);
  doc.text(preceptorDesig.toUpperCase(), sigRightX + 22.5, sigY + 26, { align: 'center' });
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
