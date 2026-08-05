import React, { useState, useEffect } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { fetchDocumentBrandingSettingsFromSupabase, fetchCollegeByIdFromSupabase } from '../../services/supabaseService';
import { PharmDVerseBrandedDocumentContainer } from '../branding/PharmDVerseBrandedDocumentContainer';

export const PatientProfilePDFPreviewModal = ({ isOpen, onClose, clinicalCase, student, profile, labInvestigations, prescribedDrugs }) => {
  const [branding, setBranding] = useState(null);
  const [college, setCollege] = useState(student?.colleges);

  useEffect(() => {
    const loadBrandingAndCollege = async () => {
      if (student?.college_id) {
        const [brandingRes, collegeRes] = await Promise.all([
          fetchDocumentBrandingSettingsFromSupabase(student.college_id),
          fetchCollegeByIdFromSupabase(student.college_id)
        ]);

        if (brandingRes.success && brandingRes.settings) {
          setBranding(brandingRes.settings);
        }
        if (collegeRes.success && collegeRes.college) {
          setCollege(collegeRes.college);
        }
      }
    };
    if (isOpen) loadBrandingAndCollege();
  }, [isOpen, student]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL ACTION BAR */}
        <div className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
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
          
          {/* ================= PAGE 1: PATIENT INFO & CLINICAL HISTORIES ================= */}
          <PharmDVerseBrandedDocumentContainer
            college={college}
            branding={branding}
            documentTitle="Patient Profile Documentation"
            caseId={clinicalCase?.case_id}
            student={student}
            pageNumber="1 of 3"
            showSignatures={false}
          >
            {/* 1. PATIENT DEMOGRAPHICS */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 text-xs font-bold">
              <strong className="block uppercase border-b border-slate-900 pb-1 text-slate-900">1. Demographics & Admission Details</strong>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>Patient Initials: <span className="underline">{profile?.patient_initials || '—'}</span></div>
                <div>Age / Sex: <span className="underline">{profile?.age} yrs / {profile?.gender}</span></div>
                <div>Weight (kg): <span className="font-mono underline">{profile?.weight_kg || '—'}</span></div>
                <div>Height (cm): <span className="font-mono underline">{profile?.height_cm || '—'}</span></div>
                <div>BMI (kg/m²): <span className="font-mono underline">{profile?.bmi || '—'}</span></div>
                <div>BSA (m²): <span className="font-mono underline">{profile?.bsa || '—'}</span></div>
                <div>IP/OP No: <span className="font-mono underline">{profile?.ip_op_number || '—'}</span></div>
                <div>Bed / Ward: <span className="underline">{profile?.bed_number || '—'} / {profile?.ward_unit || '—'}</span></div>
                <div>Department: <span className="underline">{profile?.department || '—'}</span></div>
                <div>Date of Admission: <span className="font-mono underline">{profile?.date_of_admission || '—'}</span></div>
                {profile?.date_of_collection && <div>Date of Collection: <span className="font-mono underline">{profile.date_of_collection}</span></div>}
                {profile?.date_of_discharge && <div>Date of Discharge: <span className="font-mono underline">{profile.date_of_discharge}</span></div>}
                {profile?.attending_physician && <div>Attending Physician: <span className="underline">{profile.attending_physician}</span></div>}
                <div className="col-span-2">Hospital Name: <span className="underline">{profile?.hospital_name || 'Lalitha Superspecialities Hospital'}</span></div>
              </div>
            </div>

            {/* 2. CHIEF COMPLAINTS */}
            <div className="space-y-1 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1">2. Chief Complaints</strong>
              <p className="p-2 border border-slate-900 bg-white font-serif font-bold text-slate-900">{profile?.chief_complaints || 'N/A'}</p>
            </div>

            {/* 3. MEDICAL & MEDICATION HISTORIES */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1">3. Medical & Medication History</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="font-bold block text-slate-900">History of Present Illness:</span>
                  <p className="italic">{profile?.history_of_present_illness || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-bold block text-slate-900">Past Medical History:</span>
                  <p className="italic">{profile?.past_medical_history || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-bold block text-slate-900">Past Medication History:</span>
                  <p className="italic">{profile?.past_medication_history || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-bold block text-slate-900">Allergy History:</span>
                  <p className="italic text-rose-800 font-bold">
                    {profile?.allergies || (profile?.allergy_drugs || profile?.allergy_food ? `Drug: ${profile?.allergy_drugs || 'None'}, Food: ${profile?.allergy_food || 'None'}` : 'No known drug allergies')}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. FAMILY & SOCIAL HISTORY */}
            <div className="grid grid-cols-2 gap-2 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <div>
                <strong className="block uppercase font-bold border-b border-slate-900 pb-1">Family History:</strong>
                <p className="italic">{profile?.family_history || 'N/A'}</p>
              </div>
              <div>
                <strong className="block uppercase font-bold border-b border-slate-900 pb-1">Social & Personal History:</strong>
                <p className="italic">{profile?.personal_social_history || 'N/A'}</p>
              </div>
            </div>
          </PharmDVerseBrandedDocumentContainer>

          {/* ================= PAGE 2: EXAMINATIONS, VITAL SIGNS & LAB INVESTIGATIONS ================= */}
          <PharmDVerseBrandedDocumentContainer
            college={college}
            branding={branding}
            documentTitle="Patient Profile Documentation (Continued)"
            caseId={clinicalCase?.case_id}
            student={student}
            pageNumber="2 of 3"
            showSignatures={false}
          >
            {/* 5. PHYSICAL EXAMINATION */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1">5. Physical & Systemic Examination</strong>
              <div className="grid grid-cols-3 gap-2 font-bold pb-1 border-b border-slate-300">
                <div>Pallor: <span className="underline">{profile?.pallor || 'Absent'}</span></div>
                <div>Icterus: <span className="underline">{profile?.icterus || 'Absent'}</span></div>
                <div>Cyanosis: <span className="underline">{profile?.cyanosis || 'Absent'}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-serif pt-1">
                {profile?.cvs && <div>CVS: <span className="underline">{profile.cvs}</span></div>}
                {profile?.rs && <div>RS: <span className="underline">{profile.rs}</span></div>}
                {profile?.gi && <div>GIT: <span className="underline">{profile.gi}</span></div>}
                {profile?.cns && <div>CNS: <span className="underline">{profile.cns}</span></div>}
              </div>
              <p className="p-2 border border-slate-900 bg-white font-serif">{profile?.systemic_examination || 'General examination normal.'}</p>
            </div>

            {/* 6. VITAL SIGNS TABLE */}
            <div className="space-y-1 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1">6. Vital Signs Log</strong>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-slate-900 p-3 bg-slate-50/20 font-bold">
                <div>Blood Pressure: <span className="font-mono underline">{profile?.bp_sys ? `${profile.bp_sys}/${profile.bp_dia} mmHg` : '—'}</span></div>
                <div>Pulse Rate: <span className="font-mono underline">{profile?.pulse_rate ? `${profile.pulse_rate} bpm` : '—'}</span></div>
                <div>Resp Rate: <span className="font-mono underline">{profile?.respiratory_rate ? `${profile.respiratory_rate} bpm` : '—'}</span></div>
                <div>Temperature: <span className="font-mono underline">{profile?.temperature_f ? `${profile.temperature_f} °F` : '—'}</span></div>
                <div>SpO2: <span className="font-mono underline">{profile?.spo2 ? `${profile.spo2}%` : '—'}</span></div>
                <div>Random Blood Sugar: <span className="font-mono underline">{profile?.rbs ? `${profile.rbs} mg/dL` : '—'}</span></div>
              </div>
            </div>

            {/* 7. LABORATORY INVESTIGATIONS TABLE */}
            <div className="space-y-1 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1">7. Laboratory Investigations</strong>
              <table className="w-full text-left border border-slate-900 border-collapse text-xs">
                <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-900">
                  <tr>
                    <th className="p-1.5 border-r border-slate-900">Category</th>
                    <th className="p-1.5 border-r border-slate-900">Parameter</th>
                    <th className="p-1.5 border-r border-slate-900">Value</th>
                    <th className="p-1.5 border-r border-slate-900">Unit</th>
                    <th className="p-1.5">Ref Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-serif">
                  {labInvestigations && labInvestigations.length > 0 ? (
                    labInvestigations.map((lab, i) => (
                      <tr key={i} className="border-b border-slate-900">
                        <td className="p-1.5 border-r border-slate-900 font-bold">{lab.category}</td>
                        <td className="p-1.5 border-r border-slate-900">{lab.parameter_name}</td>
                        <td className="p-1.5 border-r border-slate-900 font-mono font-bold text-indigo-900">{lab.test_value}</td>
                        <td className="p-1.5 border-r border-slate-900 font-mono">{lab.unit}</td>
                        <td className="p-1.5 font-mono">{lab.reference_range}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="p-2 text-center italic text-slate-500">No laboratory investigations recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {profile?.other_investigations && (
              <div className="space-y-1 border border-slate-900 p-3 bg-slate-50/20 text-xs">
                <strong className="block uppercase font-bold border-b border-slate-900 pb-1">8. Radiological / Other Investigations</strong>
                <p className="p-2 border border-slate-900 bg-white font-serif">{profile.other_investigations}</p>
              </div>
            )}
          </PharmDVerseBrandedDocumentContainer>

          {/* ================= PAGE 3: DIAGNOSIS, PRESCRIBED DRUGS & SIGNATURES ================= */}
          <PharmDVerseBrandedDocumentContainer
            college={college}
            branding={branding}
            documentTitle="Patient Profile Documentation (Continued)"
            caseId={clinicalCase?.case_id}
            student={student}
            pageNumber="3 of 3"
            isLastPage={true}
          >
            {/* 9. PROVISIONAL & FINAL DIAGNOSIS */}
            <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1 text-slate-900">9. Diagnosis</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="font-bold block text-slate-900">Provisional Diagnosis:</span>
                  <p className="p-2 border border-slate-900 bg-white font-serif italic">{profile?.provisional_diagnosis || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-bold block text-slate-900">Final Diagnosis:</span>
                  <p className="p-2 border border-slate-900 bg-white font-serif font-bold text-slate-900">{profile?.final_diagnosis || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* 10. DRUGS PRESCRIBED TABLE */}
            <div className="space-y-1 text-xs">
              <strong className="block uppercase font-bold border-b border-slate-900 pb-1">10. Prescribed Medications</strong>
              <table className="w-full text-left border border-slate-900 border-collapse text-xs">
                <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-900">
                  <tr>
                    <th className="p-1.5 border-r border-slate-900">S.No</th>
                    <th className="p-1.5 border-r border-slate-900">Brand Name</th>
                    <th className="p-1.5 border-r border-slate-900">Generic Name</th>
                    <th className="p-1.5 border-r border-slate-900">Dose</th>
                    <th className="p-1.5 border-r border-slate-900">Route</th>
                    <th className="p-1.5">Freq</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-serif">
                  {prescribedDrugs && prescribedDrugs.length > 0 ? (
                    prescribedDrugs.map((d, i) => (
                      <tr key={i} className="border-b border-slate-900">
                        <td className="p-1.5 border-r border-slate-900 font-mono text-center">{d.s_no || i + 1}</td>
                        <td className="p-1.5 border-r border-slate-900 font-bold">{d.trade_name}</td>
                        <td className="p-1.5 border-r border-slate-900">{d.generic_name}</td>
                        <td className="p-1.5 border-r border-slate-900 font-mono">{d.dose}</td>
                        <td className="p-1.5 border-r border-slate-900">{d.route_of_admin}</td>
                        <td className="p-1.5 font-bold">{d.frequency}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="p-2 text-center italic text-slate-500">No prescribed drugs recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 11. DISCHARGE SUMMARY */}
            {profile?.discharge_summary && (
              <div className="space-y-1 border border-slate-900 p-3 bg-slate-50/20 text-xs">
                <strong className="block uppercase font-bold border-b border-slate-900 pb-1">11. Discharge Summary & Outcome</strong>
                <p className="p-2 border border-slate-900 bg-white font-serif">{profile.discharge_summary}</p>
              </div>
            )}
          </PharmDVerseBrandedDocumentContainer>

        </div>

      </div>
    </div>
  );
};
