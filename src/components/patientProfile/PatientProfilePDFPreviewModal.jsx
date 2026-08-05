import React, { useState, useEffect } from 'react';
import { X, Printer, UserCheck } from 'lucide-react';
import { fetchDocumentBrandingSettingsFromSupabase } from '../../services/supabaseService';
import { PharmDVerseBrandedDocumentContainer } from '../branding/PharmDVerseBrandedDocumentContainer';

export const PatientProfilePDFPreviewModal = ({ isOpen, onClose, clinicalCase, student, profile, labInvestigations, prescribedDrugs }) => {
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
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-extrabold tracking-tight">Patient Profile Documentation (A4 PDF Preview)</h3>
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
            documentTitle="Patient Profile Documentation"
            caseId={clinicalCase?.case_id}
            student={student}
            pageNumber="1 of 1"
          >
            {/* PATIENT DETAILS */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 font-bold">
              <strong className="block border-b border-slate-900 pb-1 uppercase">1. Patient Information</strong>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>Patient Name: <span className="underline">{profile?.patient_name || '—'}</span></div>
                <div>Age / Gender: <span className="underline">{profile?.age} yrs / {profile?.gender}</span></div>
                <div>IP No: <span className="font-mono underline">{profile?.ip_no || '—'}</span></div>
                <div>BMI: <span className="font-mono underline">{profile?.bmi || '—'}</span></div>
                <div>DOA: <span className="font-mono underline">{profile?.doa || '—'}</span></div>
                <div>DOC: <span className="font-mono underline">{profile?.doc || '—'}</span></div>
                <div>DOD: <span className="font-mono underline">{profile?.dod || '—'}</span></div>
                <div>Physician: <span className="underline">{profile?.physician || '—'}</span></div>
              </div>
            </div>

            {/* CHIEF COMPLAINTS & DIAGNOSIS */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20">
              <div>
                <strong className="block uppercase font-bold text-indigo-900">Chief Complaints:</strong>
                <p className="p-2 border border-slate-900 bg-white font-bold">{profile?.chief_complaints || 'N/A'}</p>
              </div>
              <div>
                <strong className="block uppercase font-bold text-indigo-900">Final Diagnosis:</strong>
                <p className="p-2 border border-slate-900 bg-white font-bold">{profile?.final_diagnosis || 'N/A'}</p>
              </div>
            </div>

            {/* DRUGS PRESCRIBED TABLE */}
            {prescribedDrugs && prescribedDrugs.length > 0 && (
              <div className="space-y-2">
                <strong className="block uppercase font-bold text-xs border-b border-slate-900 pb-1">
                  Drugs Prescribed:
                </strong>
                <table className="w-full text-left text-xs border border-slate-900 border-collapse">
                  <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-900">
                    <tr>
                      <th className="p-1.5 border-r border-slate-900">S.No</th>
                      <th className="p-1.5 border-r border-slate-900">Brand / Trade Name</th>
                      <th className="p-1.5 border-r border-slate-900">Generic Name</th>
                      <th className="p-1.5 border-r border-slate-900">Route & Dose</th>
                      <th className="p-1.5">Freq</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-serif">
                    {prescribedDrugs.map((d, i) => (
                      <tr key={i} className="border-b border-slate-900">
                        <td className="p-1.5 border-r border-slate-900 font-mono text-center">{i + 1}</td>
                        <td className="p-1.5 border-r border-slate-900 font-bold">{d.trade_name}</td>
                        <td className="p-1.5 border-r border-slate-900">{d.generic_name}</td>
                        <td className="p-1.5 border-r border-slate-900 font-mono">{d.dose} ({d.route_of_admin})</td>
                        <td className="p-1.5 font-bold">{d.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PharmDVerseBrandedDocumentContainer>

        </div>

      </div>
    </div>
  );
};
