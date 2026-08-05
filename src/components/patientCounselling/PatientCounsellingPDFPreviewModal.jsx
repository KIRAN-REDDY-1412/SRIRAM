import React, { useState, useEffect } from 'react';
import { X, Printer, HeartHandshake } from 'lucide-react';
import { fetchDocumentBrandingSettingsFromSupabase } from '../../services/supabaseService';
import { PharmDVerseBrandedDocumentContainer } from '../branding/PharmDVerseBrandedDocumentContainer';

export const PatientCounsellingPDFPreviewModal = ({ isOpen, onClose, clinicalCase, student, counsellingData }) => {
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

  const pointsCovered = counsellingData?.points_covered || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL ACTION BAR */}
        <div className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-extrabold tracking-tight">Patient Counselling Documentation (A4 PDF Preview)</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
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
            documentTitle="Patient Counselling Documentation"
            caseId={clinicalCase?.case_id}
            student={student}
            pageNumber="1 of 1"
          >
            {/* COUNSELLING METADATA */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 font-bold">
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span>Date: <span className="font-mono underline">{counsellingData?.counselling_date || '—'}</span></span>
                <span>Time: <span className="font-mono underline">{counsellingData?.counselling_time || '—'}</span></span>
                <span>Patient Type: <span className="underline">{counsellingData?.patient_type || 'In patient'}</span></span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div>IP/OP No: <span className="font-mono underline">{counsellingData?.ip_op_number || '—'}</span></div>
                <div>Ward/Unit: <span className="underline">{counsellingData?.unit_ward || '—'}</span></div>
                <div>Age / Sex: <span className="underline">{counsellingData?.age} yrs / {counsellingData?.sex}</span></div>
                <div>Allergies: <span className="underline text-rose-700">{counsellingData?.allergies || 'None'}</span></div>
              </div>
            </div>

            {/* DISEASE & MEDICATIONS COUNSELLED */}
            <div className="space-y-3 border border-slate-900 p-3 bg-slate-50/20">
              <div>
                <strong className="block uppercase text-indigo-900">Disease Counselled:</strong>
                <p className="p-2 border border-slate-900 bg-white font-bold">{counsellingData?.disease_counselled || 'N/A'}</p>
              </div>

              <div>
                <strong className="block uppercase text-indigo-900">Medications Counselled:</strong>
                <p className="p-2 border border-slate-900 bg-white font-bold">{counsellingData?.medications_counselled || 'N/A'}</p>
              </div>
            </div>

            {/* COUNSELLING POINTS COVERED */}
            <div className="space-y-2">
              <strong className="block uppercase border-b border-slate-900 pb-1 text-slate-900">
                Points Covered During Counselling:
              </strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-bold text-xs p-3 border border-slate-900 bg-slate-50/30">
                {[
                  'Disease Process & Progression',
                  'Medication Name & Purpose',
                  'Dosage & Timing Schedule',
                  'Route of Administration',
                  'Duration of Therapy',
                  'Common Side Effects & Precautions',
                  'Dietary & Lifestyle Modifications',
                  'Storage Instructions',
                  'Missed Dose Management'
                ].map((pt, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span>{pointsCovered.includes(pt) ? '[ ✓ ]' : '[  ]'}</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BARRIERS & DURATION */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 font-bold">
              <div className="flex justify-between">
                <span>Barriers Involved: <span className="underline">{counsellingData?.major_barriers_involved ? 'YES' : 'NO'}</span></span>
                <span>Duration: <span className="font-mono underline">{counsellingData?.time_taken || '15 mins'}</span></span>
              </div>
              {counsellingData?.barrier_details && (
                <div>Barrier Details: <span className="underline italic font-normal">{counsellingData.barrier_details}</span></div>
              )}
            </div>

          </PharmDVerseBrandedDocumentContainer>

        </div>

      </div>
    </div>
  );
};
