import React, { useState, useEffect } from 'react';
import { Download, X, Eye, Loader2, CheckCircle2, ShieldCheck, FileCheck2, Printer } from 'lucide-react';
import { fetchCaseModuleStatusesFromSupabase, fetchDocumentBrandingSettingsFromSupabase } from '../../services/supabaseService';
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

  const caseId = clinicalCase?.case_id || 'AMRMCP-2026-000001';
  const fileName = `${caseId}_Approved.pdf`;
  const approvedDateStr = clinicalCase?.reviewed_at 
    ? new Date(clinicalCase.reviewed_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    const loadModules = async () => {
      if (!clinicalCase?.id) return;
      setLoading(true);
      const collegeId = college?.id || student?.college_id || clinicalCase?.college_id;
      const [res, brandRes] = await Promise.all([
        fetchCaseModuleStatusesFromSupabase(clinicalCase.id),
        collegeId ? fetchDocumentBrandingSettingsFromSupabase(collegeId) : Promise.resolve({ success: false })
      ]);

      if (res.success) {
        setCaseModulesData(res.records || {});
      }
      if (brandRes.success && brandRes.settings) {
        setBranding(brandRes.settings);
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

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', branding?.paper_size?.toLowerCase() === 'letter' ? 'letter' : 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

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
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Ready for instant download & printing.</p>
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
                college={college}
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
                      <strong className="text-slate-900 font-bold">{student?.full_name || 'Student'}</strong>
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
                    <div className="space-y-2 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>1. Patient Profile & Clinical Demographics</span>
                        <span className="text-[10px] text-emerald-600 font-bold">🟢 Approved</span>
                      </h3>
                      <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg">
                        <div>Patient: <strong>{profile.patient_name || '—'}</strong></div>
                        <div>Age / Gender: <strong>{profile.age} / {profile.gender}</strong></div>
                        <div>IP/OP No: <strong>{profile.ip_no || profile.ip_op_number || '—'}</strong></div>
                        <div className="col-span-3">Diagnosis: <strong>{profile.provisional_diagnosis || profile.final_diagnosis || 'Not specified'}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* MODULE 2: PATIENT COUNSELLING */}
                  {counselling.id && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>2. Patient Counselling Record</span>
                        <span className="text-[10px] text-teal-600 font-bold">🟢 Approved</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg">
                        <div>Date of Counselling: <strong>{counselling.date_of_counselling || '—'}</strong></div>
                        <div>Counselling Mode: <strong>{counselling.counselling_provided || 'Oral & Leaflet'}</strong></div>
                        <div className="col-span-2">Key Focus: <strong>{counselling.disease_medication_info || counselling.special_instructions || 'Prescription instructions'}</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              </PharmDVerseBrandedDocumentContainer>

              {/* PAGE 2 OF 2 */}
              <PharmDVerseBrandedDocumentContainer
                college={college}
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
                  {/* MODULE 3: PHARMACIST INTERVENTION */}
                  {intervention.id && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>3. Pharmacist Intervention Log</span>
                        <span className="text-[10px] text-indigo-600 font-bold">🟢 Approved</span>
                      </h3>
                      <div className="text-[11px] bg-slate-50 p-3 rounded-lg space-y-1">
                        <div>Problem Identified: <strong>{intervention.description_of_problem || 'Prescription Review'}</strong></div>
                        <div>Action & Recommendations: <strong>{intervention.action_taken || intervention.recommendations || 'Communicated to physician'}</strong></div>
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
                      <div className="text-[11px] bg-slate-50 p-3 rounded-lg space-y-1">
                        <div>Enquiry Details: <strong>{dir.details_of_enquiry || 'Drug Query'}</strong></div>
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
                      <div className="text-[11px] bg-slate-50 p-3 rounded-lg space-y-1">
                        <div>Reaction Title: <strong>{adr.reaction_title || 'Suspected ADR'}</strong></div>
                        <div>Suspected Drug: <strong>{adr.reaction_description || 'Evaluated'}</strong></div>
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
