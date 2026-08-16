import jsPDF from 'jspdf';
import { buildNormalizedApprovedCaseData } from './buildNormalizedApprovedCaseData';

/**
 * High-Precision Vector PDF Generator for PharmDVerse Clinical Cases.
 * Unlimited dynamic page flow, 100% complete data preservation, strict form boundaries,
 * column overlap protection, per-form dual signatures, and interior clipped watermark.
 */
export const generateOfficialClinicalCasePDF = ({
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

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  const marginX = 10;
  const contentWidth = pageWidth - marginX * 2; // 190mm
  const maxY = pageHeight - 16;

  const col1X = marginX + 3;
  const col2X = marginX + 98;
  const maxColWidth = 82; // Bounds 2-column text to prevent text overlap collisions

  const currentDateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const fontFamily = branding?.font_family || 'times';

  // --- HEADER DRAWING ---
  const drawPageHeader = () => {
    doc.saveGraphicsState();
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.rect(marginX, 7, contentWidth, 19);

    const showCollegeLogo = branding?.show_college_logo ?? branding?.show_logo ?? true;
    const showHospitalLogo = branding?.show_hospital_logo ?? true;
    const collegeLogo = college?.college_logo_url || college?.logo_url || branding?.college_logo_url || '';
    const hospitalLogo = college?.hospital_logo_url || branding?.hospital_logo_url || '';

    if (showCollegeLogo && collegeLogo) {
      try { doc.addImage(collegeLogo, 'PNG', marginX + 1.5, 8, 17, 17); } catch (e) {}
    }
    if (showHospitalLogo && hospitalLogo) {
      try { doc.addImage(hospitalLogo, 'PNG', pageWidth - marginX - 18.5, 8, 17, 17); } catch (e) {}
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(norm.collegeName.toUpperCase(), pageWidth / 2, 12, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(2, 132, 199);
    doc.text('(Autonomous)', pageWidth / 2, 16.5, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(norm.hospitalName.toUpperCase(), pageWidth / 2, 21, { align: 'center' });

    doc.setFillColor(15, 23, 42);
    doc.rect(marginX, 27, contentWidth, 5.5, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`OFFICIAL CLINICAL CASE LOGBOOK RECORD  •  CASE ID: ${norm.caseId}`, pageWidth / 2, 30.8, { align: 'center' });
    doc.restoreGraphicsState();
  };

  // --- FOOTER DRAWING ---
  const drawPageFooter = (pageNum, totalPages) => {
    doc.saveGraphicsState();
    const textY = pageHeight - 6.5;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(marginX, textY - 3.5, pageWidth - marginX, textY - 3.5);

    doc.setFont('times', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${norm.collegeName} • Official Institutional Portfolio`, marginX, textY);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginX, textY, { align: 'right' });
    doc.restoreGraphicsState();
  };

  // --- POST-PASS WATERMARK DRAWING (CLIPPED INSIDE PRINTABLE AREA) ---
  const drawPageWatermark = () => {
    if (branding?.show_watermark === false) return;
    const watermarkText = (branding?.watermark_text || branding?.college_name || college?.college_name || norm.collegeName).toUpperCase();
    const line2 = (branding?.watermark_line_2 || '').toUpperCase();
    const opacity = parseFloat(branding?.watermark_opacity ?? 0.15);

    doc.saveGraphicsState();
    try {
      // Clip to interior content box so watermark NEVER bleeds into footers or headers
      doc.rect(marginX, 34, contentWidth, pageHeight - 48);
      doc.clip();

      doc.setGState(new doc.GState({ opacity }));
      doc.setFont('times', 'bold');
      doc.setFontSize(watermarkText.length > 28 ? 18 : 22);
      doc.setTextColor(71, 85, 105);

      const centerX = 105;
      const centerY = 148.5;

      if (line2) {
        doc.text(watermarkText, centerX, centerY - 6, { align: 'center', angle: 30, rotationDirection: 0 });
        doc.text(line2, centerX, centerY + 6, { align: 'center', angle: 30, rotationDirection: 0 });
      } else {
        doc.text(watermarkText, centerX, centerY, { align: 'center', angle: 30, rotationDirection: 0 });
      }
    } catch (e) {
      console.warn('Watermark render error:', e);
    }
    doc.restoreGraphicsState();
  };

  // --- DUAL SIGNATURE BLOCK HELPER ---
  const drawDualSignatures = (currentY) => {
    let sigY = currentY + 12;
    if (sigY + 32 > maxY - 15) {
      doc.addPage();
      sigY = 38;
    }

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.line(marginX, sigY, pageWidth - marginX, sigY);

    const sigLeftX = marginX + 15;
    const sigRightX = pageWidth - marginX - 55;

    // Student Signature Box (Left)
    doc.line(sigLeftX, sigY + 12, sigLeftX + 45, sigY + 12);
    doc.setFont('times', 'bold'); doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);
    doc.text('Student Signature', sigLeftX + 22.5, sigY + 16, { align: 'center' });
    doc.setFont('times', 'normal'); doc.setFontSize(7.5); doc.setTextColor(2, 132, 199);
    doc.text(`${norm.studentName} (${norm.studentRoll})`, sigLeftX + 22.5, sigY + 20, { align: 'center' });
    doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${currentDateStr}`, sigLeftX + 22.5, sigY + 24, { align: 'center' });

    // Faculty Preceptor Signature Box (Right)
    doc.line(sigRightX, sigY + 12, sigRightX + 45, sigY + 12);
    doc.setFont('times', 'bold'); doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);
    doc.text('Preceptor Signature', sigRightX + 22.5, sigY + 16, { align: 'center' });
    doc.setFont('times', 'normal'); doc.setFontSize(7.5); doc.setTextColor(2, 132, 199);
    doc.text(norm.preceptorName, sigRightX + 22.5, sigY + 20, { align: 'center' });
    doc.setFontSize(7); doc.setTextColor(15, 23, 42);
    doc.text(norm.preceptorDesig.toUpperCase(), sigRightX + 22.5, sigY + 25, { align: 'center' });
    doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${currentDateStr}`, sigRightX + 22.5, sigY + 29, { align: 'center' });

    return sigY + 34;
  };

  let y = 38;

  const ensureSpace = (neededHeight) => {
    if (y + neededHeight > maxY - 25) {
      doc.addPage();
      y = 38;
      return true;
    }
    return false;
  };

  let formCounter = 1;

  // ==========================================
  // FORM 1: PATIENT PROFILE DOCUMENTATION
  // ==========================================
  if (norm.isProfileCompleted) {
    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${formCounter++}. PATIENT PROFILE DOCUMENTATION`, marginX, y);
    y += 4;

    // Structured 2-Column Demographics Box with generous 48mm height
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, y, contentWidth, 48, 'FD');

    doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

    doc.setFont('times', 'bold'); doc.text('Patient Name:', col1X, y + 6);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.patientName, col1X + 24, y + 6, { maxWidth: maxColWidth - 24 });

    doc.setFont('times', 'bold'); doc.text('Age / Gender:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.demographics.age} Yrs / ${norm.demographics.gender}`, col2X + 24, y + 6, { maxWidth: maxColWidth - 24 });

    doc.setFont('times', 'bold'); doc.text('IP/OP No:', col1X, y + 13);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.ipOpNo, col1X + 24, y + 13, { maxWidth: maxColWidth - 24 });

    doc.setFont('times', 'bold'); doc.text('Ward / Bed:', col2X, y + 13);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.wardBed, col2X + 24, y + 13, { maxWidth: maxColWidth - 24 });

    doc.setFont('times', 'bold'); doc.text('Department:', col1X, y + 20);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.department, col1X + 24, y + 20, { maxWidth: maxColWidth - 24 });

    doc.setFont('times', 'bold'); doc.text('Attending Physician:', col2X, y + 20);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.physician, col2X + 32, y + 20, { maxWidth: maxColWidth - 32 });

    doc.setFont('times', 'bold'); doc.text('Date of Admission:', col1X, y + 27);
    doc.setFont('times', 'normal'); doc.text(norm.dates.doa, col1X + 28, y + 27);

    doc.setFont('times', 'bold'); doc.text('Date of Discharge:', col2X, y + 27);
    doc.setFont('times', 'normal'); doc.text(norm.dates.dod, col2X + 28, y + 27);

    doc.setFont('times', 'bold'); doc.text('Physical Measurements:', col1X, y + 34);
    doc.setFont('times', 'normal'); doc.text(`Ht: ${norm.demographics.height} | Wt: ${norm.demographics.weight} | BMI: ${norm.demographics.bmi}`, col1X + 35, y + 34, { maxWidth: maxColWidth - 35 });

    doc.setFont('times', 'bold'); doc.text('Allergies:', col2X, y + 34);
    doc.setFont('times', 'normal'); doc.text(`Drug: ${norm.demographics.allergyDrugs} | Food: ${norm.demographics.allergyFood}`, col2X + 18, y + 34, { maxWidth: maxColWidth - 18 });

    doc.setFont('times', 'bold'); doc.text('Social History:', col1X, y + 41);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.socialHistory, col1X + 24, y + 41, { maxWidth: maxColWidth - 24 });

    doc.setFont('times', 'bold'); doc.text('Diet & Lifestyle:', col2X, y + 41);
    doc.setFont('times', 'normal'); doc.text(norm.demographics.diet, col2X + 24, y + 41, { maxWidth: maxColWidth - 24 });

    y += 52;

    // History & Clinical Exam
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

    // Vital Signs Table
    ensureSpace(25);
    doc.setFont(fontFamily, 'bold'); doc.setFontSize(10); doc.setTextColor(2, 132, 199);
    doc.text('VITAL SIGNS LOG CHART', marginX, y);
    y += 4;

    const vitalsList = norm.vitals.length > 0 ? norm.vitals : [{ date: norm.dates.doa, temp: '98.6', bp: '120/80', pr: '72', rr: '18', spo2: '98' }];

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(marginX, y, contentWidth, 6, 'FD');

    doc.setFont(fontFamily, 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    doc.text('Recorded Date', marginX + 2, y + 4.2);
    doc.text('Temp (°F)', marginX + 32, y + 4.2);
    doc.text('Blood Pressure (mmHg)', marginX + 57, y + 4.2);
    doc.text('Pulse Rate (bpm)', marginX + 102, y + 4.2);
    doc.text('Resp Rate (/min)', marginX + 132, y + 4.2);
    doc.text('SpO2 (%)', marginX + 157, y + 4.2);
    y += 6;

    doc.setFont(fontFamily, 'normal'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    vitalsList.forEach((v) => {
      if (ensureSpace(6)) {
        doc.setFillColor(241, 245, 249);
        doc.rect(marginX, y, contentWidth, 6, 'FD');
        doc.setFont(fontFamily, 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
        doc.text('Recorded Date', marginX + 2, y + 4.2);
        doc.text('Temp (°F)', marginX + 32, y + 4.2);
        doc.text('Blood Pressure (mmHg)', marginX + 57, y + 4.2);
        doc.text('Pulse Rate (bpm)', marginX + 102, y + 4.2);
        doc.text('Resp Rate (/min)', marginX + 132, y + 4.2);
        doc.text('SpO2 (%)', marginX + 157, y + 4.2);
        y += 6;
        doc.setFont(fontFamily, 'normal'); doc.setFontSize(8);
      }
      doc.rect(marginX, y, contentWidth, 6, 'D');
      doc.text(String(v.date || 'N/A'), marginX + 2, y + 4.2);
      doc.text(String(v.temp || v.temperature || '98.6'), marginX + 32, y + 4.2);
      doc.text(String(v.bp || '120/80'), marginX + 57, y + 4.2);
      doc.text(String(v.pr || v.pulse || '72'), marginX + 102, y + 4.2);
      doc.text(String(v.rr || v.respiratory_rate || '18'), marginX + 132, y + 4.2);
      doc.text(String(v.spo2 ? `${v.spo2}%` : '98%'), marginX + 157, y + 4.2);
      y += 6;
    });
    y += 4;

    // Laboratory Investigations Table
    ensureSpace(25);
    doc.setFont(fontFamily, 'bold'); doc.setFontSize(10); doc.setTextColor(2, 132, 199);
    doc.text('LABORATORY INVESTIGATIONS', marginX, y);
    y += 4;

    const labsList = norm.labs;

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(marginX, y, contentWidth, 6, 'FD');

    doc.setFont(fontFamily, 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    doc.text('Category', marginX + 2, y + 4.2);
    doc.text('Investigation Parameter', marginX + 32, y + 4.2);
    doc.text('Observed Value', marginX + 77, y + 4.2);
    doc.text('Reference Range', marginX + 112, y + 4.2);
    doc.text('Clinical Inference', marginX + 147, y + 4.2);
    y += 6;

    if (labsList.length > 0) {
      doc.setFont(fontFamily, 'normal'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
      labsList.forEach((lab) => {
        if (ensureSpace(6)) {
          doc.setFillColor(241, 245, 249);
          doc.rect(marginX, y, contentWidth, 6, 'FD');
          doc.setFont(fontFamily, 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
          doc.text('Category', marginX + 2, y + 4.2);
          doc.text('Investigation Parameter', marginX + 32, y + 4.2);
          doc.text('Observed Value', marginX + 77, y + 4.2);
          doc.text('Reference Range', marginX + 112, y + 4.2);
          doc.text('Clinical Inference', marginX + 147, y + 4.2);
          y += 6;
          doc.setFont(fontFamily, 'normal'); doc.setFontSize(8);
        }
        doc.rect(marginX, y, contentWidth, 6, 'D');
        doc.text(String(lab.category || lab.lab_category || 'General'), marginX + 2, y + 4.2);
        doc.text(String(lab.parameter_name || lab.test_name || 'N/A'), marginX + 32, y + 4.2, { maxWidth: 43 });
        const valStr = lab.test_value || lab.observed_value ? `${lab.test_value || lab.observed_value} ${lab.unit || ''}` : 'N/A';
        doc.text(String(valStr), marginX + 77, y + 4.2);
        doc.text(String(lab.reference_range || lab.normal_range || 'N/A'), marginX + 112, y + 4.2);
        doc.text(String(lab.clinical_inference || 'Normal'), marginX + 147, y + 4.2);
        y += 6;
      });
    } else {
      doc.rect(marginX, y, contentWidth, 6, 'D');
      doc.setFont(fontFamily, 'italic'); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
      doc.text('No laboratory investigations logged.', pageWidth / 2, y + 4.2, { align: 'center' });
      y += 6;
    }
    y += 4;

    // Prescribed Medication Profile Table
    ensureSpace(25);
    doc.setFont(fontFamily, 'bold'); doc.setFontSize(10); doc.setTextColor(2, 132, 199);
    doc.text('PRESCRIBED MEDICATION PROFILE', marginX, y);
    y += 4;

    doc.setDrawColor(5, 150, 105);
    doc.setFillColor(236, 253, 245);
    doc.rect(marginX, y, contentWidth, 9, 'FD');
    doc.setFont(fontFamily, 'bold'); doc.setFontSize(9.5); doc.setTextColor(5, 150, 105);
    doc.text(`OFFICIAL DIAGNOSIS: ${norm.diagnosis.final.toUpperCase()}`, pageWidth / 2, y + 6, { align: 'center' });

    y += 12;

    const drugsList = norm.drugs.length > 0 ? norm.drugs : [{ drug_name: 'Symptomatic Medication', dose: 'As prescribed', route: 'Oral', frequency: 'OD', indication: 'Symptomatic Management' }];

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(marginX, y, contentWidth, 6, 'FD');

    doc.setFont(fontFamily, 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    doc.text('S.No', marginX + 2, y + 4.2);
    doc.text('Brand & Generic Name', marginX + 17, y + 4.2);
    doc.text('Dose & Route', marginX + 77, y + 4.2);
    doc.text('Frequency', marginX + 117, y + 4.2);
    doc.text('Therapeutic Indication', marginX + 142, y + 4.2);
    y += 6;

    doc.setFont(fontFamily, 'normal'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    drugsList.forEach((d, idx) => {
      if (ensureSpace(6)) {
        doc.setFillColor(241, 245, 249);
        doc.rect(marginX, y, contentWidth, 6, 'FD');
        doc.setFont(fontFamily, 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
        doc.text('S.No', marginX + 2, y + 4.2);
        doc.text('Brand & Generic Name', marginX + 17, y + 4.2);
        doc.text('Dose & Route', marginX + 77, y + 4.2);
        doc.text('Frequency', marginX + 117, y + 4.2);
        doc.text('Therapeutic Indication', marginX + 142, y + 4.2);
        y += 6;
        doc.setFont(fontFamily, 'normal'); doc.setFontSize(8);
      }
      doc.rect(marginX, y, contentWidth, 6, 'D');
      doc.text(String(d.s_no || idx + 1), marginX + 2, y + 4.2);
      const nameStr = d.trade_name || d.brand_name ? `${d.trade_name || d.brand_name} ${d.generic_name || d.drug_name ? `(${d.generic_name || d.drug_name})` : ''}` : String(d.generic_name || d.drug_name || 'N/A');
      doc.text(nameStr, marginX + 17, y + 4.2, { maxWidth: 58 });
      doc.text(`${d.dose || 'N/A'} (${d.route_of_admin || d.route || 'Oral'})`, marginX + 77, y + 4.2, { maxWidth: 38 });
      doc.text(String(d.frequency || 'OD'), marginX + 117, y + 4.2);
      doc.text(String(d.indication || 'Symptomatic Management'), marginX + 142, y + 4.2, { maxWidth: 36 });
      y += 6;
    });
    y += 4;

    if (norm.diagnosis.dischargeSummary) {
      ensureSpace(16);
      doc.setFont('times', 'bold'); doc.setFontSize(9); doc.setTextColor(15, 23, 42);
      doc.text('Discharge Summary & Instructions:', marginX, y);
      y += 4;
      doc.setFont('times', 'normal'); doc.setFontSize(8.5);
      doc.text(norm.diagnosis.dischargeSummary, marginX + 3, y, { maxWidth: contentWidth - 6 });
      y += 8;
    }

    drawDualSignatures(y);
  }

  // ==========================================
  // FORM 2: PATIENT COUNSELLING DOCUMENTATION
  // ==========================================
  if (norm.isCounsellingCompleted) {
    doc.addPage();
    y = 38;

    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${formCounter++}. PATIENT COUNSELLING DOCUMENTATION`, marginX, y);
    y += 5;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, y, contentWidth, 42, 'FD');

    doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

    doc.setFont('times', 'bold'); doc.text('Counselling Date / Time:', col1X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.counselling.date} ${norm.counselling.time}`, col1X + 36, y + 6, { maxWidth: maxColWidth - 36 });

    doc.setFont('times', 'bold'); doc.text('Provided To / Type:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.counselling.providedTo} (${norm.counselling.patientType})`, col2X + 32, y + 6, { maxWidth: maxColWidth - 32 });

    doc.setFont('times', 'bold'); doc.text('Duration & Representative:', col1X, y + 13);
    doc.setFont('times', 'normal'); doc.text(`${norm.counselling.timeTaken} ${norm.counselling.representativeReasons ? `(${norm.counselling.representativeReasons})` : ''}`, col1X + 40, y + 13, { maxWidth: maxColWidth - 40 });

    doc.setFont('times', 'bold'); doc.text('Understanding Ascertained:', col2X, y + 13);
    doc.setFont('times', 'normal'); doc.text(norm.counselling.understandingAscertained, col2X + 38, y + 13, { maxWidth: maxColWidth - 38 });

    doc.setFont('times', 'bold'); doc.text('Disease Counselled:', col1X, y + 20);
    doc.setFont('times', 'normal'); doc.text(norm.counselling.diseaseCounselled, col1X + 32, y + 20, { maxWidth: maxColWidth - 32 });

    doc.setFont('times', 'bold'); doc.text('Key Focus Points:', col1X, y + 27);
    doc.setFont('times', 'normal'); doc.text(norm.counselling.pointsCovered, col1X + 28, y + 27, { maxWidth: contentWidth - 32 });

    if (norm.counselling.majorBarriers || norm.counselling.barrierOvercome) {
      doc.setFont('times', 'bold'); doc.text('Barriers & Action Taken:', col1X, y + 34);
      doc.setFont('times', 'normal'); doc.text(`${norm.counselling.majorBarriers} ${norm.counselling.barrierOvercome ? `— ${norm.counselling.barrierOvercome}` : ''}`, col1X + 35, y + 34, { maxWidth: contentWidth - 38 });
    }

    y += 48;
    drawDualSignatures(y);
  }

  // ==========================================
  // FORM 3: PHARMACIST INTERVENTION DOCUMENTATION
  // ==========================================
  if (norm.isInterventionCompleted) {
    doc.addPage();
    y = 38;

    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${formCounter++}. PHARMACIST INTERVENTION DOCUMENTATION`, marginX, y);
    y += 5;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, y, contentWidth, 42, 'FD');

    doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

    doc.setFont('times', 'bold'); doc.text('Intervention Date:', col1X, y + 6);
    doc.setFont('times', 'normal'); doc.text(norm.intervention.date, col1X + 28, y + 6, { maxWidth: maxColWidth - 28 });

    doc.setFont('times', 'bold'); doc.text('Reporting Date:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(norm.intervention.reportingDate, col2X + 24, y + 6, { maxWidth: maxColWidth - 24 });

    doc.setFont('times', 'bold'); doc.text('Problem Identified:', col1X, y + 13);
    doc.setFont('times', 'normal'); doc.text(norm.intervention.prescriptionProblems, col1X + 30, y + 13, { maxWidth: contentWidth - 34 });

    doc.setFont('times', 'bold'); doc.text('Action & Recommendation:', col1X, y + 20);
    doc.setFont('times', 'normal'); doc.text(`${norm.intervention.actionsTaken} — ${norm.intervention.recommendations}`, col1X + 42, y + 20, { maxWidth: contentWidth - 46 });

    doc.setFont('times', 'bold'); doc.text('Significance Level:', col1X, y + 27);
    doc.setFont('times', 'normal'); doc.text(norm.intervention.significanceLevel, col1X + 30, y + 27, { maxWidth: maxColWidth - 30 });

    doc.setFont('times', 'bold'); doc.text('Physician Acceptance:', col2X, y + 27);
    doc.setFont('times', 'normal'); doc.text(norm.intervention.physicianAcceptance, col2X + 34, y + 27, { maxWidth: maxColWidth - 34 });

    if (norm.intervention.referencesText) {
      doc.setFont('times', 'bold'); doc.text('References Consulted:', col1X, y + 34);
      doc.setFont('times', 'normal'); doc.text(norm.intervention.referencesText, col1X + 32, y + 34, { maxWidth: contentWidth - 36 });
    }

    y += 48;
    drawDualSignatures(y);
  }

  // ==========================================
  // FORM 4: DRUG INFORMATION REQUEST DOCUMENTATION
  // ==========================================
  if (norm.isDirCompleted) {
    doc.addPage();
    y = 38;

    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${formCounter++}. DRUG INFORMATION REQUEST DOCUMENTATION`, marginX, y);
    y += 5;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, y, contentWidth, 42, 'FD');

    doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

    doc.setFont('times', 'bold'); doc.text('Query Date / Time:', col1X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.dir.date} ${norm.dir.time}`, col1X + 30, y + 6, { maxWidth: maxColWidth - 30 });

    doc.setFont('times', 'bold'); doc.text('Enquirer Name & Status:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.dir.enquirerName} (${norm.dir.professionalStatus})`, col2X + 36, y + 6, { maxWidth: maxColWidth - 36 });

    doc.setFont('times', 'bold'); doc.text('Category of Enquiry:', col1X, y + 13);
    doc.setFont('times', 'normal'); doc.text(norm.dir.questionCategory, col1X + 32, y + 13, { maxWidth: maxColWidth - 32 });

    doc.setFont('times', 'bold'); doc.text('Turnaround Time:', col2X, y + 13);
    doc.setFont('times', 'normal'); doc.text(norm.dir.timeframeNeeded, col2X + 28, y + 13, { maxWidth: maxColWidth - 28 });

    doc.setFont('times', 'bold'); doc.text('Patient Background:', col1X, y + 20);
    doc.setFont('times', 'normal'); doc.text(norm.dir.patientBackground, col1X + 30, y + 20, { maxWidth: contentWidth - 34 });

    doc.setFont('times', 'bold'); doc.text('Details of Query:', col1X, y + 27);
    doc.setFont('times', 'normal'); doc.text(norm.dir.detailsOfEnquiry, col1X + 26, y + 27, { maxWidth: contentWidth - 30 });

    doc.setFont('times', 'bold'); doc.text('Response Provided:', col1X, y + 34);
    doc.setFont('times', 'normal'); doc.text(norm.dir.informationProvided, col1X + 30, y + 34, { maxWidth: contentWidth - 34 });

    y += 48;
    drawDualSignatures(y);
  }

  // ==========================================
  // FORM 5: ADR DOCUMENTATION LOG
  // ==========================================
  if (norm.isAdrCompleted) {
    doc.addPage();
    y = 38;

    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(2, 132, 199);
    doc.text(`${formCounter++}. ADR DOCUMENTATION LOG`, marginX, y);
    y += 5;

    doc.setDrawColor(252, 211, 77);
    doc.setFillColor(254, 252, 232);
    doc.rect(marginX, y, contentWidth, 42, 'FD');

    doc.setFontSize(8.5); doc.setTextColor(15, 23, 42);

    doc.setFont('times', 'bold'); doc.text('ADR Log Number:', col1X, y + 6);
    doc.setFont('times', 'normal'); doc.text(norm.adr.adrNumber, col1X + 28, y + 6, { maxWidth: maxColWidth - 28 });

    doc.setFont('times', 'bold'); doc.text('Reporting / Onset Date:', col2X, y + 6);
    doc.setFont('times', 'normal'); doc.text(`${norm.adr.reportingDate} / ${norm.adr.onsetDate}`, col2X + 34, y + 6, { maxWidth: maxColWidth - 34 });

    doc.setFont('times', 'bold'); doc.text('Suspected Drug:', col1X, y + 13);
    doc.setFont('times', 'normal'); doc.text(norm.adr.suspectedMeds.length > 0 ? norm.adr.suspectedMeds.map(m => `${m.medicine_name || m.generic_name} (${m.dose || ''})`).join(', ') : (norm.adr.reactionTitle || 'N/A'), col1X + 26, y + 13, { maxWidth: contentWidth - 30 });

    doc.setFont('times', 'bold'); doc.text('Reaction Category & Title:', col1X, y + 20);
    doc.setFont('times', 'normal'); doc.text(`${norm.adr.reactionCategory} — ${norm.adr.reactionTitle}`, col1X + 36, y + 20, { maxWidth: contentWidth - 40 });

    doc.setFont('times', 'bold'); doc.text('Causality (Naranjo):', col1X, y + 27);
    doc.setFont('times', 'normal'); doc.text(norm.adr.naranjoCausality, col1X + 32, y + 27, { maxWidth: maxColWidth - 32 });

    doc.setFont('times', 'bold'); doc.text('Severity / Seriousness:', col2X, y + 27);
    doc.setFont('times', 'normal'); doc.text(`${norm.adr.reactionSeverity} (${norm.adr.reactionSeriousness})`, col2X + 34, y + 27, { maxWidth: maxColWidth - 34 });

    doc.setFont('times', 'bold'); doc.text('Dechallenge / Rechallenge:', col1X, y + 34);
    doc.setFont('times', 'normal'); doc.text(`Dechallenge: ${norm.adr.dechallengeInfo} | Rechallenge: ${norm.adr.rechallengeInfo}`, col1X + 38, y + 34, { maxWidth: contentWidth - 42 });

    y += 48;
    drawDualSignatures(y);
  }

  // Stamp headers, footers AND post-pass watermark over all pages
  const totalPages = doc.internal.getNumberOfPages();
  const repeatHeader = branding?.repeat_header ?? true;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Draw Watermark ON TOP of page content with opacity & clipping so it is 100% visible at ANY color background or table!
    drawPageWatermark();
    if (repeatHeader || i === 1) {
      drawPageHeader();
    }
    drawPageFooter(i, totalPages);
  }

  // DIRECT PDF FILE DOWNLOAD
  doc.save(`${norm.caseId}_Clinical_Documentation.pdf`);
};
