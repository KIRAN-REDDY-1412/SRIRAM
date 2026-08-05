import React from 'react';
import { X, Printer, ShieldAlert } from 'lucide-react';

export const PharmacistInterventionPDFPreviewModal = ({ isOpen, onClose, clinicalCase, student, intervention }) => {
  if (!isOpen) return null;

  const collegeName = student?.colleges?.college_name || 'A.M. REDDY MEMORIAL COLLEGE OF PHARMACY';
  const formCode = `ARMN-LSSH/26-27/ ${clinicalCase?.case_id || '001'} /PIF-`;

  const ALL_PRESCRIPTION_PROBLEMS = [
    'Allergy', 'Prior ADR', 'Contraindication',
    'Drug Interaction', 'Unnecessary Drug', 'Wrong Drug',
    'Incomplete Rx', 'Duplication', 'Excessive Duration',
    'High Dose', 'Low Dose'
  ];

  const ALL_ACTIONS_TAKEN = [
    'Discussion with prescriber',
    'Discussion with nurse',
    'Drug information reference consulted',
    'Discussion with patient',
    'Discussion with patient representative'
  ];

  const ALL_RECOMMENDATIONS = [
    'Drug', 'Dose', 'Duration', 'Form/Route', 'Schedule'
  ];

  const handlePrint = () => {
    window.print();
  };

  const rxDetails = intervention?.prescription_details || [];
  const rxProblems = intervention?.prescription_problems || [];
  const actionsTaken = intervention?.action_taken || [];
  const recommendations = intervention?.recommendations || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL ACTION BAR */}
        <div className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold tracking-tight">Pharmacist Intervention Form (2-Page PDF Preview)</h3>
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

        {/* PDF DOCUMENT WRAPPER (MATCHES EXACT UPLOADED 2-PAGE FORM) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 font-serif text-slate-900 space-y-8">
          
          {/* ================= PAGE 1 ================= */}
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
              <span className="text-center font-serif text-sm font-extrabold underline tracking-widest block">PHARMACIST INTERVENTION FORM</span>
              <span>Case: {clinicalCase?.case_id}</span>
            </div>

            {/* PATIENT INFORMATION */}
            <div className="space-y-2 border-b border-slate-900 pb-4">
              <div className="flex justify-between font-bold">
                <span>Patient name: <span className="underline font-extrabold">{intervention?.patient_name || '—'}</span></span>
                <span>Age: <span className="font-mono underline">{intervention?.age || '—'}</span></span>
                <span>Sex: <span className="underline">{intervention?.sex || '—'}</span></span>
                <span>Date of intervention: <span className="font-mono underline">{intervention?.date_of_intervention || '—'}</span></span>
              </div>

              <div className="flex justify-between font-bold">
                <span>IP/OP No: <span className="font-mono underline">{intervention?.ip_op_no || '—'}</span></span>
                <span>Ward: <span className="underline">{intervention?.ward || '—'}</span></span>
              </div>

              <div className="font-bold pt-1">
                Present diagnosis: <span className="underline italic">{intervention?.present_diagnosis || 'N/A'}</span>
              </div>
            </div>

            {/* PRESCRIPTION DETAILS TABLE */}
            <div>
              <strong className="font-bold text-xs uppercase block font-serif mb-2">Prescription details:</strong>
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900 text-left font-bold">
                    <th className="p-2 border-r border-slate-900 w-12 text-center">S. No</th>
                    <th className="p-2 border-r border-slate-900">Name of the drug</th>
                    <th className="p-2">Dose & Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {rxDetails.length > 0 ? (
                    rxDetails.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-900 font-mono">
                        <td className="p-2 border-r border-slate-900 text-center font-bold">{row.s_no || idx + 1}</td>
                        <td className="p-2 border-r border-slate-900 font-serif font-bold">{row.drug_name}</td>
                        <td className="p-2 font-bold">{row.dose_frequency}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-slate-900">
                      <td colSpan={3} className="p-4 text-center text-slate-500 italic">No prescription drugs added.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PRESCRIPTION PROBLEM */}
            <div>
              <strong className="font-bold text-xs uppercase block font-serif mb-2">Prescription problem (check all that apply):</strong>
              <div className="grid grid-cols-4 gap-2 p-3 border border-slate-900 bg-slate-50/30">
                {ALL_PRESCRIPTION_PROBLEMS.map((prob, idx) => {
                  const isChecked = rxProblems.includes(prob);
                  return (
                    <div key={idx} className="flex items-center gap-1.5 font-serif text-xs">
                      <span className="font-extrabold">{isChecked ? '[ ✓ ]' : '[  ]'}</span>
                      <span className={isChecked ? 'font-bold text-slate-900' : 'text-slate-600'}>{prob}</span>
                    </div>
                  );
                })}
                {intervention?.prescription_problem_other && (
                  <div className="col-span-4 pt-1 border-t border-slate-300 font-serif">
                    Others (specify): <span className="underline italic">{intervention.prescription_problem_other}</span>
                  </div>
                )}
              </div>
            </div>

            {/* DESCRIPTION OF PROBLEM */}
            <div>
              <strong className="font-bold text-xs uppercase block font-serif mb-1">Description of problem:</strong>
              <p className="p-3 border border-slate-900 rounded-xs min-h-[60px] bg-slate-50/50 whitespace-pre-line font-serif">
                {intervention?.description_of_problem || 'N/A'}
              </p>
            </div>

            <div className="text-right text-[10px] font-mono text-slate-400">Page 1 of 2</div>
          </div>


          {/* ================= PAGE 2 ================= */}
          <div className="bg-white p-6 sm:p-10 max-w-3xl mx-auto border-2 border-slate-900 shadow-xl space-y-6 text-xs text-slate-900 leading-normal">
            
            <div className="flex justify-between items-center text-[11px] font-mono font-bold border-b border-slate-900 pb-2">
              <span>Form Ref: {formCode}</span>
              <span className="font-serif text-xs font-bold uppercase">Pharmacist Intervention Form (Continued)</span>
              <span>Case: {clinicalCase?.case_id}</span>
            </div>

            {/* ACTION TAKEN */}
            <div>
              <strong className="font-bold text-xs uppercase block font-serif mb-2">Action Taken (check all that apply):</strong>
              <div className="grid grid-cols-2 gap-2 p-3 border border-slate-900 bg-slate-50/30">
                {ALL_ACTIONS_TAKEN.map((act, idx) => {
                  const isChecked = actionsTaken.includes(act);
                  return (
                    <div key={idx} className="flex items-center gap-1.5 font-serif text-xs">
                      <span className="font-extrabold">{isChecked ? '[ ✓ ]' : '[  ]'}</span>
                      <span className={isChecked ? 'font-bold text-slate-900' : 'text-slate-600'}>{act}</span>
                    </div>
                  );
                })}
                {intervention?.action_taken_other && (
                  <div className="col-span-2 pt-1 border-t border-slate-300 font-serif">
                    Others (specify): <span className="underline italic">{intervention.action_taken_other}</span>
                  </div>
                )}
              </div>
            </div>

            {/* RECOMMENDATIONS */}
            <div>
              <strong className="font-bold text-xs uppercase block font-serif mb-2">Recommendations (check all that apply):</strong>
              <div className="grid grid-cols-3 gap-2 p-3 border border-slate-900 bg-slate-50/30">
                {ALL_RECOMMENDATIONS.map((rec, idx) => {
                  const isChecked = recommendations.includes(rec);
                  return (
                    <div key={idx} className="flex items-center gap-1.5 font-serif text-xs">
                      <span className="font-extrabold">{isChecked ? '[ ✓ ]' : '[  ]'}</span>
                      <span className={isChecked ? 'font-bold text-slate-900' : 'text-slate-600'}>Change: {rec}</span>
                    </div>
                  );
                })}
                {intervention?.recommendation_other && (
                  <div className="col-span-3 pt-1 border-t border-slate-300 font-serif">
                    Others (Specify): <span className="underline italic">{intervention.recommendation_other}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CHECKLIST QUESTIONS */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 font-serif">
              <div className="flex justify-between">
                <span>Specific background information collected?</span>
                <strong className="font-mono">{intervention?.background_info_collected ? '[ YES ]' : '[ NO ]'}</strong>
              </div>

              <div className="flex justify-between">
                <span>Problem identified discussed with concerned physician?</span>
                <strong className="font-mono">{intervention?.discussed_with_physician ? '[ YES ]' : '[ NO ]'}</strong>
              </div>

              <div className="flex justify-between">
                <span>Suggestions made at appropriate time:</span>
                <strong className="font-mono">{intervention?.suggestions_appropriate_time ? '[ YES ]' : '[ NO ]'}</strong>
              </div>

              <div className="flex justify-between">
                <span>Accepted:</span>
                <strong className="font-mono">{intervention?.accepted ? '[ YES ]' : '[ NO ]'}</strong>
              </div>

              <div className="flex justify-between">
                <span>Changed:</span>
                <strong className="font-mono">{intervention?.changed ? '[ YES ]' : '[ NO ]'}</strong>
              </div>

              {(!intervention?.accepted || !intervention?.changed) && intervention?.reasons_if_no && (
                <div className="pt-1 border-t border-slate-300">
                  <strong>If no, give reason(s):</strong> <span className="italic">{intervention.reasons_if_no}</span>
                </div>
              )}
            </div>

            {/* ASSESSMENT & OUTCOME */}
            <div className="space-y-3">
              <div className="font-bold flex gap-6 font-serif">
                <span>Significance of intervention:</span>
                <span className="underline font-black text-emerald-800">[ {intervention?.significance_of_intervention || 'Moderate'} ]</span>
              </div>

              <div className="font-bold flex gap-6 font-serif">
                <span>Outcome:</span>
                <span className="underline font-black text-emerald-800">[ {intervention?.outcome || 'Positive'} ]</span>
              </div>
            </div>

            {/* REFERENCES */}
            <div>
              <strong className="font-bold text-xs uppercase block font-serif mb-1">References:</strong>
              <p className="p-2 border border-slate-900 rounded-xs min-h-[40px] bg-slate-50/50 font-serif italic">
                {intervention?.references_text || 'Standard Clinical Pharmacology references.'}
              </p>
            </div>

            {/* FOLLOW UP */}
            <div>
              <strong className="font-bold text-xs uppercase block font-serif mb-1">Follow up:</strong>
              <p className="p-2 border border-slate-900 rounded-xs min-h-[40px] bg-slate-50/50 font-serif">
                {intervention?.follow_up || 'Patient monitored daily during ward rounds.'}
              </p>
            </div>

            {/* SIGNATURES */}
            <div className="pt-8 flex justify-between items-center text-xs font-bold font-serif">
              <div className="border-t border-slate-900 pt-1 w-48 text-center">
                Signature of Student
                <span className="block text-[10px] font-mono font-normal text-slate-600">{student?.full_name} ({student?.roll_number})</span>
              </div>

              <div className="border-t border-slate-900 pt-1 w-48 text-center">
                Signature of Preceptor
                <span className="block text-[10px] font-mono font-normal text-slate-600">Assigned Faculty Preceptor</span>
              </div>
            </div>

            <div className="text-right text-[10px] font-mono text-slate-400">Page 2 of 2</div>
          </div>

        </div>

      </div>
    </div>
  );
};
