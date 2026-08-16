/**
 * Central Normalized Clinical Case Data Builder.
 * Produces ONE unified, complete, and consistent data model consumed identically by:
 *  1. Approved Case Preview (ClinicalCaseDocumentRenderer.jsx)
 *  2. PDF Generator (generateOfficialClinicalCasePDF.js)
 *  3. PPT Generator (generateClinicalCasePPTX.js)
 */
export const buildNormalizedApprovedCaseData = ({
  clinicalCase = {},
  student = {},
  preceptor = {},
  college = {},
  caseModulesData = {}
}) => {
  const profile = caseModulesData?.profile || {};
  const counselling = caseModulesData?.counselling || {};
  const intervention = caseModulesData?.intervention || {};
  const dir = caseModulesData?.dir || {};
  const adr = caseModulesData?.adr || {};

  // Form completion checker
  const isFormCompleted = (formObj) => {
    if (!formObj || typeof formObj !== 'object' || Object.keys(formObj).length === 0) return false;
    const status = (formObj.status || formObj.form_status || formObj.approval_status || '').toLowerCase();
    if (status === 'draft' || status === 'incomplete' || status === 'not_submitted' || status === 'not started' || status === 'not added' || status === '') {
      return false;
    }
    if (status === 'completed' || status === 'submitted' || status === 'approved' || status === 'reviewed' || formObj.is_completed === true) {
      return true;
    }
    return false;
  };

  // Helper to extract 100% of all submitted fields from a completed form
  const extractAllSubmittedFields = (formObj, systemExcluded = []) => {
    if (!formObj || typeof formObj !== 'object') return [];
    const blacklist = ['id', 'clinical_case_id', 'student_id', 'college_id', 'status', 'form_status', 'created_at', 'updated_at', 'is_completed', ...systemExcluded];
    
    return Object.entries(formObj)
      .filter(([k, v]) => !blacklist.includes(k) && v !== null && v !== undefined && v !== '')
      .map(([k, v]) => ({
        key: k,
        label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: typeof v === 'object' ? JSON.stringify(v) : String(v)
      }));
  };

  // Status Flags
  const isProfileCompleted = isFormCompleted(profile) || Boolean(profile.patient_name || clinicalCase?.patient_name);
  const isCounsellingCompleted = isFormCompleted(counselling);
  const isInterventionCompleted = isFormCompleted(intervention);
  const isDirCompleted = isFormCompleted(dir);
  const isAdrCompleted = isFormCompleted(adr);

  // Clinical Dates strictly from student-entered form data
  const dates = {
    doa: profile.date_of_admission || profile.doa || clinicalCase?.date_of_admission || 'N/A',
    dod: profile.date_of_discharge || profile.dod || profile.doc || clinicalCase?.date_of_discharge || 'N/A',
    doc: profile.date_of_consultation || profile.doc || profile.date_of_admission || 'N/A',
    counsellingDate: counselling.counselling_date || counselling.date || 'N/A',
    interventionDate: intervention.intervention_date || intervention.date || 'N/A',
    reportingDate: intervention.reporting_date || 'N/A',
    queryDate: dir.query_date || dir.date || 'N/A',
    adrOnsetDate: adr.onset_date || adr.date || 'N/A'
  };

  // Demographics
  const demographics = {
    patientName: profile.patient_name || clinicalCase?.patient_name || 'N/A',
    age: profile.age || clinicalCase?.age || 'N/A',
    gender: profile.gender || clinicalCase?.gender || 'N/A',
    ipOpNo: profile.ip_op_number || profile.ip_no || clinicalCase?.ip_op_number || 'N/A',
    wardBed: profile.ward ? `${profile.ward} ${profile.bed_number ? `(Bed: ${profile.bed_number})` : ''}` : (clinicalCase?.ward || 'N/A'),
    department: profile.department || clinicalCase?.department || 'N/A',
    physician: profile.attending_physician || profile.physician || 'Attending Consultant',
    height: profile.height ? `${profile.height} cm` : '—',
    weight: profile.weight ? `${profile.weight} kg` : '—',
    bmi: profile.bmi ? `${profile.bmi}` : '—',
    allergyDrugs: profile.allergy_drugs || profile.allergies || 'NIL',
    allergyFood: profile.allergy_food || 'NIL',
    socialHistory: profile.social_history || [
      profile.smoker_pack_day ? `Smoker (${profile.smoker_pack_day}/day)` : null,
      profile.alcoholic_amount_day ? `Alcoholic (${profile.alcoholic_amount_day})` : null,
      profile.marital_status ? `Marital: ${profile.marital_status}` : null
    ].filter(Boolean).join(', ') || 'Non-smoker, Non-alcoholic',
    diet: profile.diet || 'Regular Diet'
  };

  // Clinical History
  const history = {
    chiefComplaints: profile.chief_complaints || 'N/A',
    pastMedicalHistory: profile.past_medical_history || profile.past_history || 'NIL',
    pastMedicationHistory: profile.past_medication_history || '',
    familyHistory: profile.family_history || '',
    generalExam: profile.general_examination || '',
    systemicExam: profile.systemic_examination || ''
  };

  const safeArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  };

  const rawVitals = safeArray(caseModulesData?.vitals)
    .concat(safeArray(profile.vital_signs))
    .concat(safeArray(profile.vitals))
    .concat(safeArray(profile.vital_signs_log));
  const vitals = rawVitals.length > 0 ? rawVitals : [];

  const rawLabs = safeArray(caseModulesData?.labs)
    .concat(safeArray(profile.labs))
    .concat(safeArray(profile.laboratory_tests))
    .concat(safeArray(profile.lab_investigations));
  const labs = rawLabs.length > 0 ? rawLabs : [];

  const rawDrugs = safeArray(caseModulesData?.drugs)
    .concat(safeArray(profile.drugs))
    .concat(safeArray(profile.medications))
    .concat(safeArray(profile.prescribed_medications))
    .concat(safeArray(profile.drug_treatment_chart));
  const drugs = rawDrugs.length > 0 ? rawDrugs : [];

  // Diagnoses & Notes
  const diagnosis = {
    provisional: profile.provisional_diagnosis || '',
    final: clinicalCase?.final_diagnosis || clinicalCase?.diagnosis || profile.final_diagnosis || profile.provisional_diagnosis || 'Clinical Case Presentation',
    otherInvestigations: profile.other_investigations || profile.radiological_findings || '',
    dischargeSummary: profile.discharge_summary || ''
  };

  // Dynamic submitted fields list for optional completed modules
  const counsellingFields = isCounsellingCompleted ? extractAllSubmittedFields(counselling) : [];
  const interventionFields = isInterventionCompleted ? extractAllSubmittedFields(intervention) : [];
  const dirFields = isDirCompleted ? extractAllSubmittedFields(dir) : [];
  const adrFields = isAdrCompleted ? extractAllSubmittedFields(adr) : [];

  return {
    caseId: clinicalCase?.case_id || 'CLINICAL-CASE-001',
    collegeName: college?.college_name || college?.name || 'Pharmacy College',
    hospitalName: college?.hospital_name || college?.hospitalName || college?.primary_hospital_name || clinicalCase?.hospital_name || 'Primary Teaching Hospital',
    studentName: student?.full_name || clinicalCase?.student_name || 'Student Candidate',
    studentRoll: student?.roll_number || 'Roll Number',
    preceptorName: preceptor?.full_name || clinicalCase?.assigned_preceptor_name || 'Faculty Preceptor',
    preceptorDesig: preceptor?.designation || 'ASSISTANT PROFESSOR',
    
    // Status Flags
    isProfileCompleted,
    isCounsellingCompleted,
    isInterventionCompleted,
    isDirCompleted,
    isAdrCompleted,

    // Data Objects
    dates,
    demographics,
    history,
    vitals,
    labs,
    drugs,
    diagnosis,

    // Form Raw Records & Dynamic Fields
    profile,
    counselling,
    counsellingFields,
    intervention,
    interventionFields,
    dir,
    dirFields,
    adr,
    adrFields
  };
};
