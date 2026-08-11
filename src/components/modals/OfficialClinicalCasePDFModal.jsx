import React, { useState, useEffect } from 'react';
import { Download, X, Eye, Loader2, CheckCircle2, ShieldCheck, FileCheck2, Printer } from 'lucide-react';
import { fetchCaseModuleStatusesFromSupabase, fetchDocumentBrandingSettingsFromSupabase, fetchCollegeByIdFromSupabase } from '../../services/supabaseService';
import { ModalWrapper } from './ModalWrapper';
import { PharmDVerseBrandedDocumentContainer } from '../branding/PharmDVerseBrandedDocumentContainer';

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const getPdfLibraries = async () => {
  if (!window.html2canvas) {
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    } catch (e) {
      console.warn('html2canvas CDN load failed:', e);
    }
  }

  if (!window.jspdf) {
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    } catch (e) {
      console.warn('jsPDF CDN load failed:', e);
    }
  }

  const html2canvasFn = window.html2canvas;
  const jsPDFFn = window.jspdf?.jsPDF || window.jsPDF;

  return { html2canvas: html2canvasFn, jsPDF: jsPDFFn };
};

export const OfficialClinicalCasePDFModal = ({ isOpen, onClose, clinicalCase, student, preceptor, college }) => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [caseModulesData, setCaseModulesData] = useState({});
  const [branding, setBranding] = useState(null);
  const [collegeData, setCollegeData] = useState(college);

  const caseId = clinicalCase?.case_id || 'AMRMCP-2026-000001';
  const fileName = `${caseId}_Approved.pdf`;
  const approvedDateStr = clinicalCase?.reviewed_at || clinicalCase?.approved_at
    ? new Date(clinicalCase.reviewed_at || clinicalCase.approved_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    const loadModules = async () => {
      if (!clinicalCase?.id) return;
      setLoading(true);
      const collegeId = college?.id || student?.college_id || clinicalCase?.college_id;
      const [res, brandRes, collegeRes] = await Promise.all([
        fetchCaseModuleStatusesFromSupabase(clinicalCase.id),
        collegeId ? fetchDocumentBrandingSettingsFromSupabase(collegeId) : Promise.resolve({ success: false }),
        collegeId ? fetchCollegeByIdFromSupabase(collegeId) : Promise.resolve({ success: false })
      ]);

      if (res.success) {
        setCaseModulesData(res.records || {});
      }
      if (brandRes.success && brandRes.settings) {
        setBranding(brandRes.settings);
      }
      if (collegeRes.success && collegeRes.college) {
        setCollegeData(collegeRes.college);
      } else {
        setCollegeData(college);
      }
      setLoading(false);
    };

    if (isOpen) {
      loadModules();
    }
  }, [isOpen, clinicalCase?.id, college?.id, student?.college_id, clinicalCase?.college_id]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('official-clinical-case-pdf-container');
    if (!element) return;

    setDownloading(true);
    try {
      const { html2canvas, jsPDF } = await getPdfLibraries();

      if (!html2canvas || !jsPDF) {
        throw new Error('PDF libraries could not be initialized.');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const isLandscape = branding?.orientation?.toLowerCase() === 'landscape';
      const pdf = new jsPDF(isLandscape ? 'l' : 'p', 'mm', branding?.paper_size?.toLowerCase() === 'letter' ? 'letter' : 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(fileName);
    } catch (err) {
      console.error('Failed to generate Official PDF:', err);
      window.print();
    }
    setDownloading(false);
  };

  if (!isOpen) return null;

  const profile = caseModulesData.profile || {};
  const counselling = caseModulesData.counselling || {};
  const intervention = caseModulesData.intervention || {};
  const dir = caseModulesData.dir || {};
  const adr = caseModulesData.adr || {};
  const labs = caseModulesData.labs || [];
  const drugs = caseModulesData.drugs || [];

  const finalCollegeObj = collegeData || college || student?.colleges;

  // Profile data
  const counsellingDateVal = counselling.counselling_date ? new Date(counselling.counselling_date).toLocaleDateString() : '—';
  const counsellingModeVal = counselling.patient_type || counselling.counselling_provided_to || 'In patient';
  const pointsCoveredStr = Array.isArray(counselling.points_covered) ? counselling.points_covered.join(', ') : (counselling.points_covered || 'Prescription instructions & medication compliance');

  const interProblemsStr = Array.isArray(intervention.prescription_problems) ? intervention.prescription_problems.join(', ') : (intervention.description_of_problem || 'Prescription Review');
  const interActionsStr = Array.isArray(intervention.action_taken) ? intervention.action_taken.join(', ') : (intervention.action_taken_other || 'Communicated to physician');
  const interRecsStr = Array.isArray(intervention.recommendations) ? intervention.recommendations.join(', ') : (intervention.recommendation_other || 'Dose & therapy optimization');

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`Official Approved PDF Record`}
      subtitle={`Document: ${fileName}`}
      maxWidth={branding?.orientation === 'Landscape' ? 'max-w-6xl' : 'max-w-4xl'}
    >
      <div className="space-y-4 text-xs">
        {/* TOP ACTION BAR */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Official Clinical Record Approved</h4>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Branded PDF document with complete clinical student documentation.</p>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading || loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Download {fileName}</span>
          </button>
        </div>

        {/* PRINTABLE CONTAINER */}
        <div className="max-h-[65vh] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-100 dark:bg-slate-900/50">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
              <p className="font-semibold text-slate-500">Compiling Official Approved Clinical Case Record...</p>
            </div>
          ) : (
            <div id="official-clinical-case-pdf-container" className="space-y-6">
              
              {/* PAGE 1 OF 2 */}
              <PharmDVerseBrandedDocumentContainer
                college={finalCollegeObj}
                branding={branding}
                documentTitle="Official Clinical Logbook Record"
                caseId={caseId}
                student={student}
                preceptorName={preceptor?.full_name || clinicalCase?.assigned_preceptor_name}
                pageNumber="1 of 2"
                showSignatures={false}
              >
                <div className="space-y-4 text-xs">
                  {/* STUDENT & CASE DEMOGRAPHICS */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-xs branded-border">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Candidate</span>
                      <strong className="text-slate-900 font-bold">{student?.full_name || 'Student Candidate'}</strong>
                      <span className="text-[11px] text-slate-600 block font-mono">Roll: {student?.roll_number}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Evaluating Preceptor</span>
                      <strong className="text-slate-900 font-bold">{preceptor?.full_name || clinicalCase?.assigned_preceptor_name || 'Assigned Preceptor'}</strong>
                      <span className="text-[11px] text-slate-600 block">{preceptor?.department || 'Clinical Practice'}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Hospital & Ward</span>
                      <strong className="text-slate-900 font-bold">{clinicalCase?.hospital_name}</strong>
                      <span className="text-[11px] text-slate-600 block">{clinicalCase?.department} (Unit: {clinicalCase?.ward_unit})</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Category & Date</span>
                      <strong className="text-slate-900 font-bold">{clinicalCase?.ip_op_type} Patient</strong>
                      <span className="text-[11px] text-slate-600 block font-mono">Admission: {clinicalCase?.date_of_admission}</span>
                    </div>
                  </div>

                  {/* MODULE 1: PATIENT PROFILE */}
                  {profile.id && (
                    <div className="space-y-3 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>1. Patient Profile & Clinical Demographics</span>
                        <span className="text-[10px] text-emerald-600 font-bold">🟢 Approved</span>
                      </h3>

                      <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg branded-border">
                        <div>Patient: <strong>{profile.patient_name || '—'}</strong></div>
                        <div>Age / Gender: <strong>{profile.age} / {profile.gender}</strong></div>
                        <div>IP/OP No: <strong>{profile.ip_no || profile.ip_op_number || '—'}</strong></div>
                        <div>Department: <strong>{profile.department || clinicalCase?.department || '—'}</strong></div>
                        <div>Ward: <strong>{profile.ward || clinicalCase?.ward_unit || '—'}</strong></div>
                        <div>Physician: <strong>{profile.physician || '—'}</strong></div>
                        {profile.chief_complaints && <div className="col-span-3">Chief Complaints: <strong>{profile.chief_complaints}</strong></div>}
                        {profile.past_medical_history && <div className="col-span-3">Past History: <strong>{profile.past_medical_history}</strong></div>}
                        {profile.past_medication_history && <div className="col-span-3">Past Medication History: <strong>{profile.past_medication_history}</strong></div>}
                        <div className="col-span-3">Diagnosis: <strong>{profile.final_diagnosis || profile.provisional_diagnosis || clinicalCase?.final_diagnosis || 'Not specified'}</strong></div>
                        {profile.discharge_summary && <div className="col-span-3">Discharge Summary: <strong>{profile.discharge_summary}</strong></div>}
                      </div>

                      {/* LAB INVESTIGATIONS TABLE */}
                      {labs.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <strong className="block text-[11px] font-extrabold uppercase branded-subheading">
                            Laboratory Investigations
                          </strong>
                          <table className="w-full text-left border border-collapse text-[10px] branded-border">
                            <thead className="font-bold uppercase text-[9px] border-b branded-header-bg branded-border">
                              <tr>
                                <th className="p-1.5 border-r branded-border">Category</th>
                                <th className="p-1.5 border-r branded-border">Parameter Name</th>
                                <th className="p-1.5 border-r branded-border">Observed Value</th>
                                <th className="p-1.5">Reference Range</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y branded-border">
                              {labs.map((l, idx) => (
                                <tr key={idx} className="border-b branded-border">
                                  <td className="p-1.5 border-r branded-border">{l.category || 'General'}</td>
                                  <td className="p-1.5 border-r font-bold branded-border">{l.parameter_name}</td>
                                  <td className="p-1.5 border-r font-mono font-bold branded-border">{l.test_value}</td>
                                  <td className="p-1.5 border-r branded-border">{l.reference_range || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* PRESCRIBED PHARMACOTHERAPY TABLE */}
                      {drugs.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <strong className="block text-[11px] font-extrabold uppercase branded-subheading">
                            Prescribed Pharmacotherapy Log
                          </strong>
                          <table className="w-full text-left border border-collapse text-[10px] branded-border">
                            <thead className="font-bold uppercase text-[9px] border-b branded-header-bg branded-border">
                              <tr>
                                <th className="p-1.5 border-r branded-border">S.No</th>
                                <th className="p-1.5 border-r branded-border">Brand & Generic Name</th>
                                <th className="p-1.5 border-r branded-border">Dose & Route</th>
                                <th className="p-1.5">Frequency</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y branded-border">
                              {drugs.map((d, idx) => (
                                <tr key={idx} className="border-b branded-border">
                                  <td className="p-1.5 border-r text-center font-mono branded-border">{d.s_no || idx + 1}</td>
                                  <td className="p-1.5 border-r font-bold branded-border">
                                    {d.trade_name} {d.generic_name ? `(${d.generic_name})` : ''}
                                  </td>
                                  <td className="p-1.5 border-r branded-border">{d.dose} ({d.route_of_admin || 'Oral'})</td>
                                  <td className="p-1.5 font-mono font-bold branded-border">{d.frequency || 'OD'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </PharmDVerseBrandedDocumentContainer>

              {/* PAGE 2 OF 2 */}
              <PharmDVerseBrandedDocumentContainer
                college={finalCollegeObj}
                branding={branding}
                documentTitle="Official Clinical Logbook Record"
                caseId={caseId}
                student={student}
                preceptorName={preceptor?.full_name || clinicalCase?.assigned_preceptor_name}
                pageNumber="2 of 2"
                isLastPage={true}
                showSignatures={true}
              >
                <div className="space-y-4 text-xs">

                  {/* MODULE 2: PATIENT COUNSELLING */}
                  {counselling.id && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>2. Patient Counselling Record</span>
                        <span className="text-[10px] text-teal-600 font-bold">🟢 Approved</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg branded-border">
                        <div>Date of Counselling: <strong>{counsellingDateVal}</strong></div>
                        <div>Counselling Mode / Patient Type: <strong>{counsellingModeVal}</strong></div>
                        {counselling.disease_counselled && <div className="col-span-2">Disease Counselled: <strong>{counselling.disease_counselled}</strong></div>}
                        {counselling.medications_counselled && <div className="col-span-2">Medications Counselled: <strong>{counselling.medications_counselled}</strong></div>}
                        <div className="col-span-2">Key Focus & Points Covered: <strong>{pointsCoveredStr}</strong></div>
                        {counselling.time_taken && <div>Time Taken: <strong>{counselling.time_taken}</strong></div>}
                      </div>
                    </div>
                  )}

                  {/* MODULE 3: PHARMACIST INTERVENTION */}
                  {intervention.id && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>3. Pharmacist Intervention Log</span>
                        <span className="text-[10px] text-indigo-600 font-bold">🟢 Approved</span>
                      </h3>
                      <div className="text-[11px] bg-slate-50 p-3 rounded-lg space-y-1 branded-border">
                        <div>Problem Identified: <strong>{interProblemsStr}</strong></div>
                        <div>Action Taken: <strong>{interActionsStr}</strong></div>
                        <div>Recommendations: <strong>{interRecsStr}</strong></div>
                        {intervention.outcome && <div>Outcome: <strong>{intervention.outcome}</strong></div>}
                      </div>
                    </div>
                  )}

                  {/* MODULE 4: DRUG INFORMATION REQUEST */}
                  {dir.id && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>4. Drug Information Request</span>
                        <span className="text-[10px] text-cyan-600 font-bold">🟢 Approved</span>
                      </h3>
                      <div className="text-[11px] bg-slate-50 p-3 rounded-lg space-y-1 branded-border">
                        <div>Enquirer Name & Role: <strong>{dir.enquirer_name || 'Clinician'} ({dir.enquirer_category || 'Doctor'})</strong></div>
                        <div>Enquiry Details: <strong>{dir.details_of_enquiry || dir.background_info || 'Drug Query'}</strong></div>
                        <div>Response Summary: <strong>{dir.information_provided || 'Provided via Micromedex / UpToDate'}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* MODULE 5: ADR DOCUMENTATION */}
                  {adr.id && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>5. Adverse Drug Reaction Log</span>
                        <span className="text-[10px] text-amber-600 font-bold">🟢 Approved</span>
                      </h3>
                      <div className="text-[11px] bg-slate-50 p-3 rounded-lg space-y-1 branded-border">
                        <div>Reaction Title: <strong>{adr.reaction_title || adr.reaction_category || 'Suspected ADR'}</strong></div>
                        <div>Suspected Drug: <strong>{adr.suspected_drug || adr.primary_diagnosis || adr.reaction_description || 'Evaluated'}</strong></div>
                        {adr.initial_causality_opinion && <div>Initial Causality Opinion: <strong>{adr.initial_causality_opinion}</strong></div>}
                        {adr.reaction_severity && <div>Severity / Outcome: <strong>{adr.reaction_severity} ({adr.patient_outcome || 'Recovered'})</strong></div>}
                      </div>
                    </div>
                  )}

                  {/* OFFICIAL PRECEPTOR APPROVAL BOX */}
                  <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/50 space-y-3 mt-6">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-700" />
                        <span className="font-black text-emerald-900 uppercase tracking-wider text-xs">Official Preceptor Approval & Verification</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-800">Status: APPROVED</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Reviewed & Approved By</span>
                        <strong className="text-slate-900 text-sm font-black">{preceptor?.full_name || clinicalCase?.assigned_preceptor_name || 'Preceptor Evaluator'}</strong>
                        <span className="text-[11px] text-slate-600 block">Clinical Preceptor / Faculty Evaluator</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Approved On</span>
                        <strong className="text-slate-900 text-sm font-mono font-black">{approvedDateStr}</strong>
                        <span className="text-[10px] text-emerald-700 font-bold block mt-1">Verified via PharmDVerse Cloud</span>
                      </div>
                    </div>

                    {clinicalCase?.overall_preceptor_comments && (
                      <div className="pt-2 border-t border-emerald-200 text-[11px] text-slate-800">
                        <span className="font-bold block text-slate-700">Preceptor Comments:</span>
                        <p className="italic bg-white p-2 rounded border border-emerald-200 mt-1">{clinicalCase.overall_preceptor_comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              </PharmDVerseBrandedDocumentContainer>

            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
