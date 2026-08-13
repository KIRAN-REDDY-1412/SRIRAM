import React, { useState, useEffect } from 'react';
import { Download, X, Eye, Loader2, CheckCircle2, ShieldCheck, FileCheck2, Presentation } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { fetchCaseModuleStatusesFromSupabase, fetchDocumentBrandingSettingsFromSupabase, fetchCollegeByIdFromSupabase } from '../../services/supabaseService';
import { ModalWrapper } from './ModalWrapper';
import { PharmDVerseBrandedDocumentContainer } from '../branding/PharmDVerseBrandedDocumentContainer';
import { ClinicalCaseDocumentRenderer } from '../branding/ClinicalCaseDocumentRenderer';
import { generateClinicalCasePPTX } from '../../utils/generateClinicalCasePPTX';

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
    const element = document.getElementById('official-clinical-case-pdf-container');
    if (!element) return;

    setDownloading(true);
    let wrapper = null;
    try {
      const isLandscape = branding?.orientation?.toLowerCase() === 'landscape';
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: branding?.paper_size?.toLowerCase() === 'letter' ? 'letter' : 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Create an off-screen wrapper for capturing pure white A4 pages without web modal artifacts
      wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '-9999px';
      wrapper.style.width = isLandscape ? '297mm' : '210mm';
      wrapper.style.backgroundColor = '#ffffff';
      wrapper.style.color = '#0f172a';
      wrapper.style.zIndex = '-9999';
      document.body.appendChild(wrapper);

      // Clone target document into wrapper
      const clone = element.cloneNode(true);
      wrapper.appendChild(clone);

      const pageElements = clone.querySelectorAll('.pharmdverse-document-page');
      const pagesToCapture = pageElements.length > 0 ? Array.from(pageElements) : [clone];

      let isFirstPdfPage = true;

      for (let i = 0; i < pagesToCapture.length; i++) {
        const targetEl = pagesToCapture[i];

        // Sanitize styles to enforce pristine white background and clear A4 margins
        targetEl.style.width = isLandscape ? '297mm' : '210mm';
        targetEl.style.minHeight = isLandscape ? '210mm' : '297mm';
        targetEl.style.height = 'auto';
        targetEl.style.backgroundColor = '#ffffff';
        targetEl.style.color = '#0f172a';
        targetEl.style.boxShadow = 'none';
        targetEl.style.border = 'none';
        targetEl.style.margin = '0 auto';
        targetEl.style.transform = 'none';
        targetEl.style.overflow = 'visible';

        const innerScrolls = targetEl.querySelectorAll('.overflow-y-auto, .overflow-auto, [class*="max-h-"]');
        innerScrolls.forEach(s => {
          s.style.maxHeight = 'none';
          s.style.overflow = 'visible';
          s.style.height = 'auto';
        });

        const imgs = targetEl.querySelectorAll('img');
        imgs.forEach(img => {
          img.crossOrigin = 'anonymous';
        });

        let pageCanvas;
        try {
          pageCanvas = await html2canvas(targetEl, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: isLandscape ? 1123 : 850,
            scrollX: 0,
            scrollY: 0
          });
        } catch (cErr) {
          pageCanvas = await html2canvas(targetEl, {
            scale: 1.5,
            useCORS: false,
            allowTaint: false,
            logging: false,
            backgroundColor: '#ffffff'
          });
        }

        const canvasWidth = pageCanvas.width;
        const canvasHeight = pageCanvas.height;
        const pagePdfHeight = (canvasHeight * pdfWidth) / canvasWidth;

        let imgData;
        try {
          imgData = pageCanvas.toDataURL('image/jpeg', 0.98);
        } catch (dataErr) {
          const fallbackCanvas = document.createElement('canvas');
          fallbackCanvas.width = canvasWidth;
          fallbackCanvas.height = canvasHeight;
          const fCtx = fallbackCanvas.getContext('2d');
          fCtx.fillStyle = '#ffffff';
          fCtx.fillRect(0, 0, canvasWidth, canvasHeight);
          imgData = fallbackCanvas.toDataURL('image/jpeg', 0.98);
        }

        if (pagePdfHeight <= pdfHeight + 2) {
          if (!isFirstPdfPage) pdf.addPage();
          isFirstPdfPage = false;
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pagePdfHeight, undefined, 'FAST');
        } else {
          // Multi-page slicing if content height exceeds 1 A4 page
          const sliceHeightPx = Math.floor((canvasWidth * pdfHeight) / pdfWidth);
          let currentY = 0;

          while (currentY < canvasHeight) {
            if (!isFirstPdfPage) pdf.addPage();
            isFirstPdfPage = false;

            const sliceH = Math.min(sliceHeightPx, canvasHeight - currentY);
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvasWidth;
            sliceCanvas.height = sliceH;
            const ctx = sliceCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasWidth, sliceH);
            ctx.drawImage(pageCanvas, 0, currentY, canvasWidth, sliceH, 0, 0, canvasWidth, sliceH);

            let sliceImgData;
            try {
              sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.98);
            } catch (e) {
              sliceImgData = imgData;
            }
            const slicePdfH = (sliceH * pdfWidth) / canvasWidth;
            pdf.addImage(sliceImgData, 'JPEG', 0, 0, pdfWidth, slicePdfH, undefined, 'FAST');

            currentY += sliceHeightPx;
          }
        }
      }

      // Stamp dynamic total page numbers on footer
      const totalPdfPages = pdf.getNumberOfPages();
      if (branding?.show_page_number !== false) {
        for (let p = 1; p <= totalPdfPages; p++) {
          pdf.setPage(p);
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          pdf.text(`Page ${p} of ${totalPdfPages}`, pdfWidth - 25, pdfHeight - 6);
        }
      }

      // DIRECT FILE DOWNLOAD
      pdf.save(fileName);
    } catch (err) {
      console.error('Failed to generate Official PDF:', err);
    } finally {
      if (wrapper && wrapper.parentNode) {
        try {
          wrapper.parentNode.removeChild(wrapper);
        } catch (cleanErr) {}
      }
      setDownloading(false);
    }
  };

  const [exportingPPT, setExportingPPT] = useState(false);
  const handleDownloadPPT = async () => {
    setExportingPPT(true);
    try {
      await generateClinicalCasePPTX({
        clinicalCase,
        student,
        preceptor,
        college: finalCollegeObj,
        caseModulesData,
        pptSettings: branding
      });
    } catch (err) {
      console.error('Failed to generate PPT presentation:', err);
      alert('Could not export PPT presentation. Please try again.');
    } finally {
      setExportingPPT(false);
    }
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
      title={`Official Approved PDF Record`}
      subtitle={`Document: ${fileName}`}
      maxWidth={branding?.orientation === 'Landscape' ? 'max-w-6xl' : 'max-w-4xl'}
    >
      <div className="space-y-4 text-xs">
        {/* TOP ACTION BAR */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Official Clinical Record Approved</h4>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Official PDF document with complete multi-page clinical student documentation.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPPT}
              disabled={exportingPPT || loading}
              className="px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-xs"
              title="Generate & Download Editable PowerPoint Presentation (.pptx)"
            >
              {exportingPPT ? <Loader2 className="w-4 h-4 animate-spin" /> : <Presentation className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              <span>{exportingPPT ? 'Generating PPT...' : 'Download PPT (.pptx)'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading || loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              title="Generate & Download Official Multi-Page PDF Document"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE MULTI-PAGE CONTAINER */}
        <div className="max-h-[65vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 print:border-none print:bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-100 dark:bg-slate-900/50">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
              <p className="font-semibold text-slate-500">Compiling Official Approved Clinical Case Record...</p>
            </div>
          ) : (
            <ClinicalCaseDocumentRenderer
              caseData={{
                clinicalCase,
                student,
                preceptor,
                college: finalCollegeObj,
                caseModulesData
              }}
              branding={branding}
              college={finalCollegeObj}
              student={student}
              preceptor={preceptor}
            />
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
