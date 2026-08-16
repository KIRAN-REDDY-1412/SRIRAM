import React, { useState, useEffect } from 'react';
import { Download, X, Eye, Loader2, CheckCircle2, ShieldCheck, FileCheck2, Presentation } from 'lucide-react';
import { fetchCaseModuleStatusesFromSupabase, fetchDocumentBrandingSettingsFromSupabase, fetchCollegeByIdFromSupabase, fetchPreceptorByIdFromSupabase } from '../../services/supabaseService';
import { ModalWrapper } from './ModalWrapper';
import { PharmDVerseBrandedDocumentContainer } from '../branding/PharmDVerseBrandedDocumentContainer';
import { ClinicalCaseDocumentRenderer } from '../branding/ClinicalCaseDocumentRenderer';
import { generateClinicalCasePPTX } from '../../utils/generateClinicalCasePPTX';
import { generateOfficialClinicalCasePDF } from '../../utils/generateOfficialClinicalCasePDF';

const convertUrlToBase64 = (url) => {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string' || url.startsWith('data:')) {
      return resolve(url);
    }
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 120;
        canvas.height = img.naturalHeight || img.height || 120;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (e) {
        resolve(url);
      }
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
};

export const OfficialClinicalCasePDFModal = ({ isOpen, onClose, clinicalCase, student, preceptor, college }) => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [exportingPPT, setExportingPPT] = useState(false);
  const [caseModulesData, setCaseModulesData] = useState({});
  const [branding, setBranding] = useState(null);
  const [pptSettingsState, setPptSettingsState] = useState(null);
  const [collegeData, setCollegeData] = useState(college);
  const [assignedPreceptorObj, setAssignedPreceptorObj] = useState(preceptor);

  const caseId = clinicalCase?.case_id || 'CLG-2026-000001';
  const fileName = `${caseId}_Approved.pdf`;
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

      if (res.success) {
        setCaseModulesData(res.records || {});
      }
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
      await generateClinicalCasePPTX({
        clinicalCase,
        student,
        preceptor,
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
  const labs = caseModulesData?.labs || [];
  const drugs = caseModulesData?.drugs || [];

  const finalCollegeObj = collegeData || college || student?.colleges;

  // Extract complete module fields
  const patientName = profile.patient_name || '—';
  const ageGender = profile.age && profile.gender ? `${profile.age} Yrs / ${profile.gender}` : (profile.age || profile.gender || '—');
  const ipNo = profile.ip_no || profile.ip_op_number || '—';
  const heightWeightBmi = [
    profile.height ? `Ht: ${profile.height} cm` : null,
    profile.weight ? `Wt: ${profile.weight} kg` : null,
    profile.bmi ? `BMI: ${profile.bmi} kg/m²` : null
  ].filter(Boolean).join(' | ');

  const dept = profile.department || clinicalCase?.department || '—';
  const ward = profile.ward || clinicalCase?.ward_unit || '—';
  const physician = profile.physician || '—';

  const complaints = profile.chief_complaints || '';
  const pastMedical = profile.past_medical_history || '';
  const pastMedication = profile.past_medication_history || '';
  const familyHist = profile.family_history || '';
  const socialHist = [
    profile.smoker_pack_day && profile.smoker_pack_day !== 'NIL' ? `Smoker: ${profile.smoker_pack_day} (${profile.smoker_duration || ''})` : null,
    profile.alcoholic_amount_day && profile.alcoholic_amount_day !== 'NIL' ? `Alcohol: ${profile.alcoholic_amount_day} (${profile.alcoholic_duration || ''})` : null,
    profile.marital_status ? `Marital Status: ${profile.marital_status}` : null
  ].filter(Boolean).join(' | ');

  const allergiesStr = [
    profile.allergy_drugs && profile.allergy_drugs !== 'NIL' ? `Drug Allergies: ${profile.allergy_drugs}` : null,
    profile.allergy_food && profile.allergy_food !== 'NIL' ? `Food Allergies: ${profile.allergy_food}` : null
  ].filter(Boolean).join(' | ');

  const generalExam = [
    profile.cyanosis ? `Cyanosis: ${profile.cyanosis}` : null,
    profile.icterus ? `Icterus: ${profile.icterus}` : null,
    profile.pallor ? `Pallor: ${profile.pallor}` : null
  ].filter(Boolean).join(' | ');

  const systemicExam = [
    profile.cvs ? `CVS: ${profile.cvs}` : null,
    profile.gi ? `GI: ${profile.gi}` : null,
    profile.rs ? `RS: ${profile.rs}` : null,
    profile.cns ? `CNS: ${profile.cns}` : null
  ].filter(Boolean).join(' | ');

  const diagnosisStr = profile.final_diagnosis || profile.provisional_diagnosis || clinicalCase?.final_diagnosis || 'Not specified';
  const vitalsList = Array.isArray(profile.vital_signs) ? profile.vital_signs : [];
  const otherInvStr = profile.other_investigations || '';
  const dischargeSumStr = profile.discharge_summary || '';

  // Counselling Data
  const counsellingDateVal = counselling.counselling_date ? new Date(counselling.counselling_date).toLocaleDateString() : '—';
  const counsellingTimeVal = counselling.counselling_time || '';
  const counsellingModeVal = counselling.patient_type || counselling.counselling_provided_to || 'In patient';
  const pointsCoveredList = Array.isArray(counselling.points_covered) ? counselling.points_covered : (counselling.points_covered ? [counselling.points_covered] : []);

  // Intervention Data
  const interDateVal = intervention.date_of_intervention ? new Date(intervention.date_of_intervention).toLocaleDateString() : '—';
  const interProblemsList = Array.isArray(intervention.prescription_problems) ? intervention.prescription_problems : (intervention.prescription_problems ? [intervention.prescription_problems] : []);
  const interActionsList = Array.isArray(intervention.action_taken) ? intervention.action_taken : (intervention.action_taken ? [intervention.action_taken] : []);
  const interRecsList = Array.isArray(intervention.recommendations) ? intervention.recommendations : (intervention.recommendations ? [intervention.recommendations] : []);
  const interPrescriptionList = Array.isArray(intervention.prescription_details) ? intervention.prescription_details : [];

  // ADR Data
  const adrSuspectedList = Array.isArray(adr.suspected_medications) ? adr.suspected_medications : [];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`Generate Official Approved Record`}
      subtitle={`Case ID: ${caseId}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 text-xs p-1">
        {/* HEADER BANNER */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-300">Official Clinical Record Approved</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Generate and download official approved clinical documentation.</p>
          </div>
        </div>

        {/* GENERATE / DOWNLOAD BUTTON CARDS */}
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
            <p className="font-semibold text-slate-500">Loading Clinical Case Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* DOWNLOAD PPT CARD */}
            <div className="border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/40 dark:to-orange-950/20 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Presentation className="w-5 h-5" />
                </div>
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">PPT Presentation</h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">Editable presentation slides (.pptx) formatted for clinical case discussion.</p>
              </div>

              <button
                onClick={handleDownloadPPT}
                disabled={exportingPPT || loading}
                className="w-full py-3 px-4 rounded-xl border border-amber-400 dark:border-amber-700 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {exportingPPT ? <Loader2 className="w-4 h-4 animate-spin" /> : <Presentation className="w-4 h-4" />}
                <span>{exportingPPT ? 'Generating PPT...' : 'Download PPT (.pptx)'}</span>
              </button>
            </div>

            {/* DOWNLOAD PDF CARD */}
            <div className="border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Download className="w-5 h-5" />
                </div>
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">Official Clinical PDF</h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">High-resolution vector PDF document (.pdf) with full clinical documentation.</p>
              </div>

              <button
                onClick={handleDownloadPDF}
                disabled={downloading || loading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
