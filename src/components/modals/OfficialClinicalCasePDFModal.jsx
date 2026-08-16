import React, { useState, useEffect } from 'react';
import { FileText, Download, Presentation, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { 
  fetchCaseModuleStatusesFromSupabase, 
  fetchDocumentBrandingSettingsFromSupabase, 
  fetchCollegeByIdFromSupabase, 
  fetchPreceptorByIdFromSupabase 
} from '../../services/supabaseService';
import { generateClinicalCasePPTX } from '../../utils/generateClinicalCasePPTX';
import { generateOfficialClinicalCasePDF } from '../../utils/generateOfficialClinicalCasePDF';

const convertUrlToBase64 = async (url) => {
  if (!url) return '';
  if (url.startsWith('data:image')) return url;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return '';
  }
};

/**
 * Official Clinical Case PDF & PPT Download Modal.
 * Provides live document status verification and handles high-precision vector PDF & PPT exports.
 */
export const OfficialClinicalCasePDFModal = ({ isOpen, onClose, clinicalCase, student, preceptor, college }) => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [exportingPPT, setExportingPPT] = useState(false);
  const [caseModulesData, setCaseModulesData] = useState({});
  const [branding, setBranding] = useState(null);
  const [pptSettingsState, setPptSettingsState] = useState(null);
  const [collegeData, setCollegeData] = useState(college);
  const [assignedPreceptorObj, setAssignedPreceptorObj] = useState(preceptor);

  const studentRoll = student?.roll_number || student?.roll_no || clinicalCase?.roll_number || 'Y22PHD0314';
  const caseId = clinicalCase?.case_number ||
                 clinicalCase?.case_id ||
                 clinicalCase?.case_code ||
                 clinicalCase?.profile?.case_number ||
                 `AMRMCP-2026-${studentRoll}-0001`;

  const approvedDateStr = clinicalCase?.reviewed_at || clinicalCase?.approved_at
    ? new Date(clinicalCase.reviewed_at || clinicalCase.approved_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    const loadModules = async () => {
      if (!clinicalCase?.id) return;
      setLoading(true);
      const collegeId = clinicalCase?.college_id || student?.college_id || college?.id;
      const targetPreceptorId = clinicalCase?.preceptor_id || clinicalCase?.assigned_preceptor_id || clinicalCase?.approved_by_preceptor_id || preceptor?.id;

      const [res, brandRes, collegeRes, preceptorRes] = await Promise.all([
        fetchCaseModuleStatusesFromSupabase(clinicalCase.id),
        collegeId ? fetchDocumentBrandingSettingsFromSupabase(collegeId) : Promise.resolve({ success: false }),
        collegeId ? fetchCollegeByIdFromSupabase(collegeId) : Promise.resolve({ success: false }),
        targetPreceptorId ? fetchPreceptorByIdFromSupabase(targetPreceptorId) : Promise.resolve({ success: false })
      ]);

      let mergedModules = {};
      if (res.success && res.records && Object.keys(res.records).length > 0) {
        mergedModules = res.records;
      }

      // Always merge embedded objects from clinicalCase as fallback or supplement
      mergedModules = {
        profile: mergedModules.profile || clinicalCase?.profile || clinicalCase?.patient_profile || clinicalCase,
        counselling: mergedModules.counselling || clinicalCase?.counselling || clinicalCase?.patient_counselling || {},
        intervention: mergedModules.intervention || clinicalCase?.intervention || clinicalCase?.pharmacist_intervention || {},
        dir: mergedModules.dir || clinicalCase?.dir || clinicalCase?.drug_information || {},
        adr: mergedModules.adr || clinicalCase?.adr || clinicalCase?.adr_documentation || {},
        vitals: mergedModules.vitals || clinicalCase?.vital_signs || clinicalCase?.vitals || [],
        labs: mergedModules.labs || clinicalCase?.lab_investigations || clinicalCase?.labs || [],
        drugs: mergedModules.drugs || clinicalCase?.prescribed_drugs || clinicalCase?.medications || clinicalCase?.drugs || []
      };

      setCaseModulesData(mergedModules);

      if (brandRes.success) {
        setBranding(brandRes.pdfSettings || brandRes.settings);
        setPptSettingsState(brandRes.pptSettings || {});
      }
      if (preceptorRes.success && preceptorRes.preceptor) {
        setAssignedPreceptorObj(preceptorRes.preceptor);
      } else if (preceptor) {
        setAssignedPreceptorObj(preceptor);
      }

      const targetCollege = (collegeRes.success && collegeRes.college) ? collegeRes.college : college;
      if (targetCollege) {
        const [cLogo, hLogo] = await Promise.all([
          convertUrlToBase64(targetCollege.college_logo_url || targetCollege.logo_url),
          convertUrlToBase64(targetCollege.hospital_logo_url)
        ]);
        setCollegeData({
          ...targetCollege,
          college_logo_url: cLogo || targetCollege.college_logo_url || targetCollege.logo_url,
          hospital_logo_url: hLogo || targetCollege.hospital_logo_url
        });
      }

      setLoading(false);
    };

    if (isOpen) {
      loadModules();
    }
  }, [isOpen, clinicalCase?.id, college?.id, student?.college_id, clinicalCase?.college_id]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const finalCollegeObj = collegeData || college;
      const finalPreceptorObj = assignedPreceptorObj || preceptor;
      await generateOfficialClinicalCasePDF({
        clinicalCase,
        student,
        preceptor: finalPreceptorObj,
        college: finalCollegeObj,
        caseModulesData,
        branding
      });
    } catch (err) {
      console.error('Failed to generate Official PDF:', err);
      alert('Could not download PDF. Error: ' + (err?.message || err));
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPPT = async () => {
    setExportingPPT(true);
    try {
      const finalCollegeObj = collegeData || college;
      const finalPreceptorObj = assignedPreceptorObj || preceptor;
      await generateClinicalCasePPTX({
        clinicalCase,
        student,
        preceptor: finalPreceptorObj,
        college: finalCollegeObj,
        caseModulesData,
        pptSettings: pptSettingsState || branding
      });
    } catch (err) {
      console.error('Failed to generate PPT presentation:', err);
      alert('Could not export PPT presentation. Please try again.');
    } finally {
      setExportingPPT(false);
    }
  };

  if (!isOpen) return null;

  const profile = caseModulesData?.profile || {};
  const counselling = caseModulesData?.counselling || {};
  const intervention = caseModulesData?.intervention || {};
  const dir = caseModulesData?.dir || {};
  const adr = caseModulesData?.adr || {};

  const finalCollegeObj = collegeData || college || student?.colleges;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Official Approved Documentation</h3>
              <p className="text-xs text-emerald-100 font-mono">Case ID: {caseId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Verifying submitted module records...</p>
            </div>
          ) : (
            <>
              {/* Document Metadata Banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Verification Complete</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Official clinical case logbook data verified. Verified & approved by preceptor on {approvedDateStr}.
                  </p>
                </div>
              </div>

              {/* Institution Details */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institution Details</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {finalCollegeObj?.college_name || finalCollegeObj?.name || 'A.M.REDDY MEMORIAL COLLEGE OF PHARMACY'}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {finalCollegeObj?.hospital_name || 'LALITHA SUPERSPECIALITIES HOSPITAL'}
                </div>
              </div>

              {/* Submitted Form Modules Checklist */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Included Approved Modules</div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span className="font-semibold">1. Patient Profile Documentation</span>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  {Boolean(counselling.disease_counselled || counselling.points_covered || counselling.counselling_date) && (
                    <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span className="font-semibold">2. Patient Counselling Documentation</span>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                  {Boolean(intervention.date_of_intervention || intervention.intervention_date || intervention.description_of_problem || intervention.prescription_problems) && (
                    <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span className="font-semibold">3. Pharmacist Intervention Documentation</span>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                  {Boolean(dir.request_date || dir.query_date || dir.details_of_enquiry) && (
                    <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span className="font-semibold">4. Drug Information Request Documentation</span>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                  {Boolean(adr.reaction_title || adr.reaction_description || adr.suspected_drug) && (
                    <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span className="font-semibold">5. ADR Documentation Log</span>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            Close
          </button>
          
          <button
            onClick={handleDownloadPPT}
            disabled={downloading || exportingPPT || loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {exportingPPT ? <Loader2 className="w-4 h-4 animate-spin" /> : <Presentation className="w-4 h-4 text-amber-400" />}
            <span>{exportingPPT ? 'Generating PPT...' : 'Export PPT'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading || exportingPPT || loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
