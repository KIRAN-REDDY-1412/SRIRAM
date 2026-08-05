import React from 'react';
import { X, Printer, Download, ShieldCheck, Stethoscope } from 'lucide-react';

export const PatientProfilePDFPreviewModal = ({ isOpen, onClose, clinicalCase, student, profile, labInvestigations, prescribedDrugs }) => {
  if (!isOpen) return null;

  const collegeName = student?.colleges?.college_name || 'A.M. REDDY MEMORIAL COLLEGE OF PHARMACY';
  const formCode = `ARMN-LSSH/26-27/ ${clinicalCase?.case_id || '001'} /PPF-`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL ACTION BAR */}
        <div className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold tracking-tight">Patient Documentation Form (PDF Official Preview)</h3>
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

        {/* PDF DOCUMENT WRAPPER (MATCHES EXACT UPLOADED FORM STYLING) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 font-serif text-slate-900">
          
          <div className="bg-white p-6 sm:p-10 max-w-3xl mx-auto border-2 border-slate-900 shadow-xl space-y-6 text-xs text-slate-900 leading-normal">
            
            {/* HEADER BOX */}
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
              <span className="text-center font-serif text-sm font-extrabold underline tracking-widest block">PATIENT DOCUMENTATION FORM</span>
              <span>Case: {clinicalCase?.case_id}</span>
            </div>

            {/* PATIENT DETAILS TABLE */}
            <div className="space-y-1">
              <strong className="font-bold text-xs uppercase block font-serif">Patient details:</strong>
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <tbody>
                  <tr className="border-b border-slate-900">
                    <td className="p-2 border-r border-slate-900 font-bold bg-slate-50 w-1/6">Name:</td>
                    <td className="p-2 border-r border-slate-900 font-bold w-2/6">{profile?.patient_name || '—'}</td>
                    <td className="p-2 border-r border-slate-900 font-bold bg-slate-50 w-1/6">Age / Sex:</td>
                    <td className="p-2 border-r border-slate-900 w-1/6">{profile?.age} / {profile?.gender}</td>
                    <td className="p-2 border-r border-slate-900 font-bold bg-slate-50 w-1/6">I.P No:</td>
                    <td className="p-2 font-mono">{profile?.ip_no || '—'}</td>
                  </tr>
                  <tr className="border-b border-slate-900">
                    <td className="p-2 border-r border-slate-900 font-bold bg-slate-50">Height:</td>
                    <td className="p-2 border-r border-slate-900">{profile?.height || '—'}</td>
                    <td className="p-2 border-r border-slate-900 font-bold bg-slate-50">Weight:</td>
                    <td className="p-2 border-r border-slate-900">{profile?.weight || '—'}</td>
                    <td className="p-2 border-r border-slate-900 font-bold bg-slate-50">BMI:</td>
                    <td className="p-2 font-bold">{profile?.bmi || '—'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-900 font-bold bg-slate-50">Ward:</td>
                    <td className="p-2 border-r border-slate-900">{profile?.ward || '—'}</td>
                    <td className="p-2 border-r border-slate-900 font-bold bg-slate-50">Dept:</td>
                    <td className="p-2 border-r border-slate-900">{profile?.department || '—'}</td>
                    <td className="p-2 border-r border-slate-900 font-bold bg-slate-50">DOA / DOC:</td>
                    <td className="p-2 font-mono">{profile?.doa} / {profile?.doc}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CHIEF COMPLAINTS & HISTORIES */}
            <div className="space-y-4 pt-2">
              <div>
                <strong className="font-bold text-xs uppercase block font-serif">Chief Complaints:</strong>
                <p className="p-2.5 border border-slate-900 rounded-xs min-h-[48px] bg-slate-50/50 whitespace-pre-line font-serif">
                  {profile?.chief_complaints || 'None reported.'}
                </p>
              </div>

              <div>
                <strong className="font-bold text-xs uppercase block font-serif">Past Medical History:</strong>
                <p className="p-2.5 border border-slate-900 rounded-xs min-h-[44px] bg-slate-50/50 whitespace-pre-line font-serif">
                  {profile?.past_medical_history || 'None.'}
                </p>
              </div>

              <div>
                <strong className="font-bold text-xs uppercase block font-serif">Past Medication History:</strong>
                <p className="p-2.5 border border-slate-900 rounded-xs min-h-[44px] bg-slate-50/50 whitespace-pre-line font-serif">
                  {profile?.past_medication_history || 'None.'}
                </p>
              </div>

              <div>
                <strong className="font-bold text-xs uppercase block font-serif">Family Medical History:</strong>
                <p className="p-2.5 border border-slate-900 rounded-xs min-h-[44px] bg-slate-50/50 whitespace-pre-line font-serif">
                  {profile?.family_history || 'None.'}
                </p>
              </div>

              {/* SOCIAL & ALLERGY HISTORY */}
              <div>
                <strong className="font-bold text-xs uppercase block font-serif mb-1">Social History & Allergy:</strong>
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-900">
                      <td className="p-2 border-r border-slate-900 font-bold bg-slate-50 w-1/4">Smoker:</td>
                      <td className="p-2 border-r border-slate-900 w-1/4">{profile?.smoker_pack_day ? `${profile.smoker_pack_day} (Duration: ${profile.smoker_duration || 'N/A'})` : 'No'}</td>
                      <td className="p-2 border-r border-slate-900 font-bold bg-slate-50 w-1/4">Alcoholic:</td>
                      <td className="p-2 w-1/4">{profile?.alcoholic_amount_day ? `${profile.alcoholic_amount_day} (Duration: ${profile.alcoholic_duration || 'N/A'})` : 'No'}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-900 font-bold bg-slate-50">Food Allergies:</td>
                      <td className="p-2 border-r border-slate-900">{profile?.allergy_food || 'None'}</td>
                      <td className="p-2 border-r border-slate-900 font-bold bg-slate-50">Drug Allergies:</td>
                      <td className="p-2">{profile?.allergy_drugs || 'None'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* PHYSICAL EXAMINATION */}
              <div>
                <h4 className="font-bold text-xs uppercase text-center border-t border-b border-slate-900 py-1 font-serif tracking-widest my-2">
                  Physical Examination
                </h4>
                <div className="grid grid-cols-3 gap-2 py-1 font-bold text-xs">
                  <div>Cyanosis: <span className="font-normal">{profile?.cyanosis || 'Absent'}</span></div>
                  <div>Icterus: <span className="font-normal">{profile?.icterus || 'Absent'}</span></div>
                  <div>Pallor: <span className="font-normal">{profile?.pallor || 'Absent'}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-serif text-xs">
                  <div><strong>CVS:</strong> {profile?.cvs || 'NAD'}</div>
                  <div><strong>GI:</strong> {profile?.gi || 'NAD'}</div>
                  <div><strong>RS:</strong> {profile?.rs || 'NAD'}</div>
                  <div><strong>CNS:</strong> {profile?.cns || 'NAD'}</div>
                </div>
              </div>

              {/* PROVISIONAL DIAGNOSIS */}
              <div>
                <strong className="font-bold text-xs uppercase block font-serif">Provisional Diagnosis:</strong>
                <p className="p-2 border border-slate-900 font-bold text-slate-900 bg-slate-50">
                  {profile?.provisional_diagnosis || 'Under evaluation.'}
                </p>
              </div>

              {/* VITAL SIGNS TABLE */}
              {profile?.vital_signs && profile.vital_signs.length > 0 && (
                <div>
                  <strong className="font-bold text-xs uppercase block font-serif mb-1">Vital Signs Log:</strong>
                  <table className="w-full border-collapse border border-slate-900 text-center text-xs">
                    <thead className="bg-slate-100 border-b border-slate-900 font-bold">
                      <tr>
                        <th className="p-1.5 border-r border-slate-900">Date</th>
                        <th className="p-1.5 border-r border-slate-900">TEMP (°F)</th>
                        <th className="p-1.5 border-r border-slate-900">BP (mmHg)</th>
                        <th className="p-1.5 border-r border-slate-900">PR (bpm)</th>
                        <th className="p-1.5 border-r border-slate-900">RR (cpm)</th>
                        <th className="p-1.5">SPO2 (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.vital_signs.map((v, i) => (
                        <tr key={i} className="border-b border-slate-900 font-mono">
                          <td className="p-1.5 border-r border-slate-900 font-bold">{v.date}</td>
                          <td className="p-1.5 border-r border-slate-900">{v.temp || '—'}</td>
                          <td className="p-1.5 border-r border-slate-900">{v.bp || '—'}</td>
                          <td className="p-1.5 border-r border-slate-900">{v.pr || '—'}</td>
                          <td className="p-1.5 border-r border-slate-900">{v.rr || '—'}</td>
                          <td className="p-1.5 font-bold">{v.spo2 || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* LAB INVESTIGATIONS TABLE */}
              {labInvestigations && labInvestigations.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase text-center border-t border-b border-slate-900 py-1 font-serif tracking-widest my-2">
                    Lab Investigations
                  </h4>
                  <table className="w-full border-collapse border border-slate-900 text-xs">
                    <thead className="bg-slate-100 border-b border-slate-900 font-bold">
                      <tr>
                        <th className="p-1.5 border-r border-slate-900 text-left">Category</th>
                        <th className="p-1.5 border-r border-slate-900 text-left">Parameter</th>
                        <th className="p-1.5 border-r border-slate-900 text-center">Ref Range</th>
                        <th className="p-1.5 border-r border-slate-900 text-center">Date</th>
                        <th className="p-1.5 text-center font-bold">Test Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labInvestigations.map((lab, i) => (
                        <tr key={i} className="border-b border-slate-900">
                          <td className="p-1.5 border-r border-slate-900 font-semibold">{lab.category}</td>
                          <td className="p-1.5 border-r border-slate-900 font-bold">{lab.parameter_name}</td>
                          <td className="p-1.5 border-r border-slate-900 text-center font-mono text-[11px] text-slate-600">{lab.reference_range || '—'}</td>
                          <td className="p-1.5 border-r border-slate-900 text-center font-mono">{lab.test_date}</td>
                          <td className="p-1.5 text-center font-extrabold font-mono text-emerald-800">{lab.test_value} {lab.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* OTHER INVESTIGATIONS & FINAL DIAGNOSIS */}
              <div>
                <strong className="font-bold text-xs uppercase block font-serif">Other Investigations (ECG/X-Ray/CT):</strong>
                <p className="p-2.5 border border-slate-900 rounded-xs min-h-[40px] bg-slate-50/50 whitespace-pre-line font-serif">
                  {profile?.other_investigations || 'None.'}
                </p>
              </div>

              <div>
                <strong className="font-bold text-xs uppercase block font-serif">Final Diagnosis:</strong>
                <p className="p-2 border border-slate-900 font-bold text-emerald-900 bg-emerald-50/60 font-serif">
                  {profile?.final_diagnosis || 'Pending final evaluation.'}
                </p>
              </div>

              {/* DRUGS PRESCRIBED TABLE */}
              {prescribedDrugs && prescribedDrugs.length > 0 && (
                <div>
                  <strong className="font-bold text-xs uppercase block font-serif mb-1">Drugs Prescribed:</strong>
                  <table className="w-full border-collapse border border-slate-900 text-xs">
                    <thead className="bg-slate-100 border-b border-slate-900 font-bold">
                      <tr>
                        <th className="p-1.5 border-r border-slate-900 text-center w-10">S.No</th>
                        <th className="p-1.5 border-r border-slate-900 text-left">Trade Name</th>
                        <th className="p-1.5 border-r border-slate-900 text-left">Generic Name</th>
                        <th className="p-1.5 border-r border-slate-900 text-center">R.O.A</th>
                        <th className="p-1.5 border-r border-slate-900 text-center">Dose</th>
                        <th className="p-1.5 border-r border-slate-900 text-center">FRQ</th>
                        <th className="p-1.5 border-r border-slate-900 text-center">Start Date</th>
                        <th className="p-1.5 text-center">Stop Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescribedDrugs.map((d, i) => (
                        <tr key={i} className="border-b border-slate-900 font-mono">
                          <td className="p-1.5 border-r border-slate-900 text-center font-bold">{d.s_no || i + 1}</td>
                          <td className="p-1.5 border-r border-slate-900 font-bold font-sans">{d.trade_name}</td>
                          <td className="p-1.5 border-r border-slate-900 font-sans italic">{d.generic_name}</td>
                          <td className="p-1.5 border-r border-slate-900 text-center">{d.route_of_admin}</td>
                          <td className="p-1.5 border-r border-slate-900 text-center font-bold">{d.dose}</td>
                          <td className="p-1.5 border-r border-slate-900 text-center font-bold">{d.frequency}</td>
                          <td className="p-1.5 border-r border-slate-900 text-center">{d.start_date || '—'}</td>
                          <td className="p-1.5 text-center">{d.stop_date || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* DISCHARGE SUMMARY */}
              <div>
                <strong className="font-bold text-xs uppercase block font-serif">Discharge Summary:</strong>
                <p className="p-3 border border-slate-900 rounded-xs min-h-[50px] bg-slate-50/50 whitespace-pre-line font-serif">
                  {profile?.discharge_summary || 'N/A'}
                </p>
              </div>

              {/* SIGNATURES FOOTER */}
              <div className="pt-12 flex justify-between items-center text-xs font-bold font-serif">
                <div className="border-t border-slate-900 pt-1 w-48 text-center">
                  Signature of the Student
                  <span className="block text-[10px] font-mono font-normal text-slate-600">{student?.full_name} ({student?.roll_number})</span>
                </div>

                <div className="border-t border-slate-900 pt-1 w-48 text-center">
                  Signature of the Preceptor
                  <span className="block text-[10px] font-mono font-normal text-slate-600">Clinical Evaluator</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
