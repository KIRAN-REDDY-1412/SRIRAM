import React from 'react';
import { X, Printer, ShieldAlert, FileText, Activity, AlertCircle, CheckCircle, Upload } from 'lucide-react';

export const ADRReportPreviewModal = ({ isOpen, onClose, clinicalCase, student, report, suspectedMeds, concomitantMeds, attachments }) => {
  if (!isOpen) return null;

  const collegeName = student?.colleges?.college_name || 'A.M. REDDY MEMORIAL COLLEGE OF PHARMACY';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL ACTION BAR */}
        <div className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold tracking-tight">PharmDVerse ADR Clinical Event Summary (Preview)</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Summary</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ORIGINAL SAAS-STYLED ADR DOCUMENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 text-xs">
            
            {/* BRANDING HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 block">
                  {collegeName}
                </span>
                <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  Adverse Drug Event Clinical Documentation
                </h1>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-right">
                <div className="font-mono font-extrabold text-amber-700 dark:text-amber-400 text-sm">
                  {report?.adr_number || 'ADR-2026-000001'}
                </div>
                <div className="text-[10px] text-slate-500">Status: <strong className="uppercase font-bold text-slate-800 dark:text-slate-200">{report?.approval_status || 'Draft'}</strong></div>
              </div>
            </div>

            {/* 1. GENERAL RECORD */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div><span className="text-slate-400 block">Reporting Date:</span><strong className="font-mono text-slate-800 dark:text-slate-200">{report?.reporting_date || '—'}</strong></div>
              <div><span className="text-slate-400 block">Linked Clinical Case:</span><strong className="font-mono text-emerald-600 dark:text-emerald-400">{clinicalCase?.case_id}</strong></div>
              <div><span className="text-slate-400 block">Reported By:</span><strong className="text-slate-800 dark:text-slate-200">{student?.full_name}</strong></div>
              <div><span className="text-slate-400 block">Assigned Preceptor:</span><strong className="text-slate-800 dark:text-slate-200">{report?.assigned_preceptor_name || 'Faculty Preceptor'}</strong></div>
            </div>

            {/* 2. PATIENT OVERVIEW */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-emerald-600 dark:text-emerald-400">
                Patient Demographics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div><span className="text-slate-400">Patient Initials:</span> <strong className="text-slate-800 dark:text-slate-200">{report?.patient_initials || '—'}</strong></div>
                <div><span className="text-slate-400">Hosp Reg No:</span> <strong className="font-mono text-slate-800 dark:text-slate-200">{report?.hospital_reg_number || '—'}</strong></div>
                <div><span className="text-slate-400">Age / Gender / Wt:</span> <strong className="text-slate-800 dark:text-slate-200">{report?.age} / {report?.gender} / {report?.weight} kg</strong></div>
                <div><span className="text-slate-400">Dept / Ward:</span> <strong className="text-slate-800 dark:text-slate-200">{report?.department} ({report?.ward})</strong></div>
                <div className="col-span-2 sm:col-span-4"><span className="text-slate-400">Primary Diagnosis:</span> <strong className="text-slate-800 dark:text-slate-200 italic">{report?.primary_diagnosis || 'N/A'}</strong></div>
              </div>
            </div>

            {/* 3. REACTION OVERVIEW */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-rose-600 dark:text-rose-400">
                Clinical Event Overview
              </h3>
              <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span className="text-sm">{report?.reaction_title || 'Untitled Adverse Reaction'}</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold">{report?.reaction_category || 'General'}</span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {report?.reaction_description || 'No reaction description provided.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-rose-200 dark:border-rose-900 text-[11px]">
                  <div><span className="text-slate-500">Onset:</span> <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{report?.reaction_started_at || '—'}</span></div>
                  <div><span className="text-slate-500">Resolution:</span> <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{report?.reaction_ended_at || '—'}</span></div>
                  <div><span className="text-slate-500">Duration:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{report?.reaction_duration || '—'}</span></div>
                  <div><span className="text-slate-500">Patient Condition:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{report?.current_patient_condition || '—'}</span></div>
                </div>

                {report?.clinical_management_provided && (
                  <div className="pt-2 text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Management Provided:</span> {report.clinical_management_provided}
                  </div>
                )}
              </div>
            </div>

            {/* 4. SUSPECTED MEDICATION TABLE */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-amber-600 dark:text-amber-400">
                Suspected Medication(s)
              </h3>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Medicine</th>
                      <th className="p-2.5">Generic</th>
                      <th className="p-2.5">Dose & Route</th>
                      <th className="p-2.5">Therapy Dates</th>
                      <th className="p-2.5">Indication</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {suspectedMeds.length > 0 ? (
                      suspectedMeds.map((m, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">{m.medicine_name}</td>
                          <td className="p-2.5 text-slate-500">{m.generic_name || '—'}</td>
                          <td className="p-2.5 font-mono">{m.dose} ({m.route} / {m.frequency})</td>
                          <td className="p-2.5 font-mono text-[11px]">{m.start_date} to {m.stop_date || 'Ongoing'}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">{m.clinical_indication || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="p-4 text-center text-slate-400 italic">No suspected medications listed.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. CONCOMITANT MEDICATIONS */}
            {concomitantMeds.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-slate-500">
                  Other Concurrent Medications
                </h3>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Medicine</th>
                        <th className="p-2">Dose / Freq</th>
                        <th className="p-2">Purpose</th>
                        <th className="p-2">Dates</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {concomitantMeds.map((m, i) => (
                        <tr key={i}>
                          <td className="p-2 font-bold text-slate-800 dark:text-slate-200">{m.medicine_name}</td>
                          <td className="p-2 font-mono">{m.dose} ({m.frequency})</td>
                          <td className="p-2 text-slate-500">{m.purpose || '—'}</td>
                          <td className="p-2 font-mono text-[10px]">{m.start_date} to {m.stop_date || 'Ongoing'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. PATIENT BACKGROUND & ASSESSMENT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase border-b border-slate-200 dark:border-slate-700 pb-1">
                  Patient Background & Allergies
                </h4>
                <div><span className="text-slate-400">Drug Allergy History:</span> <span className="font-semibold text-rose-600 dark:text-rose-400">{report?.drug_allergy_history || 'None'}</span></div>
                <div><span className="text-slate-400">Previous ADR History:</span> <span className="font-semibold">{report?.previous_adr_history || 'None'}</span></div>
                <div><span className="text-slate-400">Pregnancy / Lactation:</span> <span>{report?.pregnancy_lactation_status || 'N/A'}</span></div>
                <div><span className="text-slate-400">Renal & Hepatic Status:</span> <span>Renal: {report?.renal_status || 'Normal'} | Hepatic: {report?.hepatic_status || 'Normal'}</span></div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase border-b border-indigo-200 dark:border-indigo-900 pb-1">
                  Pharmacovigilance Assessment
                </h4>
                <div><span className="text-slate-400">Severity:</span> <strong className="font-extrabold text-indigo-700 dark:text-indigo-300">{report?.reaction_severity || 'Moderate'}</strong></div>
                <div><span className="text-slate-400">Seriousness:</span> <strong className="font-bold">{report?.reaction_seriousness || 'Non-serious'}</strong></div>
                <div><span className="text-slate-400">Patient Outcome:</span> <strong className="font-bold text-emerald-600 dark:text-emerald-400">{report?.patient_outcome || 'Recovered'}</strong></div>
                <div><span className="text-slate-400">Action Taken:</span> <span>{report?.action_taken_on_suspected_drug || 'Withdrawn'}</span></div>
                <div><span className="text-slate-400">Causality Opinion:</span> <strong className="font-mono text-indigo-600 dark:text-indigo-400">{report?.initial_causality_opinion || 'Probable/Likely'}</strong></div>
              </div>
            </div>

            {/* ATTACHMENTS SUMMARY */}
            {attachments.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <strong className="font-bold block text-slate-700 dark:text-slate-300">Supporting Attachments ({attachments.length}):</strong>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono">
                      📎 {att.file_name} ({att.file_type})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEW & SIGNATURES */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-semibold">
              <div className="text-slate-500">
                Documented by: <strong className="text-slate-800 dark:text-slate-200">{student?.full_name} ({student?.roll_number})</strong>
              </div>

              <div className="text-right text-slate-500">
                Reviewed by: <strong className="text-slate-800 dark:text-slate-200">{report?.assigned_preceptor_name || 'Assigned Faculty Preceptor'}</strong>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
