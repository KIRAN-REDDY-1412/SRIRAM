import React, { useState, useEffect } from 'react';
import { UserCheck, Stethoscope, Activity, FileText, FlaskConical, Pill, Save, Eye, Send, ArrowLeft, Plus, Trash2, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { fetchPatientProfileByCaseIdFromSupabase, saveOrUpdatePatientProfileInSupabase, saveLabInvestigationsInSupabase, savePrescribedDrugsInSupabase } from '../../services/supabaseService';
import { PatientProfilePDFPreviewModal } from './PatientProfilePDFPreviewModal';

const DEFAULT_LAB_PARAMETERS = [
  // Haematology
  { category: 'Haematological Patterns', parameter_name: 'Hb %', reference_range: '11-16.5 %', unit: '%', test_value: '' },
  { category: 'Haematological Patterns', parameter_name: 'RBC Count', reference_range: '3.8-5.8 cells/mm', unit: 'cells/mm', test_value: '' },
  { category: 'Haematological Patterns', parameter_name: 'WBC Count', reference_range: '4000-10000 cells/mm', unit: 'cells/mm', test_value: '' },
  { category: 'Haematological Patterns', parameter_name: 'Neutrophils', reference_range: '40-70 %', unit: '%', test_value: '' },
  { category: 'Haematological Patterns', parameter_name: 'Lymphocytes', reference_range: '15-30 %', unit: '%', test_value: '' },
  { category: 'Haematological Patterns', parameter_name: 'Platelets', reference_range: '1.5-4 lakhs/cell', unit: 'lakhs/cell', test_value: '' },
  
  // Blood Glucose
  { category: 'Blood Glucose', parameter_name: 'FBS', reference_range: '70-100 mg/dl', unit: 'mg/dl', test_value: '' },
  { category: 'Blood Glucose', parameter_name: 'RBS', reference_range: '70-140 mg/dl', unit: 'mg/dl', test_value: '' },
  { category: 'Blood Glucose', parameter_name: 'PPBS', reference_range: '110-160 mg/dl', unit: 'mg/dl', test_value: '' },

  // Renal & Liver
  { category: 'Renal Function Tests', parameter_name: 'Serum Creatinine', reference_range: '0.6-1.1 mg%', unit: 'mg%', test_value: '' },
  { category: 'Renal Function Tests', parameter_name: 'Blood Urea', reference_range: '3-8 mg%', unit: 'mg%', test_value: '' },
  { category: 'Liver Function Tests', parameter_name: 'SGOT (AST)', reference_range: '6-38 u/l', unit: 'u/l', test_value: '' },
  { category: 'Liver Function Tests', parameter_name: 'SGPT (ALT)', reference_range: '6-38 u/l', unit: 'u/l', test_value: '' },
  { category: 'Electrolytes', parameter_name: 'Serum Sodium (Na+)', reference_range: '135-145 meq/l', unit: 'meq/l', test_value: '' },
  { category: 'Electrolytes', parameter_name: 'Serum Potassium (K+)', reference_range: '3.5-5.5 meq/l', unit: 'meq/l', test_value: '' }
];

export const PatientProfileFormView = ({ clinicalCase, student, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // 1. Patient Details
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [ipNo, setIpNo] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState('');
  const [ward, setWard] = useState('');
  const [department, setDepartment] = useState('');
  const [doa, setDoa] = useState('');
  const [doc, setDoc] = useState('');
  const [dod, setDod] = useState('');
  const [physician, setPhysician] = useState('');

  // 2. Medical Histories
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [pastMedicalHistory, setPastMedicalHistory] = useState('');
  const [pastMedicationHistory, setPastMedicationHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  // 3. Social & Allergy History
  const [smokerPackDay, setSmokerPackDay] = useState('');
  const [smokerDuration, setSmokerDuration] = useState('');
  const [alcoholicAmountDay, setAlcoholicAmountDay] = useState('');
  const [alcoholicDuration, setAlcoholicDuration] = useState('');
  const [allergyFood, setAllergyFood] = useState('');
  const [allergyDrugs, setAllergyDrugs] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('Single');

  // 4. Physical Examination
  const [cyanosis, setCyanosis] = useState('Absent');
  const [icterus, setIcterus] = useState('Absent');
  const [pallor, setPallor] = useState('Absent');
  const [cvs, setCvs] = useState('');
  const [gi, setGi] = useState('');
  const [rs, setRs] = useState('');
  const [cns, setCns] = useState('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');

  // 5. Vital Signs (Array)
  const [vitalSigns, setVitalSigns] = useState([
    { date: new Date().toISOString().split('T')[0], temp: '', bp: '', pr: '', rr: '', spo2: '' }
  ]);

  // 6. Dynamic Lab Investigations (Array)
  const [labInvestigations, setLabInvestigations] = useState(DEFAULT_LAB_PARAMETERS);

  // 7. Other & Final Diagnosis
  const [otherInvestigations, setOtherInvestigations] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');

  // 8. Dynamic Prescribed Drugs (Array)
  const [prescribedDrugs, setPrescribedDrugs] = useState([
    { s_no: 1, trade_name: '', generic_name: '', route_of_admin: 'Oral', dose: '', frequency: 'OD', start_date: '', stop_date: '' }
  ]);

  // 9. Discharge Summary
  const [dischargeSummary, setDischargeSummary] = useState('');

  // Profile Status
  const [profileStatus, setProfileStatus] = useState('Draft');
  const [existingProfileId, setExistingProfileId] = useState(null);

  // PDF Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load Existing Profile if available
  useEffect(() => {
    const loadProfileData = async () => {
      if (!clinicalCase) return;
      setLoading(true);

      // Pre-fill from clinicalCase defaults if empty
      setWard(clinicalCase.ward_unit || '');
      setDepartment(clinicalCase.department || '');
      setDoa(clinicalCase.date_of_admission || '');
      setDoc(clinicalCase.date_of_collection || '');

      const res = await fetchPatientProfileByCaseIdFromSupabase(clinicalCase.id);
      if (res.success && res.profile) {
        const p = res.profile;
        setExistingProfileId(p.id);
        setPatientName(p.patient_name || '');
        setAge(p.age || '');
        setGender(p.gender || 'Male');
        setIpNo(p.ip_no || '');
        setHeight(p.height || '');
        setWeight(p.weight || '');
        setBmi(p.bmi || '');
        setWard(p.ward || clinicalCase.ward_unit || '');
        setDepartment(p.department || clinicalCase.department || '');
        setDoa(p.doa || clinicalCase.date_of_admission || '');
        setDoc(p.doc || clinicalCase.date_of_collection || '');
        setDod(p.dod || '');
        setPhysician(p.physician || '');

        setChiefComplaints(p.chief_complaints || '');
        setPastMedicalHistory(p.past_medical_history || '');
        setPastMedicationHistory(p.past_medication_history || '');
        setFamilyHistory(p.family_history || '');

        setSmokerPackDay(p.smoker_pack_day || '');
        setSmokerDuration(p.smoker_duration || '');
        setAlcoholicAmountDay(p.alcoholic_amount_day || '');
        setAlcoholicDuration(p.alcoholic_duration || '');
        setAllergyFood(p.allergy_food || '');
        setAllergyDrugs(p.allergy_drugs || '');
        setMaritalStatus(p.marital_status || 'Single');

        setCyanosis(p.cyanosis || 'Absent');
        setIcterus(p.icterus || 'Absent');
        setPallor(p.pallor || 'Absent');
        setCvs(p.cvs || '');
        setGi(p.gi || '');
        setRs(p.rs || '');
        setCns(p.cns || '');
        setProvisionalDiagnosis(p.provisional_diagnosis || '');

        if (p.vital_signs && p.vital_signs.length > 0) setVitalSigns(p.vital_signs);
        setOtherInvestigations(p.other_investigations || '');
        setFinalDiagnosis(p.final_diagnosis || '');
        setDischargeSummary(p.discharge_summary || '');
        setProfileStatus(p.status || 'Draft');

        if (res.labInvestigations && res.labInvestigations.length > 0) {
          setLabInvestigations(res.labInvestigations);
        }

        if (res.prescribedDrugs && res.prescribedDrugs.length > 0) {
          setPrescribedDrugs(res.prescribedDrugs);
        }
      }

      setLoading(false);
    };

    loadProfileData();
  }, [clinicalCase]);

  // Auto-calculate BMI from height (cm) and weight (kg)
  const handleWeightHeightChange = (w, h) => {
    setWeight(w);
    setHeight(h);
    if (w && h && !isNaN(w) && !isNaN(h) && parseFloat(h) > 0) {
      const heightInMeters = parseFloat(h) / 100;
      const calculatedBmi = (parseFloat(w) / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(calculatedBmi);
    }
  };

  // Dynamic Vital Signs Handlers
  const handleAddVitalRow = () => {
    setVitalSigns([...vitalSigns, { date: new Date().toISOString().split('T')[0], temp: '', bp: '', pr: '', rr: '', spo2: '' }]);
  };

  const handleRemoveVitalRow = (idx) => {
    setVitalSigns(vitalSigns.filter((_, i) => i !== idx));
  };

  // Dynamic Lab Investigations Handlers
  const handleAddLabRow = () => {
    setLabInvestigations([...labInvestigations, { category: 'General', parameter_name: '', reference_range: '', test_date: new Date().toISOString().split('T')[0], test_value: '', unit: '' }]);
  };

  const handleRemoveLabRow = (idx) => {
    setLabInvestigations(labInvestigations.filter((_, i) => i !== idx));
  };

  // Dynamic Prescribed Drugs Handlers
  const handleAddDrugRow = () => {
    setPrescribedDrugs([...prescribedDrugs, { s_no: prescribedDrugs.length + 1, trade_name: '', generic_name: '', route_of_admin: 'Oral', dose: '', frequency: 'OD', start_date: '', stop_date: '' }]);
  };

  const handleRemoveDrugRow = (idx) => {
    setPrescribedDrugs(prescribedDrugs.filter((_, i) => i !== idx));
  };

  // Save / Update Handler
  const handleSaveProfile = async (newStatus = 'Draft') => {
    setFormError('');
    setSaveSuccess('');

    if (!patientName.trim()) {
      setFormError('Patient Name is required.');
      return;
    }

    setSaving(true);

    const payload = {
      clinical_case_id: clinicalCase.id,
      student_id: student.id,
      college_id: student.college_id,
      patient_name: patientName.trim(),
      age,
      gender,
      ip_no: ipNo,
      height,
      weight,
      bmi,
      ward,
      department,
      doa: doa || null,
      doc: doc || null,
      dod: dod || null,
      physician,
      chief_complaints: chiefComplaints,
      past_medical_history: pastMedicalHistory,
      past_medication_history: pastMedicationHistory,
      family_history: familyHistory,
      smoker_pack_day: smokerPackDay,
      smoker_duration: smokerDuration,
      alcoholic_amount_day: alcoholicAmountDay,
      alcoholic_duration: alcoholicDuration,
      allergy_food: allergyFood,
      allergy_drugs: allergyDrugs,
      marital_status: maritalStatus,
      cyanosis,
      icterus,
      pallor,
      cvs,
      gi,
      rs,
      cns,
      provisional_diagnosis: provisionalDiagnosis,
      vital_signs: vitalSigns,
      other_investigations: otherInvestigations,
      final_diagnosis: finalDiagnosis,
      discharge_summary: dischargeSummary,
      status: newStatus
    };

    // Save Patient Profile
    const profRes = await saveOrUpdatePatientProfileInSupabase(payload);

    if (!profRes.success) {
      setSaving(false);
      setFormError(profRes.error || 'Failed to save Patient Profile.');
      return;
    }

    const savedProfileId = profRes.profile.id;

    // Save Child Tables
    const activeLabRecords = labInvestigations.filter(l => l.parameter_name && l.test_value);
    const activeDrugRecords = prescribedDrugs.filter(d => d.trade_name || d.generic_name);

    await Promise.all([
      saveLabInvestigationsInSupabase(savedProfileId, activeLabRecords),
      savePrescribedDrugsInSupabase(savedProfileId, activeDrugRecords)
    ]);

    setSaving(false);
    setProfileStatus(newStatus);
    setSaveSuccess(newStatus === 'Submitted' ? 'Patient Profile submitted successfully!' : 'Patient Profile saved as Draft.');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  if (loading) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-500">Loading Patient Documentation Form...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      
      {/* TOP BAR */}
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
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Patient Documentation Form (Patient Profile)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Case ID: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{clinicalCase.case_id}</strong> • Student: <strong className="text-slate-800 dark:text-slate-200">{student?.full_name}</strong>
            </p>
          </div>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>Preview Form PDF</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveProfile('Draft')}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{existingProfileId ? 'Update Draft' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveProfile('Submitted')}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Submit Profile</span>
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

      {/* 1. PATIENT DETAILS SECTION */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          1. Patient Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Patient Name *</label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Full Name of Patient"
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Age / Sex *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age (e.g. 45 Yrs)"
                className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">I.P No *</label>
            <input
              type="text"
              value={ipNo}
              onChange={(e) => setIpNo(e.target.value)}
              placeholder="In-Patient No."
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Height (cm) / Weight (kg)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={height}
                onChange={(e) => handleWeightHeightChange(weight, e.target.value)}
                placeholder="Ht (cm)"
                className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={weight}
                onChange={(e) => handleWeightHeightChange(e.target.value, height)}
                placeholder="Wt (kg)"
                className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">BMI (kg/m²)</label>
            <input
              type="text"
              readOnly
              value={bmi}
              placeholder="Auto calculated BMI"
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Attending Physician</label>
            <input
              type="text"
              value={physician}
              onChange={(e) => setPhysician(e.target.value)}
              placeholder="Doctor / Physician Name"
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ward / Department</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="Ward"
                className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Dept"
                className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Admission (DOA)</label>
            <input
              type="date"
              value={doa}
              onChange={(e) => setDoa(e.target.value)}
              className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Discharge (DOD)</label>
            <input
              type="date"
              value={dod}
              onChange={(e) => setDod(e.target.value)}
              className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* 2. CHIEF COMPLAINTS & HISTORIES */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          2. Chief Complaints & Medical Histories
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chief Complaints *</label>
            <textarea
              rows={3}
              value={chiefComplaints}
              onChange={(e) => setChiefComplaints(e.target.value)}
              placeholder="Presenting complaints with duration (e.g. Fever x 3 days, Shortness of breath)..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Past Medical History</label>
            <textarea
              rows={3}
              value={pastMedicalHistory}
              onChange={(e) => setPastMedicalHistory(e.target.value)}
              placeholder="Diabetes Mellitus, Hypertension, Asthma, T2DM x 5 yrs..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Past Medication History</label>
            <textarea
              rows={3}
              value={pastMedicationHistory}
              onChange={(e) => setPastMedicationHistory(e.target.value)}
              placeholder="Tab. Metformin 500mg BD, Tab. Telmisartan 40mg OD..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Family Medical History</label>
            <textarea
              rows={3}
              value={familyHistory}
              onChange={(e) => setFamilyHistory(e.target.value)}
              placeholder="History of HTN in father, T2DM in mother..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 3. SOCIAL & ALLERGY HISTORY */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          3. Social History & Allergies
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Smoker History</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={smokerPackDay}
                onChange={(e) => setSmokerPackDay(e.target.value)}
                placeholder="Pack/day"
                className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={smokerDuration}
                onChange={(e) => setSmokerDuration(e.target.value)}
                placeholder="Duration (yrs)"
                className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alcoholic History</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={alcoholicAmountDay}
                onChange={(e) => setAlcoholicAmountDay(e.target.value)}
                placeholder="Amount/day"
                className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={alcoholicDuration}
                onChange={(e) => setAlcoholicDuration(e.target.value)}
                placeholder="Duration (yrs)"
                className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Marital Status</label>
            <select
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value)}
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Food Allergies</label>
            <input
              type="text"
              value={allergyFood}
              onChange={(e) => setAllergyFood(e.target.value)}
              placeholder="e.g. Nuts, Dairy, None"
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Drug Allergies</label>
            <input
              type="text"
              value={allergyDrugs}
              onChange={(e) => setAllergyDrugs(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa drugs, Aspirin"
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-rose-600 dark:text-rose-400"
            />
          </div>
        </div>
      </div>

      {/* 4. PHYSICAL EXAMINATION & VITAL SIGNS */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          4. Physical Examination & Vital Signs
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cyanosis</label>
            <select
              value={cyanosis}
              onChange={(e) => setCyanosis(e.target.value)}
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            >
              <option value="Absent">Absent</option>
              <option value="Present">Present</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Icterus</label>
            <select
              value={icterus}
              onChange={(e) => setIcterus(e.target.value)}
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            >
              <option value="Absent">Absent</option>
              <option value="Present">Present</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pallor</label>
            <select
              value={pallor}
              onChange={(e) => setPallor(e.target.value)}
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            >
              <option value="Absent">Absent</option>
              <option value="Present">Present</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">CVS (Cardiovascular)</label>
            <input type="text" value={cvs} onChange={(e) => setCvs(e.target.value)} placeholder="S1 S2 heard, No murmur" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GI (Gastrointestinal)</label>
            <input type="text" value={gi} onChange={(e) => setGi(e.target.value)} placeholder="Soft, Non-tender" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">RS (Respiratory)</label>
            <input type="text" value={rs} onChange={(e) => setRs(e.target.value)} placeholder="NVBS, No wheeze" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div className="sm:col-span-3">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Provisional Diagnosis *</label>
            <input type="text" value={provisionalDiagnosis} onChange={(e) => setProvisionalDiagnosis(e.target.value)} placeholder="Provisional clinical assessment..." className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold" />
          </div>
        </div>

        {/* DYNAMIC VITAL SIGNS TABLE */}
        <div className="pt-2">
          <div className="flex items-center justify-between pb-2">
            <strong className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase">Vital Signs Log (Multiple Daily Readings)</strong>
            <button type="button" onClick={handleAddVitalRow} className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
              <Plus className="w-3.5 h-3.5" /> Add Vital Entry
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">TEMP (°F)</th>
                  <th className="py-2.5 px-3">BP (mmHg)</th>
                  <th className="py-2.5 px-3">PR (bpm)</th>
                  <th className="py-2.5 px-3">RR (cpm)</th>
                  <th className="py-2.5 px-3">SPO2 (%)</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {vitalSigns.map((row, i) => (
                  <tr key={i}>
                    <td className="py-2 px-2"><input type="date" value={row.date} onChange={(e) => { const newV = [...vitalSigns]; newV[i].date = e.target.value; setVitalSigns(newV); }} className="w-full h-9 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 font-mono" /></td>
                    <td className="py-2 px-2"><input type="text" placeholder="98.6" value={row.temp} onChange={(e) => { const newV = [...vitalSigns]; newV[i].temp = e.target.value; setVitalSigns(newV); }} className="w-full h-9 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 font-mono" /></td>
                    <td className="py-2 px-2"><input type="text" placeholder="120/80" value={row.bp} onChange={(e) => { const newV = [...vitalSigns]; newV[i].bp = e.target.value; setVitalSigns(newV); }} className="w-full h-9 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 font-mono" /></td>
                    <td className="py-2 px-2"><input type="text" placeholder="72" value={row.pr} onChange={(e) => { const newV = [...vitalSigns]; newV[i].pr = e.target.value; setVitalSigns(newV); }} className="w-full h-9 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 font-mono" /></td>
                    <td className="py-2 px-2"><input type="text" placeholder="18" value={row.rr} onChange={(e) => { const newV = [...vitalSigns]; newV[i].rr = e.target.value; setVitalSigns(newV); }} className="w-full h-9 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 font-mono" /></td>
                    <td className="py-2 px-2"><input type="text" placeholder="98" value={row.spo2} onChange={(e) => { const newV = [...vitalSigns]; newV[i].spo2 = e.target.value; setVitalSigns(newV); }} className="w-full h-9 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 font-mono font-bold text-emerald-600" /></td>
                    <td className="py-2 px-2 text-right">
                      {vitalSigns.length > 1 && (
                        <button type="button" onClick={() => handleRemoveVitalRow(i)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. LABORATORY INVESTIGATIONS (CHILD TABLE) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            5. Laboratory Investigations (Child Table)
          </h3>

          <button type="button" onClick={handleAddLabRow} className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
            <Plus className="w-3.5 h-3.5" /> Add Lab Parameter
          </button>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto pr-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Parameter Name</th>
                <th className="py-2.5 px-3">Reference Range</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Test Value</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {labInvestigations.map((row, i) => (
                <tr key={i}>
                  <td className="py-1.5 px-2"><input type="text" value={row.category} onChange={(e) => { const newL = [...labInvestigations]; newL[i].category = e.target.value; setLabInvestigations(newL); }} className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 font-semibold" /></td>
                  <td className="py-1.5 px-2"><input type="text" value={row.parameter_name} onChange={(e) => { const newL = [...labInvestigations]; newL[i].parameter_name = e.target.value; setLabInvestigations(newL); }} className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 font-bold" /></td>
                  <td className="py-1.5 px-2"><input type="text" value={row.reference_range} onChange={(e) => { const newL = [...labInvestigations]; newL[i].reference_range = e.target.value; setLabInvestigations(newL); }} className="w-full h-8 px-2 text-[11px] font-mono rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500" /></td>
                  <td className="py-1.5 px-2"><input type="date" value={row.test_date} onChange={(e) => { const newL = [...labInvestigations]; newL[i].test_date = e.target.value; setLabInvestigations(newL); }} className="w-full h-8 px-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800" /></td>
                  <td className="py-1.5 px-2"><input type="text" placeholder="Value (e.g. 12.5)" value={row.test_value} onChange={(e) => { const newL = [...labInvestigations]; newL[i].test_value = e.target.value; setLabInvestigations(newL); }} className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 font-extrabold font-mono text-emerald-600 dark:text-emerald-400" /></td>
                  <td className="py-1.5 px-2 text-right">
                    <button type="button" onClick={() => handleRemoveLabRow(i)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. OTHER INVESTIGATIONS & FINAL DIAGNOSIS */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          6. Other Investigations & Final Diagnosis
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Other Investigations (ECG, X-Ray, CT Scan, Ultrasound)</label>
            <textarea
              rows={3}
              value={otherInvestigations}
              onChange={(e) => setOtherInvestigations(e.target.value)}
              placeholder="ECG shows sinus tachycardia, Chest X-ray reveals right lower lobe consolidation..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Final Diagnosis *</label>
            <textarea
              rows={3}
              value={finalDiagnosis}
              onChange={(e) => setFinalDiagnosis(e.target.value)}
              placeholder="Confirmed clinical final diagnosis..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>
      </div>

      {/* 7. DRUGS PRESCRIBED (CHILD TABLE) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            7. Drugs Prescribed (Child Table)
          </h3>

          <button type="button" onClick={handleAddDrugRow} className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
            <Plus className="w-3.5 h-3.5" /> Add Drug Row
          </button>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto pr-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] sticky top-0">
              <tr>
                <th className="py-2.5 px-2 text-center w-10">S.No</th>
                <th className="py-2.5 px-3">Trade Name</th>
                <th className="py-2.5 px-3">Generic Name</th>
                <th className="py-2.5 px-3">R.O.A</th>
                <th className="py-2.5 px-3">Dose</th>
                <th className="py-2.5 px-3">FRQ</th>
                <th className="py-2.5 px-3">Start Date</th>
                <th className="py-2.5 px-3">Stop Date</th>
                <th className="py-2.5 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {prescribedDrugs.map((row, i) => (
                <tr key={i}>
                  <td className="py-1.5 px-2 text-center font-bold font-mono">{i + 1}</td>
                  <td className="py-1.5 px-2"><input type="text" placeholder="e.g. Augmentin" value={row.trade_name} onChange={(e) => { const newD = [...prescribedDrugs]; newD[i].trade_name = e.target.value; setPrescribedDrugs(newD); }} className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 font-bold" /></td>
                  <td className="py-1.5 px-2"><input type="text" placeholder="Amoxicillin + Clav" value={row.generic_name} onChange={(e) => { const newD = [...prescribedDrugs]; newD[i].generic_name = e.target.value; setPrescribedDrugs(newD); }} className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 italic" /></td>
                  <td className="py-1.5 px-2">
                    <select value={row.route_of_admin} onChange={(e) => { const newD = [...prescribedDrugs]; newD[i].route_of_admin = e.target.value; setPrescribedDrugs(newD); }} className="w-full h-8 px-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
                      <option value="Oral">Oral</option>
                      <option value="IV">IV</option>
                      <option value="IM">IM</option>
                      <option value="SC">SC</option>
                      <option value="Topical">Topical</option>
                      <option value="Inhalation">Inhalation</option>
                    </select>
                  </td>
                  <td className="py-1.5 px-2"><input type="text" placeholder="625mg" value={row.dose} onChange={(e) => { const newD = [...prescribedDrugs]; newD[i].dose = e.target.value; setPrescribedDrugs(newD); }} className="w-full h-8 px-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 font-bold" /></td>
                  <td className="py-1.5 px-2">
                    <select value={row.frequency} onChange={(e) => { const newD = [...prescribedDrugs]; newD[i].frequency = e.target.value; setPrescribedDrugs(newD); }} className="w-full h-8 px-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 font-bold">
                      <option value="OD">OD (1x)</option>
                      <option value="BD">BD (2x)</option>
                      <option value="TDS">TDS (3x)</option>
                      <option value="QID">QID (4x)</option>
                      <option value="STAT">STAT</option>
                      <option value="PRN">PRN</option>
                    </select>
                  </td>
                  <td className="py-1.5 px-2"><input type="date" value={row.start_date} onChange={(e) => { const newD = [...prescribedDrugs]; newD[i].start_date = e.target.value; setPrescribedDrugs(newD); }} className="w-full h-8 px-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800" /></td>
                  <td className="py-1.5 px-2"><input type="date" value={row.stop_date} onChange={(e) => { const newD = [...prescribedDrugs]; newD[i].stop_date = e.target.value; setPrescribedDrugs(newD); }} className="w-full h-8 px-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800" /></td>
                  <td className="py-1.5 px-2 text-right">
                    {prescribedDrugs.length > 1 && (
                      <button type="button" onClick={() => handleRemoveDrugRow(i)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. DISCHARGE SUMMARY */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          8. Discharge Summary
        </h3>

        <div>
          <textarea
            rows={4}
            value={dischargeSummary}
            onChange={(e) => setDischargeSummary(e.target.value)}
            placeholder="Clinical course during hospital stay, treatment outcome, discharge advice and medication..."
            className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="h-[48px] px-6 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
        >
          Cancel & Back
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="h-[48px] px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>Preview Form PDF</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveProfile('Draft')}
            disabled={saving}
            className="h-[48px] px-6 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveProfile('Submitted')}
            disabled={saving}
            className="h-[48px] px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Profile...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PDF PREVIEW MODAL */}
      {isPreviewOpen && (
        <PatientProfilePDFPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          clinicalCase={clinicalCase}
          student={student}
          profile={{
            patient_name: patientName,
            age,
            gender,
            ip_no: ipNo,
            height,
            weight,
            bmi,
            ward,
            department,
            doa,
            doc,
            dod,
            physician,
            chief_complaints: chiefComplaints,
            past_medical_history: pastMedicalHistory,
            past_medication_history: pastMedicationHistory,
            family_history: familyHistory,
            smoker_pack_day: smokerPackDay,
            smoker_duration: smokerDuration,
            alcoholic_amount_day: alcoholicAmountDay,
            alcoholic_duration: alcoholicDuration,
            allergy_food: allergyFood,
            allergy_drugs: allergyDrugs,
            marital_status: maritalStatus,
            cyanosis,
            icterus,
            pallor,
            cvs,
            gi,
            rs,
            cns,
            provisional_diagnosis: provisionalDiagnosis,
            vital_signs: vitalSigns,
            other_investigations: otherInvestigations,
            final_diagnosis: finalDiagnosis,
            discharge_summary: dischargeSummary
          }}
          labInvestigations={labInvestigations}
          prescribedDrugs={prescribedDrugs}
        />
      )}

    </div>
  );
};
