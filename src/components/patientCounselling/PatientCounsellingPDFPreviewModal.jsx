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
  const representativeReasons = counsellingData?.representative_reasons || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL ACTION BAR */}
        <div className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-extrabold tracking-tight">Patient Counselling Documentation (A4 Print / PDF Preview)</h3>
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
            {/* 1. COUNSELLING METADATA & PATIENT INFORMATION */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 text-xs font-bold">
              <strong className="block border-b border-slate-900 pb-1 uppercase text-indigo-900">1. Patient & Session Details</strong>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span>Counselling Date: <span className="font-mono underline">{counsellingData?.counselling_date || '—'}</span></span>
                <span>Time: <span className="font-mono underline">{counsellingData?.counselling_time || '—'}</span></span>
                <span>Patient Type: <span className="underline">{counsellingData?.patient_type || 'In patient'}</span></span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div>IP/OP No: <span className="font-mono underline">{counsellingData?.ip_op_number || '—'}</span></div>
                <div>Ward/Unit: <span className="underline">{counsellingData?.unit_ward || '—'}</span></div>
                <div>Age / Sex: <span className="underline">{counsellingData?.age} yrs / {counsellingData?.sex}</span></div>
                <div>Allergies: <span className="underline text-rose-700">{counsellingData?.allergies || 'None'}</span></div>
              </div>

              <div className="pt-1">
                Specific Patient Background Collected: <span className="underline">{counsellingData?.specific_background_collected ? 'YES' : 'NO'}</span>
              </div>
            </div>

            {/* 2. DISEASE COUNSELLED */}
            <div className="space-y-1 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <strong className="block uppercase font-bold text-indigo-900 border-b border-slate-900 pb-1">2. Disease Counselled</strong>
              <p className="p-2 border border-slate-900 bg-white font-bold">{counsellingData?.disease_counselled || 'N/A'}</p>
            </div>

            {/* 3. MEDICATION COUNSELLED */}
            <div className="space-y-1 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <strong className="block uppercase font-bold text-indigo-900 border-b border-slate-900 pb-1">3. Medication Counselled</strong>
              <p className="p-2 border border-slate-900 bg-white font-bold">{counsellingData?.medications_counselled || 'N/A'}</p>
            </div>

            {/* 4. POINTS COVERED DURING COUNSELLING */}
            <div className="space-y-2 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1 text-slate-900">
                4. Points Covered During Counselling
              </strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-bold p-3 border border-slate-900 bg-slate-50/30">
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

            {/* 5. BARRIERS INVOLVED */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 text-xs font-bold">
              <strong className="block uppercase border-b border-slate-900 pb-1 text-slate-900">5. Barriers & Resolution</strong>
              <div className="flex justify-between">
                <span>Major Barriers Involved: <span className="underline">{counsellingData?.major_barriers_involved ? 'YES' : 'NO'}</span></span>
                <span>Barrier Overcome: <span className="underline">{counsellingData?.barrier_overcome ? 'YES' : 'NO'}</span></span>
              </div>
              {counsellingData?.barrier_details && (
                <div>Barrier Details: <span className="underline italic font-normal">{counsellingData.barrier_details}</span></div>
              )}
            </div>

            {/* 6. COUNSELLING DURATION & RECIPIENT */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 text-xs font-bold">
              <strong className="block uppercase border-b border-slate-900 pb-1 text-slate-900">6. Counselling Duration & Provided To</strong>
              <div className="flex justify-between">
                <span>Counselling Duration: <span className="font-mono underline">{counsellingData?.time_taken || '15 mins'}</span></span>
                <span>Counselling Provided To: <span className="underline">{counsellingData?.counselling_provided_to || 'Patient'}</span></span>
              </div>
              {counsellingData?.counselling_provided_to === 'Representative' && (
                <div className="pt-1">
                  Representative Reason: <span className="underline">{representativeReasons.join(', ')} {counsellingData?.representative_other_reason ? `(${counsellingData.representative_other_reason})` : ''}</span>
                </div>
              )}
            </div>

            {/* 7. COUNSELLING MATERIALS & AIDS */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 text-xs font-bold">
              <strong className="block uppercase border-b border-slate-900 pb-1 text-slate-900">7. Counselling Materials & Aids</strong>
              <div>Aids Used: <span className="underline font-normal">{counsellingData?.counselling_aids_used || 'Pictograms / Verbal'}</span></div>
              <div>Material Provided: <span className="underline font-normal">{counsellingData?.counselling_material_provided || 'Patient Information Leaflet (PIL)'}</span></div>
              <div>Understanding Ascertained: <span className="underline">{counsellingData?.understanding_ascertained ? 'YES' : 'NO'}</span></div>
            </div>
          </PharmDVerseBrandedDocumentContainer>

        </div>

      </div>
    </div>
  );
};
