import React, { useState, useEffect } from 'react';
import { ShieldAlert, User, Activity, Pill, HeartPulse, FileText, Upload, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Save, Eye, Send, Loader2, Plus, Trash2, ShieldCheck, Clock } from 'lucide-react';
import { fetchADRReportByCaseIdFromSupabase, generateUniqueAdrNumberInSupabase, saveOrUpdateADRReportInSupabase } from '../../services/supabaseService';
import { ADRReportPreviewModal } from './ADRReportPreviewModal';

const STEPS = [
  { id: 1, title: 'Record & Patient', subtitle: 'Sections 1 & 2' },
  { id: 2, title: 'Reaction Details', subtitle: 'Section 3' },
  { id: 3, title: 'Medications', subtitle: 'Sections 4 & 5' },
  { id: 4, title: 'Background & Assessment', subtitle: 'Sections 6 & 7' },
  { id: 5, title: 'Files & Review', subtitle: 'Sections 8 & 9' }
];

export const ADRDocumentationFormView = ({ clinicalCase, student, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // SECTION 1: GENERAL RECORD
  const [adrNumber, setAdrNumber] = useState('');
  const [reportingDate, setReportingDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignedPreceptorName, setAssignedPreceptorName] = useState('Faculty Preceptor');
  const [approvalStatus, setApprovalStatus] = useState('Draft');

  // SECTION 2: PATIENT OVERVIEW
  const [patientInitials, setPatientInitials] = useState('');
  const [hospitalRegNumber, setHospitalRegNumber] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('M');
  const [weight, setWeight] = useState('');
  const [department, setDepartment] = useState('');
  const [ward, setWard] = useState('');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');

  // SECTION 3: REACTION OVERVIEW
  const [reactionTitle, setReactionTitle] = useState('');
  const [reactionCategory, setReactionCategory] = useState('Dermatological');
  const [reactionDescription, setReactionDescription] = useState('');
  const [reactionStartedAt, setReactionStartedAt] = useState('');
  const [reactionEndedAt, setReactionEndedAt] = useState('');
  const [reactionDuration, setReactionDuration] = useState('');
  const [clinicalManagementProvided, setClinicalManagementProvided] = useState('');
  const [currentPatientCondition, setCurrentPatientCondition] = useState('Recovering');

  // SECTION 4: SUSPECTED MEDICATION (DYNAMIC TABLE)
  const [suspectedMeds, setSuspectedMeds] = useState([
    {
      medicine_name: '',
      generic_name: '',
      strength: '500 mg',
      dosage_form: 'Tablet',
      dose: '1 tab',
      route: 'Oral',
      frequency: 'BD',
      start_date: '',
      stop_date: '',
      clinical_indication: '',
      manufacturer: '',
      batch_number: '',
      expiry_date: ''
    }
  ]);

  // SECTION 5: CONCOMITANT MEDICATIONS (DYNAMIC TABLE)
  const [concomitantMeds, setConcomitantMeds] = useState([]);

  // SECTION 6: PATIENT BACKGROUND
  const [drugAllergyHistory, setDrugAllergyHistory] = useState('None known');
  const [previousAdrHistory, setPreviousAdrHistory] = useState('None');
  const [relevantMedicalConditions, setRelevantMedicalConditions] = useState('');
  const [pregnancyLactationStatus, setPregnancyLactationStatus] = useState('Not Applicable');
  const [renalStatus, setRenalStatus] = useState('Normal');
  const [hepaticStatus, setHepaticStatus] = useState('Normal');
  const [lifestyleFactors, setLifestyleFactors] = useState('Non-smoker, Non-alcoholic');
  const [additionalClinicalNotes, setAdditionalClinicalNotes] = useState('');

  // SECTION 7: REACTION ASSESSMENT
  const [reactionSeverity, setReactionSeverity] = useState('Moderate');
  const [reactionSeriousness, setReactionSeriousness] = useState('Hospitalization-Initial/Prolonged');
  const [patientOutcome, setPatientOutcome] = useState('Recovered');
  const [actionTakenOnSuspectedDrug, setActionTakenOnSuspectedDrug] = useState('Withdrawn');
  const [rechallengeInformation, setRechallengeInformation] = useState('Rechallenge not performed due to safety risk.');
  const [dechallengeInformation, setDechallengeInformation] = useState('Symptoms abated upon drug withdrawal.');
  const [initialCausalityOpinion, setInitialCausalityOpinion] = useState('Probable/Likely');
  const [clinicalRemarks, setClinicalRemarks] = useState('');

  // SECTION 8: SUPPORTING DOCUMENTS (FILES)
  const [attachments, setAttachments] = useState([]);

  // SECTION 9: REVIEW INFORMATION
  const [studentRemarks, setStudentRemarks] = useState('');
  const [preceptorReview, setPreceptorReview] = useState('');
  const [facultyComments, setFacultyComments] = useState('');

  // Meta
  const [existingReportId, setExistingReportId] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const loadADRData = async () => {
      if (!clinicalCase) return;
      setLoading(true);

      // Pre-fill defaults from clinicalCase
      setDepartment(clinicalCase.department || '');
      setWard(clinicalCase.ward_unit || '');
      setHospitalRegNumber(clinicalCase.case_id || '');

      const res = await fetchADRReportByCaseIdFromSupabase(clinicalCase.id);
      if (res.success && res.report) {
        const rep = res.report;
        setExistingReportId(rep.id);
        setAdrNumber(rep.adr_number || '');
        setReportingDate(rep.reporting_date || new Date().toISOString().split('T')[0]);
        setAssignedPreceptorName(rep.assigned_preceptor_name || 'Faculty Preceptor');
        setApprovalStatus(rep.approval_status || 'Draft');

        setPatientInitials(rep.patient_initials || '');
        setHospitalRegNumber(rep.hospital_reg_number || clinicalCase.case_id || '');
        setAge(rep.age || '');
        setGender(rep.gender || 'M');
        setWeight(rep.weight || '');
        setDepartment(rep.department || clinicalCase.department || '');
        setWard(rep.ward || clinicalCase.ward_unit || '');
        setPrimaryDiagnosis(rep.primary_diagnosis || '');

        setReactionTitle(rep.reaction_title || '');
        setReactionCategory(rep.reaction_category || 'Dermatological');
        setReactionDescription(rep.reaction_description || '');
        setReactionStartedAt(rep.reaction_started_at ? rep.reaction_started_at.split('T')[0] : '');
        setReactionEndedAt(rep.reaction_ended_at ? rep.reaction_ended_at.split('T')[0] : '');
        setReactionDuration(rep.reaction_duration || '');
        setClinicalManagementProvided(rep.clinical_management_provided || '');
        setCurrentPatientCondition(rep.current_patient_condition || 'Recovering');

        setDrugAllergyHistory(rep.drug_allergy_history || 'None known');
        setPreviousAdrHistory(rep.previous_adr_history || 'None');
        setRelevantMedicalConditions(rep.relevant_medical_conditions || '');
        setPregnancyLactationStatus(rep.pregnancy_lactation_status || 'Not Applicable');
        setRenalStatus(rep.renal_status || 'Normal');
        setHepaticStatus(rep.hepatic_status || 'Normal');
        setLifestyleFactors(rep.lifestyle_factors || '');
        setAdditionalClinicalNotes(rep.additional_clinical_notes || '');

        setReactionSeverity(rep.reaction_severity || 'Moderate');
        setReactionSeriousness(rep.reaction_seriousness || 'Hospitalization-Initial/Prolonged');
        setPatientOutcome(rep.patient_outcome || 'Recovered');
        setActionTakenOnSuspectedDrug(rep.action_taken_on_suspected_drug || 'Withdrawn');
        setRechallengeInformation(rep.rechallenge_information || '');
        setDechallengeInformation(rep.dechallenge_information || '');
        setInitialCausalityOpinion(rep.initial_causality_opinion || 'Probable/Likely');
        setClinicalRemarks(rep.clinical_remarks || '');

        setStudentRemarks(rep.student_remarks || '');
        setPreceptorReview(rep.preceptor_review || '');
        setFacultyComments(rep.faculty_comments || '');

        if (res.suspectedMeds && res.suspectedMeds.length > 0) setSuspectedMeds(res.suspectedMeds);
        if (res.concomitantMeds) setConcomitantMeds(res.concomitantMeds);
        if (res.attachments) setAttachments(res.attachments);
      } else {
        // Auto-generate ADR Record Number
        const genRes = await generateUniqueAdrNumberInSupabase();
        if (genRes.success) setAdrNumber(genRes.adrNumber);
      }

      setLoading(false);
    };

    loadADRData();
  }, [clinicalCase]);

  // DYNAMIC SUSPECTED MEDS HANDLERS
  const handleAddSuspectedMed = () => {
    setSuspectedMeds([
      ...suspectedMeds,
      {
        medicine_name: '',
        generic_name: '',
        strength: '',
        dosage_form: 'Tablet',
        dose: '',
        route: 'Oral',
        frequency: 'OD',
        start_date: '',
        stop_date: '',
        clinical_indication: '',
        manufacturer: '',
        batch_number: '',
        expiry_date: ''
      }
    ]);
  };

  const handleRemoveSuspectedMed = (index) => {
    setSuspectedMeds(suspectedMeds.filter((_, i) => i !== index));
  };

  const handleUpdateSuspectedMed = (index, field, value) => {
    const updated = [...suspectedMeds];
    updated[index][field] = value;
    setSuspectedMeds(updated);
  };

  // DYNAMIC CONCOMITANT MEDS HANDLERS
  const handleAddConcomitantMed = () => {
    setConcomitantMeds([
      ...concomitantMeds,
      {
        medicine_name: '',
        dose: '',
        route: 'Oral',
        frequency: 'OD',
        purpose: '',
        start_date: '',
        stop_date: ''
      }
    ]);
  };

  const handleRemoveConcomitantMed = (index) => {
    setConcomitantMeds(concomitantMeds.filter((_, i) => i !== index));
  };

  const handleUpdateConcomitantMed = (index, field, value) => {
    const updated = [...concomitantMeds];
    updated[index][field] = value;
    setConcomitantMeds(updated);
  };

  // FILE ATTACHMENT HANDLER (Simulated file object metadata up to 5 files)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 5) {
      alert('Maximum 5 files allowed for ADR supporting documents.');
      return;
    }

    const newAtts = files.map(f => ({
      file_name: f.name,
      file_type: f.type || 'Document',
      file_url: URL.createObjectURL(f)
    }));

    setAttachments([...attachments, ...newAtts]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // SAVE & SUBMIT HANDLER
  const handleSaveADR = async (newStatus = 'Draft') => {
    setFormError('');
    setSaveSuccess('');

    if (!reactionTitle.trim() || !reactionDescription.trim()) {
      setFormError('Please provide Reaction Title and Reaction Description.');
      setCurrentStep(2);
      return;
    }

    if (suspectedMeds.length === 0 || !suspectedMeds[0].medicine_name.trim()) {
      setFormError('Please add at least one Suspected Medication with medicine name.');
      setCurrentStep(3);
      return;
    }

    setSaving(true);

    const masterPayload = {
      clinical_case_id: clinicalCase.id,
      student_id: student.id,
      college_id: student.college_id,
      adr_number: adrNumber,
      reporting_date: reportingDate,
      reported_by_student_name: student.full_name,
      assigned_preceptor_name: assignedPreceptorName,
      patient_initials: patientInitials,
      hospital_reg_number: hospitalRegNumber,
      age,
      gender,
      weight,
      department,
      ward,
      primary_diagnosis: primaryDiagnosis,
      reaction_title: reactionTitle.trim(),
      reaction_category: reactionCategory,
      reaction_description: reactionDescription.trim(),
      reaction_started_at: reactionStartedAt ? new Date(reactionStartedAt).toISOString() : null,
      reaction_ended_at: reactionEndedAt ? new Date(reactionEndedAt).toISOString() : null,
      reaction_duration: reactionDuration,
      clinical_management_provided: clinicalManagementProvided,
      current_patient_condition: currentPatientCondition,
      drug_allergy_history: drugAllergyHistory,
      previous_adr_history: previousAdrHistory,
      relevant_medical_conditions: relevantMedicalConditions,
      pregnancy_lactation_status: pregnancyLactationStatus,
      renal_status: renalStatus,
      hepatic_status: hepaticStatus,
      lifestyle_factors: lifestyleFactors,
      additional_clinical_notes: additionalClinicalNotes,
      reaction_severity: reactionSeverity,
      reaction_seriousness: reactionSeriousness,
      patient_outcome: patientOutcome,
      action_taken_on_suspected_drug: actionTakenOnSuspectedDrug,
      rechallenge_information: rechallengeInformation,
      dechallenge_information: dechallengeInformation,
      initial_causality_opinion: initialCausalityOpinion,
      clinical_remarks: clinicalRemarks,
      student_remarks: studentRemarks,
      preceptor_review: preceptorReview,
      faculty_comments: facultyComments,
      approval_status: newStatus
    };

    const res = await saveOrUpdateADRReportInSupabase(masterPayload, suspectedMeds, concomitantMeds, attachments);
    setSaving(false);

    if (res.success) {
      setExistingReportId(res.report.id);
      setApprovalStatus(newStatus);
      setSaveSuccess(newStatus === 'Submitted' ? 'ADR Report submitted to Preceptor successfully!' : 'ADR Report saved as Draft.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } else {
      setFormError(res.error || 'Failed to save ADR Report.');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-500">Loading ADR Digital Documentation Wizard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      
      {/* TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to My Cases"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] uppercase">
                Clinical Services
              </span>
              <span className="text-slate-400 text-xs">• ADR Documentation</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Adverse Drug Event Wizard</span>
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>Preview ADR Summary</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveADR('Draft')}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{existingReportId ? 'Update Draft' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveADR('Submitted')}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Submit to Preceptor</span>
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* MULTI-STEP WIZARD PROGRESS BAR */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 sm:pb-0">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentStep(s.id)}
              className={`flex-1 min-w-[140px] p-3 rounded-2xl border text-left transition-all ${
                currentStep === s.id
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
                  : currentStep > s.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <span>Step {s.id}</span>
                <span>{s.subtitle}</span>
              </div>
              <div className="text-xs font-bold truncate">{s.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* WIZARD STEP CONTENT */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 text-xs">
        
        {/* STEP 1: GENERAL RECORD & PATIENT OVERVIEW */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* SECTION 1: GENERAL RECORD */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Clock className="w-4 h-4 text-amber-500" />
                Section 1: General Record
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ADR Record Number (Auto)</label>
                  <input type="text" readOnly value={adrNumber} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-mono font-extrabold" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reporting Date</label>
                  <input type="date" value={reportingDate} onChange={(e) => setReportingDate(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reported By (Student)</label>
                  <input type="text" readOnly value={student?.full_name} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Preceptor</label>
                  <input type="text" value={assignedPreceptorName} onChange={(e) => setAssignedPreceptorName(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold" />
                </div>
              </div>
            </div>

            {/* SECTION 2: PATIENT OVERVIEW */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Section 2: Patient Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Patient Initials *</label>
                  <input type="text" value={patientInitials} onChange={(e) => setPatientInitials(e.target.value)} placeholder="e.g. R.K." className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hosp Reg / IP No.</label>
                  <input type="text" value={hospitalRegNumber} onChange={(e) => setHospitalRegNumber(e.target.value)} placeholder="Reg Number" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Age / Gender / Wt (kg)</label>
                  <div className="flex gap-2">
                    <input type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="w-full h-[44px] px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="h-[44px] px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                      <option value="M">M</option>
                      <option value="F">F</option>
                    </select>
                    <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Wt" className="w-20 h-[44px] px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department / Ward</label>
                  <div className="flex gap-2">
                    <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Dept" className="w-full h-[44px] px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                    <input type="text" value={ward} onChange={(e) => setWard(e.target.value)} placeholder="Ward" className="w-full h-[44px] px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Diagnosis</label>
                  <textarea rows={2} value={primaryDiagnosis} onChange={(e) => setPrimaryDiagnosis(e.target.value)} placeholder="Primary clinical diagnosis..." className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium" />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: REACTION OVERVIEW */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Activity className="w-4 h-4 text-rose-500" />
              Section 3: Reaction Overview
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reaction Title *</label>
                <input type="text" required value={reactionTitle} onChange={(e) => setReactionTitle(e.target.value)} placeholder="e.g. Severe Maculopapular Rash / Fixed Drug Eruption" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-rose-600 dark:text-rose-400" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reaction Category</label>
                <select value={reactionCategory} onChange={(e) => setReactionCategory(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                  <option value="Dermatological">Dermatological</option>
                  <option value="Gastrointestinal">Gastrointestinal</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Neurological">Neurological</option>
                  <option value="Renal">Renal</option>
                  <option value="Hepatic">Hepatic</option>
                  <option value="Immunological / Allergy">Immunological / Allergy</option>
                  <option value="Hematological">Hematological</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reaction Description *</label>
                <textarea rows={3} required value={reactionDescription} onChange={(e) => setReactionDescription(e.target.value)} placeholder="Detailed clinical description of the adverse reaction..." className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date & Time Reaction Started</label>
                <input type="datetime-local" value={reactionStartedAt} onChange={(e) => setReactionStartedAt(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date & Time Reaction Ended</label>
                <input type="datetime-local" value={reactionEndedAt} onChange={(e) => setReactionEndedAt(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reaction Duration</label>
                <input type="text" value={reactionDuration} onChange={(e) => setReactionDuration(e.target.value)} placeholder="e.g. 48 Hours" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold" />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Management Provided</label>
                <textarea rows={2} value={clinicalManagementProvided} onChange={(e) => setClinicalManagementProvided(e.target.value)} placeholder="Antihistamines, IV fluids, corticosteroid therapy..." className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Patient Condition</label>
                <select value={currentPatientCondition} onChange={(e) => setCurrentPatientCondition(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                  <option value="Recovering">Recovering</option>
                  <option value="Fully Recovered">Fully Recovered</option>
                  <option value="Not Recovered">Not Recovered</option>
                  <option value="Critical">Critical</option>
                  <option value="Fatal">Fatal</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUSPECTED & OTHER MEDICATIONS */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* SECTION 4: SUSPECTED MEDICATION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-amber-500" />
                  Section 4: Suspected Medication(s)
                </h3>

                <button
                  type="button"
                  onClick={handleAddSuspectedMed}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Suspected Medicine</span>
                </button>
              </div>

              <div className="space-y-4">
                {suspectedMeds.map((med, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-amber-800 dark:text-amber-300 text-xs">
                        Suspected Medicine #{index + 1}
                      </span>
                      {suspectedMeds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSuspectedMed(index)}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand Name *</label>
                        <input type="text" required value={med.medicine_name} onChange={(e) => handleUpdateSuspectedMed(index, 'medicine_name', e.target.value)} placeholder="Medicine name" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold" />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Generic Name</label>
                        <input type="text" value={med.generic_name} onChange={(e) => handleUpdateSuspectedMed(index, 'generic_name', e.target.value)} placeholder="Generic name" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dose / Route / Freq</label>
                        <div className="flex gap-1">
                          <input type="text" value={med.dose} onChange={(e) => handleUpdateSuspectedMed(index, 'dose', e.target.value)} placeholder="Dose" className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
                          <input type="text" value={med.route} onChange={(e) => handleUpdateSuspectedMed(index, 'route', e.target.value)} placeholder="Route" className="w-16 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
                          <input type="text" value={med.frequency} onChange={(e) => handleUpdateSuspectedMed(index, 'frequency', e.target.value)} placeholder="Freq" className="w-16 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Indication</label>
                        <input type="text" value={med.clinical_indication} onChange={(e) => handleUpdateSuspectedMed(index, 'clinical_indication', e.target.value)} placeholder="Indication" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                        <input type="date" value={med.start_date} onChange={(e) => handleUpdateSuspectedMed(index, 'start_date', e.target.value)} className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stop Date</label>
                        <input type="date" value={med.stop_date} onChange={(e) => handleUpdateSuspectedMed(index, 'stop_date', e.target.value)} className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Manufacturer (Opt)</label>
                        <input type="text" value={med.manufacturer} onChange={(e) => handleUpdateSuspectedMed(index, 'manufacturer', e.target.value)} placeholder="Pharma company" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Batch / Lot (Opt)</label>
                        <input type="text" value={med.batch_number} onChange={(e) => handleUpdateSuspectedMed(index, 'batch_number', e.target.value)} placeholder="Batch No" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 5: OTHER CONCURRENT MEDICATIONS */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Section 5: Other Concurrent Medications
                </h3>

                <button
                  type="button"
                  onClick={handleAddConcomitantMed}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Concurrent Medicine</span>
                </button>
              </div>

              {concomitantMeds.length > 0 ? (
                <div className="space-y-3">
                  {concomitantMeds.map((cMed, cIdx) => (
                    <div key={cIdx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
                      <input type="text" value={cMed.medicine_name} onChange={(e) => handleUpdateConcomitantMed(cIdx, 'medicine_name', e.target.value)} placeholder="Medicine Name" className="w-40 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold" />
                      <input type="text" value={cMed.dose} onChange={(e) => handleUpdateConcomitantMed(cIdx, 'dose', e.target.value)} placeholder="Dose" className="w-24 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono" />
                      <input type="text" value={cMed.frequency} onChange={(e) => handleUpdateConcomitantMed(cIdx, 'frequency', e.target.value)} placeholder="Freq" className="w-20 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono" />
                      <input type="text" value={cMed.purpose} onChange={(e) => handleUpdateConcomitantMed(cIdx, 'purpose', e.target.value)} placeholder="Purpose / Indication" className="flex-1 min-w-[150px] h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                      <button type="button" onClick={() => handleRemoveConcomitantMed(cIdx)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-center py-2">No concurrent medications added. Click button above if patient is taking other drugs.</p>
              )}
            </div>

          </div>
        )}

        {/* STEP 4: BACKGROUND & ASSESSMENT */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* SECTION 6: PATIENT BACKGROUND */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Section 6: Patient Background
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Drug Allergy History</label>
                  <input type="text" value={drugAllergyHistory} onChange={(e) => setDrugAllergyHistory(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-rose-600 dark:text-rose-400" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Previous ADR History</label>
                  <input type="text" value={previousAdrHistory} onChange={(e) => setPreviousAdrHistory(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pregnancy / Lactation Status</label>
                  <input type="text" value={pregnancyLactationStatus} onChange={(e) => setPregnancyLactationStatus(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Renal Status</label>
                  <input type="text" value={renalStatus} onChange={(e) => setRenalStatus(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hepatic Status</label>
                  <input type="text" value={hepaticStatus} onChange={(e) => setHepaticStatus(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lifestyle Factors</label>
                  <input type="text" value={lifestyleFactors} onChange={(e) => setLifestyleFactors(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold" />
                </div>
              </div>
            </div>

            {/* SECTION 7: REACTION ASSESSMENT */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Section 7: Reaction Assessment & Causality
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reaction Severity *</label>
                  <select value={reactionSeverity} onChange={(e) => setReactionSeverity(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reaction Seriousness *</label>
                  <select value={reactionSeriousness} onChange={(e) => setReactionSeriousness(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                    <option value="Non-serious">Non-serious</option>
                    <option value="Death">Death</option>
                    <option value="Life-threatening">Life-threatening</option>
                    <option value="Hospitalization-Initial/Prolonged">Hospitalization-Initial/Prolonged</option>
                    <option value="Disability">Disability</option>
                    <option value="Congenital Anomaly">Congenital Anomaly</option>
                    <option value="Other Medically Important">Other Medically Important</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Causality Opinion *</label>
                  <select value={initialCausalityOpinion} onChange={(e) => setInitialCausalityOpinion(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-indigo-600 dark:text-indigo-400">
                    <option value="Certain">Certain</option>
                    <option value="Probable/Likely">Probable / Likely</option>
                    <option value="Possible">Possible</option>
                    <option value="Unlikely">Unlikely</option>
                    <option value="Unclassified">Unclassified</option>
                    <option value="Unassessable">Unassessable</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Action Taken on Suspected Drug</label>
                  <select value={actionTakenOnSuspectedDrug} onChange={(e) => setActionTakenOnSuspectedDrug(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                    <option value="Withdrawn">Drug Withdrawn</option>
                    <option value="Dose Reduced">Dose Reduced</option>
                    <option value="Dose Increased">Dose Increased</option>
                    <option value="Dose Unchanged">Dose Unchanged</option>
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dechallenge Information</label>
                  <input type="text" value={dechallengeInformation} onChange={(e) => setDechallengeInformation(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rechallenge Information</label>
                  <input type="text" value={rechallengeInformation} onChange={(e) => setRechallengeInformation(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 5: ATTACHMENTS & REVIEW */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* SECTION 8: SUPPORTING DOCUMENTS */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Section 8: Supporting Documents (Upload Max 5 Files)
              </h3>

              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-center space-y-2">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Upload Lab Reports, Prescriptions, Investigation Reports, or Clinical Images
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="adr-file-upload"
                />
                <label
                  htmlFor="adr-file-upload"
                  className="inline-block px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Choose Files to Upload
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Attached Documents ({attachments.length}/5):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachments.map((att, index) => (
                      <div key={index} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">📎 {att.file_name}</span>
                        <button type="button" onClick={() => handleRemoveAttachment(index)} className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 9: REVIEW INFORMATION */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Section 9: Review & Student Remarks
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Student Remarks</label>
                  <textarea rows={2} value={studentRemarks} onChange={(e) => setStudentRemarks(e.target.value)} placeholder="Student notes for preceptor..." className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Preceptor Review / Comments (Read-Only)</label>
                  <textarea rows={2} readOnly value={preceptorReview || 'Pending faculty evaluation.'} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono italic" />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* WIZARD NAVIGATION BAR */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            disabled={currentStep === 1}
            className="h-[44px] px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(prev + 1, 5))}
                className="h-[44px] px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSaveADR('Submitted')}
                disabled={saving}
                className="h-[44px] px-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting ADR...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit to Preceptor</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ADR SUMMARY PREVIEW MODAL */}
      {isPreviewOpen && (
        <ADRReportPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          clinicalCase={clinicalCase}
          student={student}
          report={{
            adr_number: adrNumber,
            reporting_date: reportingDate,
            reported_by_student_name: student.full_name,
            assigned_preceptor_name: assignedPreceptorName,
            approval_status: approvalStatus,
            patient_initials: patientInitials,
            hospital_reg_number: hospitalRegNumber,
            age,
            gender,
            weight,
            department,
            ward,
            primary_diagnosis: primaryDiagnosis,
            reaction_title: reactionTitle,
            reaction_category: reactionCategory,
            reaction_description: reactionDescription,
            reaction_started_at: reactionStartedAt,
            reaction_ended_at: reactionEndedAt,
            reaction_duration: reactionDuration,
            clinical_management_provided: clinicalManagementProvided,
            current_patient_condition: currentPatientCondition,
            drug_allergy_history: drugAllergyHistory,
            previous_adr_history: previousAdrHistory,
            pregnancy_lactation_status: pregnancyLactationStatus,
            renal_status: renalStatus,
            hepatic_status: hepaticStatus,
            reaction_severity: reactionSeverity,
            reaction_seriousness: reactionSeriousness,
            patient_outcome: patientOutcome,
            action_taken_on_suspected_drug: actionTakenOnSuspectedDrug,
            initial_causality_opinion: initialCausalityOpinion
          }}
          suspectedMeds={suspectedMeds}
          concomitantMeds={concomitantMeds}
          attachments={attachments}
        />
      )}

    </div>
  );
};
