import React, { useState, useEffect } from 'react';
import { FileSearch, User, Clock, FileText, CheckSquare, Square, Save, Eye, Send, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, BookOpen, Layers, ShieldCheck, RefreshCw } from 'lucide-react';
import { fetchDrugInformationRequestByCaseIdFromSupabase, saveOrUpdateDrugInformationRequestInSupabase, fetchPatientProfileByCaseIdFromSupabase } from '../../services/supabaseService';
import { DrugInformationPDFPreviewModal } from './DrugInformationPDFPreviewModal';
import { InlineActionNotification } from '../common/InlineActionNotification';
import { useInlineNotification } from '../../hooks/useInlineNotification';

const QUESTION_CATEGORIES = [
  'Adverse Drug Reaction',
  'Dosage & Administration',
  'Choice of Drug / Therapeutics',
  'Drug Interaction',
  'Contraindications & Warnings',
  'Pharmacokinetics / Dosing in Renal-Hepatic Impairment',
  'Stability & Storage',
  'Pregnancy & Lactation Safety',
  'Drug Identification / Availability',
  'Toxicity & Poisoning Management',
  'Others'
];

export const DrugInformationFormView = ({ clinicalCase, student, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Inline Notification Hook
  const { notification: bottomNotify, showNotification: showBottomNotify, clearNotification: clearBottomNotify } = useInlineNotification();

  // 1. Session & Enquirer Details
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestTime, setRequestTime] = useState('11:00 AM');
  const [enquirerName, setEnquirerName] = useState('');
  const [designation, setDesignation] = useState('Resident Physician');
  const [phoneNo, setPhoneNo] = useState('');
  const [unitWard, setUnitWard] = useState('');
  const [professionalStatus, setProfessionalStatus] = useState('Physician');
  const [professionalStatusOther, setProfessionalStatusOther] = useState('');

  // 2. Request Details
  const [modeOfRequest, setModeOfRequest] = useState('Direct');
  const [answerNeeded, setAnswerNeeded] = useState('Within 2-4hrs');
  const [detailsOfEnquiry, setDetailsOfEnquiry] = useState('');
  const [questionCategory, setQuestionCategory] = useState('Dosage & Administration');
  const [purposeOfEnquiry, setPurposeOfEnquiry] = useState('Better patient care');
  const [purposeOther, setPurposeOther] = useState('');

  // 3. Patient Details (Background Information)
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('M');
  const [weightKg, setWeightKg] = useState('');
  const [allergies, setAllergies] = useState('None');
  const [currentMedicalProblem, setCurrentMedicalProblem] = useState('');
  const [isPregnantLactating, setIsPregnantLactating] = useState(false);
  const [pregnancyLactationDetails, setPregnancyLactationDetails] = useState('');
  const [otherInvestigations, setOtherInvestigations] = useState('');
  const [drugTherapy, setDrugTherapy] = useState('');

  // 4. Response Delivery Metadata & Response
  const [answerGivenTimeframe, setAnswerGivenTimeframe] = useState('Within 2-4hrs');
  const [reasonForDelay, setReasonForDelay] = useState('');
  const [modeOfReply, setModeOfReply] = useState('Written');
  const [informationProvided, setInformationProvided] = useState('');

  // 5. References
  const [refTextbooks, setRefTextbooks] = useState('Goodman & Gilman’s Pharmacological Basis of Therapeutics (14th Ed)');
  const [refJournals, setRefJournals] = useState('');
  const [refMicromedex, setRefMicromedex] = useState('Micromedex 2.0 Drug Interactions Database');
  const [refClinirex, setRefClinirex] = useState('');
  const [refIdis, setRefIdis] = useState('');
  const [refWebsite, setRefWebsite] = useState('https://www.ncbi.nlm.nih.gov/pubmed');
  const [refOthers, setRefOthers] = useState('');

  // Meta
  const [status, setStatus] = useState('Draft');
  const [existingRequestId, setExistingRequestId] = useState(null);

  // PDF Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const loadDIRData = async () => {
      if (!clinicalCase || !clinicalCase.id) {
        setLoading(false);
        return;
      }
      setLoading(true);

      // Pre-fill defaults from clinicalCase
      setUnitWard(clinicalCase.ward_unit || '');
      setEnquirerName(clinicalCase.hospital_name ? `Dr. On-Duty (${clinicalCase.department})` : '');

      try {
        const [dirRes, profileRes] = await Promise.all([
          fetchDrugInformationRequestByCaseIdFromSupabase(clinicalCase.id),
          fetchPatientProfileByCaseIdFromSupabase(clinicalCase.id)
        ]);

        if (profileRes.success && profileRes.profile) {
          const p = profileRes.profile;
          setAge(p.age ? p.age.toString() : '');
          setSex(p.gender === 'Female' ? 'F' : p.gender === 'Male' ? 'M' : p.gender || 'M');
          setWeightKg(p.weight || '');
          setUnitWard(p.ward || p.ward_unit || clinicalCase.ward_unit || '');
          setAllergies(p.allergies || (p.allergy_drugs || p.allergy_food ? `Drugs: ${p.allergy_drugs || 'None'}, Food: ${p.allergy_food || 'None'}` : 'None'));
          setCurrentMedicalProblem(p.final_diagnosis || p.provisional_diagnosis || '');
        }

        if (dirRes.success && dirRes.request) {
          const item = dirRes.request;
          setExistingRequestId(item.id);
          setRequestDate(item.request_date || new Date().toISOString().split('T')[0]);
          setRequestTime(item.request_time || '11:00 AM');
          setEnquirerName(item.enquirer_name || '');
          setDesignation(item.designation || '');
          setPhoneNo(item.phone_no || '');
          setUnitWard(item.unit_ward || clinicalCase.ward_unit || '');
          setProfessionalStatus(item.professional_status || 'Physician');
          setProfessionalStatusOther(item.professional_status_other || '');

          setModeOfRequest(item.mode_of_request || 'Direct');
          setAnswerNeeded(item.answer_needed || 'Within 2-4hrs');
          setDetailsOfEnquiry(item.details_of_enquiry || '');
          setQuestionCategory(item.question_category || 'Dosage & Administration');
          setPurposeOfEnquiry(item.purpose_of_enquiry || 'Better patient care');
          setPurposeOther(item.purpose_other || '');

          setAge(item.age || '');
          setSex(item.sex || 'M');
          setWeightKg(item.weight_kg || '');
          setAllergies(item.allergies || 'None');
          setCurrentMedicalProblem(item.current_medical_problem || '');
          setIsPregnantLactating(Boolean(item.is_pregnant_lactating));
          setPregnancyLactationDetails(item.pregnancy_lactation_details || '');
          setOtherInvestigations(item.other_investigations || '');
          setDrugTherapy(item.drug_therapy || '');

          setAnswerGivenTimeframe(item.answer_given_timeframe || 'Within 2-4hrs');
          setReasonForDelay(item.reason_for_delay || '');
          setModeOfReply(item.mode_of_reply || 'Written');
          setInformationProvided(item.information_provided || '');

          setRefTextbooks(item.ref_textbooks || '');
          setRefJournals(item.ref_journals || '');
          setRefMicromedex(item.ref_micromedex || '');
          setRefClinirex(item.ref_clinirex || '');
          setRefIdis(item.ref_idis || '');
          setRefWebsite(item.ref_website || '');
          setRefOthers(item.ref_others || '');

          setStatus(item.status || 'Draft');
        }
      } catch (err) {
        console.error('Error loading DIR data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDIRData();
  }, [clinicalCase]);

  const handleSaveRequest = async (newStatus = 'Draft') => {
    clearBottomNotify();

    if (newStatus === 'Submitted') {
      if (!enquirerName.trim()) {
        showBottomNotify({ type: 'error', message: '✖ Please enter Enquirer Name.' });
        return;
      }
      if (!detailsOfEnquiry.trim()) {
        showBottomNotify({ type: 'error', message: '✖ Please enter Details of Enquiry (Question).' });
        return;
      }
    }

    setSaving(true);

    const payload = {
      clinical_case_id: clinicalCase.id,
      student_id: student.id,
      college_id: student.college_id,
      request_date: requestDate,
      request_time: requestTime,
      enquirer_name: enquirerName.trim(),
      designation: designation.trim(),
      phone_no: phoneNo.trim(),
      unit_ward: unitWard,
      professional_status: professionalStatus,
      professional_status_other: professionalStatus === 'Other' ? professionalStatusOther.trim() : null,
      mode_of_request: modeOfRequest,
      answer_needed: answerNeeded,
      details_of_enquiry: detailsOfEnquiry.trim(),
      question_category: questionCategory,
      purpose_of_enquiry: purposeOfEnquiry,
      purpose_other: purposeOfEnquiry === 'Other' ? purposeOther.trim() : null,
      age,
      sex,
      weight_kg: weightKg,
      allergies,
      current_medical_problem: currentMedicalProblem.trim(),
      is_pregnant_lactating: isPregnantLactating,
      pregnancy_lactation_details: isPregnantLactating ? pregnancyLactationDetails.trim() : null,
      other_investigations: otherInvestigations.trim(),
      drug_therapy: drugTherapy.trim(),
      answer_given_timeframe: answerGivenTimeframe,
      reason_for_delay: reasonForDelay.trim(),
      mode_of_reply: modeOfReply,
      information_provided: informationProvided.trim(),
      ref_textbooks: refTextbooks.trim(),
      ref_journals: refJournals.trim(),
      ref_micromedex: refMicromedex.trim(),
      ref_clinirex: refClinirex.trim(),
      ref_idis: refIdis.trim(),
      ref_website: refWebsite.trim(),
      ref_others: refOthers.trim(),
      status: newStatus
    };

    const res = await saveOrUpdateDrugInformationRequestInSupabase(payload);
    setSaving(false);

    if (res.success) {
      setExistingRequestId(res.request.id);
      setStatus(newStatus);
      showBottomNotify({
        type: 'success',
        message: newStatus === 'Submitted' ? '✓ Drug Information Request submitted successfully!' : '✓ Drug Information Request saved as Draft.'
      });
    } else {
      showBottomNotify({
        type: 'error',
        message: res.error || '✖ Failed to save Drug Information Request documentation.'
      });
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-500">Loading Drug Information Request Form...</p>
      </div>
    );
  }

  if (!clinicalCase) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Clinical Case Selected</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Please select a case from My Clinical Cases list to document Drug Information Request.</p>
        <button onClick={onBack} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">Back to My Cases</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-12">
      
      {/* TOP HEADER */}
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
              <FileSearch className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Drug Information Request & Documentation Form</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Case ID: <strong className="font-mono text-cyan-600 dark:text-cyan-400">{clinicalCase.case_id}</strong> • Student: <strong className="text-slate-800 dark:text-slate-200">{student?.full_name}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 1. ENQUIRER & SESSION INFORMATION */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          1. Enquirer & Session Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Request Date *</label>
            <input
              type="date"
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Request Time</label>
            <input
              type="text"
              value={requestTime}
              onChange={(e) => setRequestTime(e.target.value)}
              placeholder="e.g. 11:00 AM"
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Name of Enquirer *</label>
            <input
              type="text"
              value={enquirerName}
              onChange={(e) => setEnquirerName(e.target.value)}
              placeholder="Enter name of enquirer"
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="Enter designation"
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              placeholder="Enter phone number"
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit / Ward</label>
            <input
              type="text"
              value={unitWard}
              onChange={(e) => setUnitWard(e.target.value)}
              placeholder="Enter unit/ward"
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Professional Status *</label>
            <select
              value={professionalStatus}
              onChange={(e) => setProfessionalStatus(e.target.value)}
              className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            >
              <option value="Physician">Physician</option>
              <option value="Post Graduate Resident">Post Graduate Resident</option>
              <option value="Nurse">Nurse</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Patient / Public">Patient / Public</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. ENQUIRY DETAILS */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          2. Details of Enquiry & Category
        </h3>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Question Category *</label>
              <select
                value={questionCategory}
                onChange={(e) => setQuestionCategory(e.target.value)}
                className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              >
                {QUESTION_CATEGORIES.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Timeframe Needed</label>
              <select
                value={answerNeeded}
                onChange={(e) => setAnswerNeeded(e.target.value)}
                className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              >
                <option value="Immediate / STAT">Immediate / STAT</option>
                <option value="Within 2-4hrs">Within 2-4hrs</option>
                <option value="Within 24hrs">Within 24hrs</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Details of Enquiry (Question) *</label>
            <textarea
              rows={3}
              required
              value={detailsOfEnquiry}
              onChange={(e) => setDetailsOfEnquiry(e.target.value)}
              placeholder="Enter details of enquiry"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>
      </div>

      {/* 3. PATIENT BACKGROUND INFORMATION */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            3. Patient Background Information
          </h3>
          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-200 dark:border-cyan-800 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Auto-Synced from Patient Profile
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Age / Sex</label>
            <div className="flex gap-2">
              <input type="text" readOnly value={age} placeholder="Age" className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono" />
              <input type="text" readOnly value={sex} placeholder="Sex" className="w-16 h-[44px] px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
            <input type="text" readOnly value={weightKg} placeholder="Weight" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono" />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Known Allergies</label>
            <input type="text" readOnly value={allergies} placeholder="Allergies" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 font-bold text-rose-600 dark:text-rose-400" />
          </div>

          <div className="sm:col-span-4">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Medical Problem / Diagnosis</label>
            <textarea rows={2} readOnly value={currentMedicalProblem} placeholder="Diagnosis" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 font-bold" />
          </div>
        </div>
      </div>

      {/* 4. RESPONSE / INFORMATION PROVIDED */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          4. Response Provided & References
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Information Provided (Answer)</label>
            <textarea
              rows={4}
              value={informationProvided}
              onChange={(e) => setInformationProvided(e.target.value)}
              placeholder="Enter response/information provided"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ref 1: Textbooks</label>
              <input type="text" value={refTextbooks} onChange={(e) => setRefTextbooks(e.target.value)} placeholder="Enter textbook reference" className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ref 2: Databases</label>
              <input type="text" value={refMicromedex} onChange={(e) => setRefMicromedex(e.target.value)} placeholder="Enter database reference" className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900" />
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE ACTION SECTION AT THE BOTTOM WITH INLINE NOTIFICATION */}
      <div className="relative flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <InlineActionNotification notification={bottomNotify} onClose={clearBottomNotify} position="top-right" />

        <button
          type="button"
          onClick={() => handleSaveRequest('Draft')}
          disabled={saving}
          className="h-[46px] px-6 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{existingRequestId ? 'Update Draft' : 'Save Draft'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="h-[46px] px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <Eye className="w-4 h-4 text-indigo-500" />
          <span>Preview Form PDF</span>
        </button>

        <button
          type="button"
          onClick={() => handleSaveRequest('Submitted')}
          disabled={saving}
          className="h-[46px] px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Form...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Form</span>
            </>
          )}
        </button>
      </div>

      {/* PDF PREVIEW MODAL */}
      {isPreviewOpen && (
        <DrugInformationPDFPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          clinicalCase={clinicalCase}
          student={student}
          dirData={{
            request_date: requestDate,
            request_time: requestTime,
            enquirer_name: enquirerName,
            designation,
            phone_no: phoneNo,
            unit_ward: unitWard,
            professional_status: professionalStatus,
            professional_status_other: professionalStatusOther,
            mode_of_request: modeOfRequest,
            answer_needed: answerNeeded,
            details_of_enquiry: detailsOfEnquiry,
            question_category: questionCategory,
            purpose_of_enquiry: purposeOfEnquiry,
            purpose_other: purposeOther,
            age,
            sex,
            weight_kg: weightKg,
            allergies,
            current_medical_problem: currentMedicalProblem,
            is_pregnant_lactating: isPregnantLactating,
            pregnancy_lactation_details: pregnancyLactationDetails,
            other_investigations: otherInvestigations,
            drug_therapy: drugTherapy,
            answer_given_timeframe: answerGivenTimeframe,
            reason_for_delay: reasonForDelay,
            mode_of_reply: modeOfReply,
            information_provided: informationProvided,
            ref_textbooks: refTextbooks,
            ref_journals: refJournals,
            ref_micromedex: refMicromedex,
            ref_clinirex: refClinirex,
            ref_idis: refIdis,
            ref_website: refWebsite,
            ref_others: refOthers
          }}
        />
      )}

    </div>
  );
};
