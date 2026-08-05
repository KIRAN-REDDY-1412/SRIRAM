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

  const vitalSigns = profile?.vital_signs || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL ACTION BAR */}
        <div className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-extrabold tracking-tight">Patient Profile Documentation (3-Page A4 PDF Preview)</h3>
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

        {/* MULTI-PAGE PDF DOCUMENT WRAPPER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 font-serif text-slate-900 space-y-8 print:p-0 print:bg-white">
          
          {/* ================= PAGE 1: PATIENT DEMOGRAPHICS & MEDICAL HISTORIES ================= */}
          <PharmDVerseBrandedDocumentContainer
            college={college}
            branding={branding}
            documentTitle="Patient Profile Documentation"
            caseId={clinicalCase?.case_id}
            student={student}
            pageNumber="1 of 3"
            showSignatures={false}
          >
            {/* 1. PATIENT DETAILS */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 font-bold text-xs">
              <strong className="block border-b border-slate-900 pb-1 uppercase text-indigo-900">1. Patient Information</strong>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>Patient Name: <span className="underline font-extrabold">{profile?.patient_name || '—'}</span></div>
                <div>Age / Gender: <span className="underline">{profile?.age} yrs / {profile?.gender}</span></div>
                <div>IP No: <span className="font-mono underline">{profile?.ip_no || '—'}</span></div>
                <div>Height / Weight: <span className="font-mono underline">{profile?.height || '—'} cm / {profile?.weight || '—'} kg</span></div>
                <div>BMI: <span className="font-mono underline">{profile?.bmi || '—'}</span></div>
                <div>Ward / Dept: <span className="underline">{profile?.ward || '—'} / {profile?.department || '—'}</span></div>
                <div>DOA: <span className="font-mono underline">{profile?.doa || '—'}</span></div>
                <div>DOC: <span className="font-mono underline">{profile?.doc || '—'}</span></div>
                <div>DOD: <span className="font-mono underline">{profile?.dod || '—'}</span></div>
                <div className="col-span-2">Physician: <span className="underline">{profile?.physician || '—'}</span></div>
              </div>
            </div>

            {/* 2. CHIEF COMPLAINTS */}
            <div className="space-y-1 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <strong className="block uppercase font-bold text-slate-900 border-b border-slate-900 pb-1">2. Chief Complaints</strong>
              <p className="p-2 border border-slate-900 bg-white font-serif font-bold text-slate-900">{profile?.chief_complaints || 'N/A'}</p>
            </div>

            {/* 3. PAST MEDICAL HISTORY */}
            <div className="space-y-1 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <strong className="block uppercase font-bold text-slate-900 border-b border-slate-900 pb-1">3. Past Medical History</strong>
              <p className="p-2 border border-slate-900 bg-white font-serif">{profile?.past_medical_history || 'N/A'}</p>
            </div>

            {/* 4. PAST MEDICATION HISTORY */}
            <div className="space-y-1 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <strong className="block uppercase font-bold text-slate-900 border-b border-slate-900 pb-1">4. Past Medication History</strong>
              <p className="p-2 border border-slate-900 bg-white font-serif">{profile?.past_medication_history || 'N/A'}</p>
            </div>

            {/* 5. FAMILY HISTORY */}
            <div className="space-y-1 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <strong className="block uppercase font-bold text-slate-900 border-b border-slate-900 pb-1">5. Family History</strong>
              <p className="p-2 border border-slate-900 bg-white font-serif">{profile?.family_history || 'N/A'}</p>
            </div>

            {/* 6. SOCIAL HISTORY */}
            <div className="border border-slate-900 p-3 bg-slate-50/20 text-xs space-y-1 font-bold">
              <strong className="block uppercase border-b border-slate-900 pb-1 text-slate-900">6. Social History</strong>
              <div className="grid grid-cols-3 gap-2">
                <div>Smoker: <span className="underline">{profile?.smoker_pack_day ? `${profile.smoker_pack_day} packs/day (${profile.smoker_duration || ''})` : 'No'}</span></div>
                <div>Alcoholic: <span className="underline">{profile?.alcoholic_amount_day ? `${profile.alcoholic_amount_day} amount/day (${profile.alcoholic_duration || ''})` : 'No'}</span></div>
                <div>Marital Status: <span className="underline">{profile?.marital_status || '—'}</span></div>
              </div>
            </div>

            {/* 7. ALLERGY HISTORY */}
            <div className="border border-slate-900 p-3 bg-slate-50/20 text-xs space-y-1 font-bold">
              <strong className="block uppercase border-b border-slate-900 pb-1 text-rose-900">7. Allergy History</strong>
              <div className="grid grid-cols-2 gap-2">
                <div>Food Allergy: <span className="underline text-rose-700">{profile?.allergy_food || 'Nil'}</span></div>
                <div>Drug Allergy: <span className="underline text-rose-700">{profile?.allergy_drugs || 'Nil'}</span></div>
              </div>
            </div>
          </PharmDVerseBrandedDocumentContainer>

          {/* ================= PAGE 2: PHYSICAL EXAM & INVESTIGATIONS ================= */}
          <PharmDVerseBrandedDocumentContainer
            college={college}
            branding={branding}
            documentTitle="Patient Profile Documentation (Continued)"
            caseId={clinicalCase?.case_id}
            student={student}
            pageNumber="2 of 3"
            showSignatures={false}
          >
            {/* 8. PHYSICAL EXAMINATION */}
            <div className="border border-slate-900 p-3 bg-slate-50/20 text-xs space-y-2">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1 text-slate-900">8. Physical Examination</strong>
              <div className="grid grid-cols-3 gap-2 font-bold">
                <div>Cyanosis: <span className="underline">{profile?.cyanosis || 'Absent'}</span></div>
                <div>Icterus: <span className="underline">{profile?.icterus || 'Absent'}</span></div>
                <div>Pallor: <span className="underline">{profile?.pallor || 'Absent'}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-900 pt-2 font-serif">
                <div>CVS: <span className="font-bold">{profile?.cvs || 'NAD'}</span></div>
                <div>GI: <span className="font-bold">{profile?.gi || 'NAD'}</span></div>
                <div>RS: <span className="font-bold">{profile?.rs || 'NAD'}</span></div>
                <div>CNS: <span className="font-bold">{profile?.cns || 'NAD'}</span></div>
              </div>
            </div>

            {/* 9. VITAL SIGNS */}
            <div className="space-y-1 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1 text-slate-900">9. Vital Signs</strong>
              <table className="w-full text-left border border-slate-900 border-collapse text-xs">
                <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-900">
                  <tr>
                    <th className="p-1.5 border-r border-slate-900">Parameter</th>
                    <th className="p-1.5 border-r border-slate-900">Value</th>
                    <th className="p-1.5 border-r border-slate-900">Unit</th>
                    <th className="p-1.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-serif">
                  {vitalSigns && vitalSigns.length > 0 ? (
                    vitalSigns.map((v, i) => (
                      <tr key={i} className="border-b border-slate-900">
                        <td className="p-1.5 border-r border-slate-900 font-bold">{v.parameter}</td>
                        <td className="p-1.5 border-r border-slate-900 font-mono">{v.value}</td>
                        <td className="p-1.5 border-r border-slate-900">{v.unit || '—'}</td>
                        <td className="p-1.5 font-mono text-[10px]">{v.date || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="p-2 text-center italic text-slate-500">No vital signs recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 10. LABORATORY INVESTIGATIONS */}
            <div className="space-y-1 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1 text-slate-900">10. Laboratory Investigations</strong>
              <table className="w-full text-left border border-slate-900 border-collapse text-xs">
                <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-900">
                  <tr>
                    <th className="p-1.5 border-r border-slate-900">Category</th>
                    <th className="p-1.5 border-r border-slate-900">Parameter Name</th>
                    <th className="p-1.5 border-r border-slate-900">Result Value</th>
                    <th className="p-1.5 border-r border-slate-900">Unit</th>
                    <th className="p-1.5 border-r border-slate-900">Ref. Range</th>
                    <th className="p-1.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-serif">
                  {labInvestigations && labInvestigations.length > 0 ? (
                    labInvestigations.map((r, i) => (
                      <tr key={i} className="border-b border-slate-900">
                        <td className="p-1.5 border-r border-slate-900 font-bold">{r.category || 'General'}</td>
                        <td className="p-1.5 border-r border-slate-900 font-bold">{r.parameter_name}</td>
                        <td className="p-1.5 border-r border-slate-900 font-mono font-bold text-indigo-900">{r.test_value}</td>
                        <td className="p-1.5 border-r border-slate-900">{r.unit || '—'}</td>
                        <td className="p-1.5 border-r border-slate-900 text-[10px]">{r.reference_range || '—'}</td>
                        <td className="p-1.5 font-mono text-[10px]">{r.test_date || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="p-2 text-center italic text-slate-500">No laboratory investigations recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 11. OTHER INVESTIGATIONS */}
            {profile?.other_investigations && (
              <div className="space-y-1 border border-slate-900 p-3 bg-slate-50/20 text-xs">
                <strong className="block uppercase font-bold border-b border-slate-900 pb-1">11. Other Investigations</strong>
                <p className="p-2 border border-slate-900 bg-white font-serif">{profile.other_investigations}</p>
              </div>
            )}
          </PharmDVerseBrandedDocumentContainer>

          {/* ================= PAGE 3: DIAGNOSIS, DRUGS PRESCRIBED & DISCHARGE SUMMARY ================= */}
          <PharmDVerseBrandedDocumentContainer
            college={college}
            branding={branding}
            documentTitle="Patient Profile Documentation (Continued)"
            caseId={clinicalCase?.case_id}
            student={student}
            pageNumber="3 of 3"
            isLastPage={true}
          >
            {/* 12. DIAGNOSIS */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1 text-slate-900">12. Diagnosis</strong>
              <div className="space-y-1">
                <div>Provisional Diagnosis: <span className="font-bold underline">{profile?.provisional_diagnosis || 'N/A'}</span></div>
                <div>Final Diagnosis: <span className="font-bold underline text-indigo-900">{profile?.final_diagnosis || 'N/A'}</span></div>
              </div>
            </div>

            {/* 13. DRUGS PRESCRIBED */}
            <div className="space-y-1 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1 text-slate-900">
                13. Drugs Prescribed
              </strong>
              <table className="w-full text-left border border-slate-900 border-collapse text-xs">
                <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-900">
                  <tr>
                    <th className="p-1.5 border-r border-slate-900 text-center">S.No</th>
                    <th className="p-1.5 border-r border-slate-900">Brand / Trade Name</th>
                    <th className="p-1.5 border-r border-slate-900">Generic Name</th>
                    <th className="p-1.5 border-r border-slate-900">Route & Dose</th>
                    <th className="p-1.5 border-r border-slate-900">Frequency</th>
                    <th className="p-1.5">Therapy Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-serif">
                  {prescribedDrugs && prescribedDrugs.length > 0 ? (
                    prescribedDrugs.map((d, i) => (
                      <tr key={i} className="border-b border-slate-900">
                        <td className="p-1.5 border-r border-slate-900 font-mono text-center">{i + 1}</td>
                        <td className="p-1.5 border-r border-slate-900 font-bold">{d.trade_name}</td>
                        <td className="p-1.5 border-r border-slate-900">{d.generic_name}</td>
                        <td className="p-1.5 border-r border-slate-900 font-mono">{d.dose} ({d.route_of_admin})</td>
                        <td className="p-1.5 border-r border-slate-900 font-bold">{d.frequency}</td>
                        <td className="p-1.5 font-mono text-[10px]">{d.start_date || '—'} to {d.stop_date || 'Ongoing'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="p-2 text-center italic text-slate-500">No prescribed drugs recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 14. DISCHARGE SUMMARY */}
            <div className="space-y-1 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1">14. Discharge Summary</strong>
              <p className="p-2 border border-slate-900 bg-white font-serif">{profile?.discharge_summary || 'N/A'}</p>
            </div>
          </PharmDVerseBrandedDocumentContainer>

        </div>

      </div>
    </div>
  );
};
