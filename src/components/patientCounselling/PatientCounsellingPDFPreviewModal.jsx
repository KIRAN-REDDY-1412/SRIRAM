import React from 'react';
import { X, Printer, Stethoscope, CheckSquare, Square } from 'lucide-react';

export const PatientCounsellingPDFPreviewModal = ({ isOpen, onClose, clinicalCase, student, counselling }) => {
  if (!isOpen) return null;

  const collegeName = student?.colleges?.college_name || 'A.M. REDDY MEMORIAL COLLEGE OF PHARMACY';
  const formCode = `ARMN-LSSH/26-27/ ${clinicalCase?.case_id || '001'} /PCF-`;

  const ALL_POINTS_COVERED = [
    'Name and purpose of medication',
    'Dosage regimen',
    'Advice on missed dose',
    'Potential side effects',
    'Significant interactions (Drug-Drug, Drug-food, drug-Disease)',
    'Precautions to be taken',
    'Storage recommendations',
    'Benefits of completing case',
    'Life style modifications'
  ];

  const handlePrint = () => {
    window.print();
  };

  const pointsCoveredArray = counselling?.points_covered || [];
  const representativeReasonsArray = counselling?.representative_reasons || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL ACTION BAR */}
        <div className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold tracking-tight">Patient Counselling Documentation Form (PDF Preview)</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
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

        {/* PDF DOCUMENT WRAPPER (MATCHES EXACT UPLOADED PATIENT COUNSELLING FORM) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 font-serif text-slate-900">
          
          <div className="bg-white p-6 sm:p-10 max-w-3xl mx-auto border-2 border-slate-900 shadow-xl space-y-6 text-xs text-slate-900 leading-normal">
            
            {/* INSTITUTIONAL HEADER */}
            <div className="border-2 border-slate-900 p-4 text-center space-y-1">
              <h1 className="text-base sm:text-lg font-black uppercase tracking-wide border-b-2 border-slate-900 pb-1">
                {collegeName}
              </h1>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                LALITHA SUPERSPECIALITIES HOSPITAL
              </h2>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono font-bold">
              <span>Form Ref: {formCode}</span>
              <span className="text-center font-serif text-sm font-extrabold underline tracking-widest block">PATIENT COUNSELLING DOCUMENTATION FORM</span>
              <span>Case: {clinicalCase?.case_id}</span>
            </div>

            {/* SESSION & PATIENT INFORMATION */}
            <div className="space-y-2 border-b border-slate-900 pb-4">
              <div className="flex justify-between font-bold">
                <span>Date: <span className="font-mono underline">{counselling?.counselling_date || '—'}</span></span>
                <span>Time: <span className="font-mono underline">{counselling?.counselling_time || '—'}</span></span>
                <span>Type of Patient: <span className="underline">{counselling?.patient_type || 'In patient'}</span></span>
              </div>

              <div className="flex justify-between font-bold">
                <span>IP/ OP Number: <span className="font-mono underline">{counselling?.ip_op_number || '—'}</span></span>
                <span>Unit/ Ward: <span className="underline">{counselling?.unit_ward || '—'}</span></span>
              </div>

              <div className="flex justify-between font-bold">
                <span>Age: <span className="font-mono underline">{counselling?.age || '—'}</span></span>
                <span>Sex: <span className="underline">{counselling?.sex || '—'}</span></span>
                <span>Allergies: <span className="underline">{counselling?.allergies || 'None'}</span></span>
              </div>

              <div className="font-bold pt-1">
                Other patient's specific background information collected? {' '}
                <span className="underline font-extrabold">{counselling?.specific_background_collected ? '[ Yes ]' : '[ No ]'}</span>
              </div>
            </div>

            {/* DISEASE & MEDICATIONS COUNSELLED */}
            <div className="space-y-3">
              <div>
                <strong className="font-bold text-xs uppercase block font-serif">Disease counselled:</strong>
                <p className="p-2 border border-slate-900 rounded-xs min-h-[40px] bg-slate-50/50 whitespace-pre-line font-serif">
                  {counselling?.disease_counselled || 'N/A'}
                </p>
              </div>

              <div>
                <strong className="font-bold text-xs uppercase block font-serif">Medications counselled:</strong>
                <p className="p-2 border border-slate-900 rounded-xs min-h-[40px] bg-slate-50/50 whitespace-pre-line font-serif font-mono font-bold">
                  {counselling?.medications_counselled || 'N/A'}
                </p>
              </div>
            </div>

            {/* POINTS COVERED DURING COUNSELLING SESSION */}
            <div>
              <strong className="font-bold text-xs uppercase block font-serif mb-2">Points covered during counselling session:</strong>
              <div className="grid grid-cols-2 gap-2 p-3 border border-slate-900 bg-slate-50/30">
                {ALL_POINTS_COVERED.map((pt, i) => {
                  const isChecked = pointsCoveredArray.includes(pt);
                  return (
                    <div key={i} className="flex items-center gap-2 font-serif text-xs">
                      <span className="font-extrabold">{isChecked ? '[ ✓ ]' : '[  ]'}</span>
                      <span className={isChecked ? 'font-bold text-slate-900' : 'text-slate-600'}>{pt}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BARRIERS & OVERCOME */}
            <div className="space-y-2 border-t border-b border-slate-900 py-3">
              <div className="flex justify-between font-bold">
                <span>Any major barriers involved: <span className="underline font-extrabold">{counselling?.major_barriers_involved ? '[ Yes ]' : '[ No ]'}</span></span>
                {counselling?.major_barriers_involved && (
                  <span>If yes, whether barrier was rightly overcome? <span className="underline font-extrabold">{counselling?.barrier_overcome ? '[ Yes ]' : '[ No ]'}</span></span>
                )}
              </div>

              {counselling?.major_barriers_involved && counselling?.barrier_details && (
                <div className="font-serif">
                  <strong>If Yes, Specify:</strong> <span className="italic">{counselling.barrier_details}</span>
                </div>
              )}
            </div>

            {/* COUNSELLING DURATION & RECIPIENT */}
            <div className="space-y-3">
              <div className="font-bold">
                Time taken for counselling: {' '}
                <span className="underline font-extrabold">{counselling?.time_taken || '10 to 20 min.'}</span>
              </div>

              <div className="font-bold">
                Counselling provided to: {' '}
                <span className="underline font-extrabold">{counselling?.counselling_provided_to || 'Patient'}</span>
              </div>

              {counselling?.counselling_provided_to === 'Patient representative' && (
                <div className="p-3 border border-slate-900 bg-slate-50/50 space-y-1">
                  <strong className="font-bold block">If patient's representative, give reason:</strong>
                  <div className="flex flex-wrap gap-4 pt-1">
                    {['Patient is unconscious', 'Hearing problem', 'Language problem', 'Pediatric patient'].map((r, i) => (
                      <span key={i} className="font-serif">
                        {representativeReasonsArray.includes(r) ? '[ ✓ ]' : '[  ]'} {r}
                      </span>
                    ))}
                    {counselling?.representative_other_reason && (
                      <span className="font-serif">Other: {counselling.representative_other_reason}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* AIDS & MATERIALS */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong className="font-bold text-xs uppercase block font-serif">Counselling aids used:</strong>
                <p className="p-2 border border-slate-900 rounded-xs min-h-[36px] bg-slate-50/50 font-serif">
                  {counselling?.counselling_aids_used || 'None'}
                </p>
              </div>

              <div>
                <strong className="font-bold text-xs uppercase block font-serif">Counselling material provided:</strong>
                <p className="p-2 border border-slate-900 rounded-xs min-h-[36px] bg-slate-50/50 font-serif">
                  {counselling?.counselling_material_provided || 'None'}
                </p>
              </div>
            </div>

            {/* UNDERSTANDING ASCERTAINED & SIGNATURES */}
            <div className="pt-2 space-y-8">
              <div className="font-bold text-sm">
                Understanding of the patient ascertained: {' '}
                <span className="underline font-black">{counselling?.understanding_ascertained ? '[ Yes ]' : '[ No ]'}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-bold font-serif">
                <div className="border-t border-slate-900 pt-1 w-48 text-center">
                  Patient Signature
                  <span className="block text-[10px] font-mono font-normal text-slate-600">Patient / Representative</span>
                </div>

                <div className="border-t border-slate-900 pt-1 w-48 text-center">
                  Pharmacist's Signature
                  <span className="block text-[10px] font-mono font-normal text-slate-600">{student?.full_name} ({student?.roll_number})</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
