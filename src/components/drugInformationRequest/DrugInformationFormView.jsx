import React, { useState, useEffect } from 'react';
import { FileSearch, User, Clock, FileText, CheckSquare, Square, Save, Eye, Send, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { fetchDrugInformationRequestByCaseIdFromSupabase, saveOrUpdateDrugInformationRequestInSupabase } from '../../services/supabaseService';
import { DrugInformationPDFPreviewModal } from './DrugInformationPDFPreviewModal';

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
  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

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
      if (!clinicalCase) return;
      setLoading(true);

      // Pre-fill defaults from clinicalCase
      setUnitWard(clinicalCase.ward_unit || '');
      setEnquirerName(clinicalCase.hospital_name ? `Dr. On-Duty (${clinicalCase.department})` : '');

      const res = await fetchDrugInformationRequestByCaseIdFromSupabase(clinicalCase.id);
      if (res.success && res.request) {
        const item = res.request;
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

      setLoading(false);
    };

    loadDIRData();
  }, [clinicalCase]);

  const handleSaveRequest = async (newStatus = 'Draft') => {
    setFormError('');
    setSaveSuccess('');

    if (!enquirerName.trim() || !detailsOfEnquiry.trim()) {
      setFormError('Please enter Name of Enquirer and Details of Enquiry (Question).');
      return;
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
      unit_ward: unitWard.trim(),
      professional_status: professionalStatus,
      professional_status_other: professionalStatus === 'Others' ? professionalStatusOther : null,
      mode_of_request: modeOfRequest,
      answer_needed: answerNeeded,
      details_of_enquiry: detailsOfEnquiry.trim(),
      question_category: questionCategory,
      purpose_of_enquiry: purposeOfEnquiry,
      purpose_other: purposeOfEnquiry === 'Others' ? purposeOther : null,
      age,
      sex,
      weight_kg: weightKg,
      allergies,
      current_medical_problem: currentMedicalProblem.trim(),
      is_pregnant_lactating: isPregnantLactating,
      pregnancy_lactation_details: isPregnantLactating ? pregnancyLactationDetails : null,
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
      setSaveSuccess(newStatus === 'Submitted' ? 'Drug Information Request Form submitted successfully!' : 'Drug Information Request Form saved as Draft.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } else {
      setFormError(res.error || 'Failed to save Drug Information Request documentation.');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-500">Loading Drug Information Request Form...</p>
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
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Drug Information Request & Documentation Form</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Case ID: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{clinicalCase.case_id}</strong> • Student: <strong className="text-slate-800 dark:text-slate-200">{student?.full_name}</strong>
            </p>
          </div>
        </div>

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
            onClick={() => handleSaveRequest('Draft')}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{existingRequestId ? 'Update Draft' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveRequest('Submitted')}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Submit Form</span>
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

      {/* 1. REQUESTER DETAILS */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          1. Requester & Session Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Request Date *</label>
            <input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Request Time</label>
            <input type="text" value={requestTime} onChange={(e) => setRequestTime(e.target.value)} placeholder="e.g. 11:00 AM" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Name of the Enquirer *</label>
            <input type="text" required value={enquirerName} onChange={(e) => setEnquirerName(e.target.value)} placeholder="Dr. / Pharmacist / Nurse Name" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
            <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Senior Resident" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone No.</label>
            <input type="text" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} placeholder="Contact number" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit / Ward</label>
            <input type="text" value={unitWard} onChange={(e) => setUnitWard(e.target.value)} placeholder="e.g. ICU Ward 4" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div className="sm:col-span-4">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Professional Status *</label>
            <div className="flex flex-wrap gap-2">
              {['Physician', 'Surgeon', 'Resident', 'Interns', 'Pharmacist', 'Nurse', 'Others'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setProfessionalStatus(st)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    professionalStatus === st
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {professionalStatus === 'Others' && (
              <input
                type="text"
                value={professionalStatusOther}
                onChange={(e) => setProfessionalStatusOther(e.target.value)}
                placeholder="Specify professional status..."
                className="w-full h-10 px-3.5 mt-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
              />
            )}
          </div>
        </div>
      </div>

      {/* 2. QUESTION CATEGORY & DETAILS OF ENQUIRY */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          2. Details of Enquiry & Question Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mode of Request *</label>
            <select value={modeOfRequest} onChange={(e) => setModeOfRequest(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
              <option value="Direct">Direct</option>
              <option value="Ward rounds">Ward rounds</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Answer Needed *</label>
            <select value={answerNeeded} onChange={(e) => setAnswerNeeded(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-indigo-600 dark:text-indigo-400">
              <option value="Immediately">Immediately</option>
              <option value="Within 2-4hrs">Within 2-4hrs</option>
              <option value="Within 1-2 days">Within 1-2 days</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Details of Enquiry (Drug Information Question) *</label>
            <textarea
              rows={3}
              required
              value={detailsOfEnquiry}
              onChange={(e) => setDetailsOfEnquiry(e.target.value)}
              placeholder="What is the specific drug information query asked by physician/nurse?"
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Question Category *</label>
            <select value={questionCategory} onChange={(e) => setQuestionCategory(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
              {QUESTION_CATEGORIES.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Purpose of Enquiry *</label>
            <select value={purposeOfEnquiry} onChange={(e) => setPurposeOfEnquiry(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
              <option value="Update knowledge">Update knowledge</option>
              <option value="Better patient care">Better patient care</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. PATIENT DETAILS (BACKGROUND INFORMATION) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          3. Patient Details (Background Information)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Age / Sex</label>
            <div className="flex gap-2">
              <input type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
              <select value={sex} onChange={(e) => setSex(e.target.value)} className="h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Weight (Kgs)</label>
            <input type="text" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="e.g. 65" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Known Allergies</label>
            <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Known drug/food allergies" className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-rose-600 dark:text-rose-400" />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Medical Problem</label>
            <textarea rows={2} value={currentMedicalProblem} onChange={(e) => setCurrentMedicalProblem(e.target.value)} placeholder="Primary medical diagnosis..." className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Drug Therapy</label>
            <textarea rows={2} value={drugTherapy} onChange={(e) => setDrugTherapy(e.target.value)} placeholder="Current prescribed medications..." className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
          </div>

          <div className="sm:col-span-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Pregnancy / Lactation Status?</span>
              <div className="flex items-center gap-4 font-bold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="preg" checked={isPregnantLactating === true} onChange={() => setIsPregnantLactating(true)} />
                  <span>YES</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="preg" checked={isPregnantLactating === false} onChange={() => setIsPregnantLactating(false)} />
                  <span>NO</span>
                </label>
              </div>
            </div>

            {isPregnantLactating && (
              <input
                type="text"
                value={pregnancyLactationDetails}
                onChange={(e) => setPregnancyLactationDetails(e.target.value)}
                placeholder="Give trimester / gestational details..."
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white mt-1"
              />
            )}
          </div>
        </div>
      </div>

      {/* 4. RESPONSE PROVIDED & DELIVERY METADATA */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          4. Response Provided (Information Provided)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Answer Given Timeframe *</label>
            <select value={answerGivenTimeframe} onChange={(e) => setAnswerGivenTimeframe(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
              <option value="Immediately">Immediately</option>
              <option value="Within 2-4hrs">Within 2-4hrs</option>
              <option value="Within 1-2 days">Within 1-2 days</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mode of Reply *</label>
            <select value={modeOfReply} onChange={(e) => setModeOfReply(e.target.value)} className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-emerald-600 dark:text-emerald-400">
              <option value="Written">Written</option>
              <option value="Verbal">Verbal</option>
              <option value="Both">Both</option>
              <option value="Printed literature">Printed literature</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Delay (If any)</label>
            <input type="text" value={reasonForDelay} onChange={(e) => setReasonForDelay(e.target.value)} placeholder="Reason for delay..." className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div className="sm:col-span-3">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Information Provided (Detailed Drug Response) *</label>
            <textarea
              rows={6}
              required
              value={informationProvided}
              onChange={(e) => setInformationProvided(e.target.value)}
              placeholder="Provide evidence-based clinical answer to the drug information query..."
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 5. REFERENCES */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          5. References Consulted
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Text book (mention)</label>
            <input type="text" value={refTextbooks} onChange={(e) => setRefTextbooks(e.target.value)} placeholder="Textbook references..." className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Journals (mention)</label>
            <input type="text" value={refJournals} onChange={(e) => setRefJournals(e.target.value)} placeholder="Journal citations..." className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Micromedex</label>
            <input type="text" value={refMicromedex} onChange={(e) => setRefMicromedex(e.target.value)} placeholder="Micromedex database details..." className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinirex</label>
            <input type="text" value={refClinirex} onChange={(e) => setRefClinirex(e.target.value)} placeholder="Clinirex reference..." className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Website URL</label>
            <input type="text" value={refWebsite} onChange={(e) => setRefWebsite(e.target.value)} placeholder="https://..." className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Others (specify)</label>
            <input type="text" value={refOthers} onChange={(e) => setRefOthers(e.target.value)} placeholder="Other references..." className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>
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
            onClick={() => handleSaveRequest('Draft')}
            disabled={saving}
            className="h-[48px] px-6 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveRequest('Submitted')}
            disabled={saving}
            className="h-[48px] px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
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
