import React, { useState, useEffect } from 'react';
import { X, Printer, ShieldAlert } from 'lucide-react';
import { fetchDocumentBrandingSettingsFromSupabase } from '../../services/supabaseService';
import { PharmDVerseBrandedDocumentContainer } from '../branding/PharmDVerseBrandedDocumentContainer';

export const PharmacistInterventionPDFPreviewModal = ({ isOpen, onClose, clinicalCase, student, interventionData }) => {
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    const loadBranding = async () => {
      if (student?.college_id) {
        const res = await fetchDocumentBrandingSettingsFromSupabase(student.college_id);
        if (res.success && res.settings) {
          setBranding(res.settings);
        }
      }
    };
    if (isOpen) loadBranding();
  }, [isOpen, student]);

  if (!isOpen) return null;

  const college = student?.colleges;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL ACTION BAR */}
        <div className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-extrabold tracking-tight">Pharmacist Intervention Documentation (A4 PDF Preview)</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF DOCUMENT WRAPPER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 font-serif text-slate-900 space-y-8">
          
          <PharmDVerseBrandedDocumentContainer
            college={college}
            branding={branding}
            documentTitle="Pharmacist Intervention Documentation"
            caseId={clinicalCase?.case_id}
            student={student}
            pageNumber="1 of 1"
          >
            {/* PATIENT METADATA */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 font-bold">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>Patient Name: <span className="underline">{interventionData?.patient_name || '—'}</span></div>
                <div>Age / Sex: <span className="underline">{interventionData?.age} yrs / {interventionData?.sex}</span></div>
                <div>Date: <span className="font-mono underline">{interventionData?.date_of_intervention || '—'}</span></div>
                <div>IP/OP No: <span className="font-mono underline">{interventionData?.ip_op_no || '—'}</span></div>
              </div>
              <div className="pt-1">
                Diagnosis: <span className="underline italic font-normal">{interventionData?.present_diagnosis || 'N/A'}</span>
              </div>
            </div>

            {/* PROBLEM DESCRIPTION */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20">
              <strong className="block uppercase text-teal-900 font-bold">Description of Problem / Drug Interaction:</strong>
              <p className="p-2 border border-slate-900 bg-white font-serif font-bold text-slate-900">
                {interventionData?.description_of_problem || 'N/A'}
              </p>
            </div>

            {/* INTERVENTION OUTCOME & SIGNIFICANCE */}
            <div className="grid grid-cols-2 gap-3 border border-slate-900 p-3 bg-slate-50/30 font-bold">
              <div>Significance: <span className="underline text-indigo-900">{interventionData?.significance_of_intervention || 'Moderate'}</span></div>
              <div>Outcome: <span className="underline text-emerald-800">{interventionData?.outcome || 'Positive'}</span></div>
              <div>Accepted by Physician: <span className="underline">{interventionData?.accepted ? 'YES' : 'NO'}</span></div>
              <div>Therapy Changed: <span className="underline">{interventionData?.changed ? 'YES' : 'NO'}</span></div>
            </div>

            {/* REFERENCES & FOLLOW-UP */}
            {interventionData?.references_text && (
              <div className="space-y-1 border border-slate-900 p-3 font-serif">
                <strong className="block uppercase font-bold text-xs">References:</strong>
                <p className="italic">{interventionData.references_text}</p>
              </div>
            )}
          </PharmDVerseBrandedDocumentContainer>

        </div>

      </div>
    </div>
  );
};
