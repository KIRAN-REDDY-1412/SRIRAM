import React from 'react';
import { PharmDVerseBrandedDocumentContainer } from './PharmDVerseBrandedDocumentContainer';

/**
 * Unified Multi-Page Clinical Case PDF Document Renderer.
 * Used for BOTH:
 *  1. Admin PDF Format Live Previews (using SAMPLE_CLINICAL_CASE_DATA)
 *  2. Real Approved Case PDF View & Download (using actual case modules data from Supabase)
 */
export const ClinicalCaseDocumentRenderer = ({
  caseData = {},
  branding = {},
  college = {},
  student = {},
  preceptor = {}
}) => {
  const cCase = caseData.clinicalCase || {};
  const cStudent = student?.full_name ? student : (caseData.student || {});
  const cPreceptor = preceptor?.full_name ? preceptor : (caseData.preceptor || {});
  const cCollege = college?.college_name || college?.name ? college : (caseData.college || {});
  const modules = caseData.caseModulesData || {};

  const profile = modules.profile || {};
  const vitals = modules.vitals || [];
  const labs = modules.labs || [];
  const drugs = modules.drugs || [];
  const counselling = modules.counselling || {};
  const intervention = modules.intervention || {};
  const dir = modules.dir || {};
  const adr = modules.adr || {};

  const caseId = cCase.case_id || 'AMRMCP-2026-000001';
  const preceptorName = cCase.assigned_preceptor_name || cPreceptor.full_name || 'Dr. Faculty Preceptor';
  const finalDiagnosis = cCase.final_diagnosis || cCase.diagnosis || profile.diagnosis || 'Clinical Case Presentation';

  const secondaryCol = branding?.secondary_color || '#0284c7';
  const primaryCol = branding?.primary_color || '#0f172a';

  return (
    <div id="official-clinical-case-pdf-container" className="space-y-8 print:space-y-0">
      
      {/* PAGE 1 OF 5: PATIENT PROFILE & SOCIAL HISTORY */}
      <PharmDVerseBrandedDocumentContainer
        college={cCollege}
        branding={branding}
        documentTitle="Patient Profile Documentation"
        caseId={caseId}
        student={cStudent}
        preceptorName={preceptorName}
        pageNumber="1 of 5"
        showSignatures={false}
      >
        <div className="space-y-4 text-xs">
          
          {/* Section 1: Patient Demographics */}
          <div className="border p-3.5 rounded-lg bg-slate-50/60 branded-border space-y-2.5">
            <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px] tracking-wide">
              1. Patient Demographics & Profile
            </strong>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
              <div>Patient Name: <span className="font-bold text-slate-900">{profile.patient_name || 'N/A'}</span></div>
              <div>Age / Gender: <span className="font-bold text-slate-900">{profile.age ? `${profile.age} Yrs` : 'N/A'} / {profile.gender || 'N/A'}</span></div>
              <div>IP / OP No: <span className="font-bold font-mono text-slate-900">{profile.ip_op_number || 'N/A'}</span></div>
              <div>Ward / Bed No: <span>{profile.ward || 'N/A'}</span></div>
              <div>Date of Admission: <span className="font-mono font-bold">{profile.date_of_admission || 'N/A'}</span></div>
              <div>Attending Physician: <span className="font-bold">{profile.attending_physician || 'Dr. Physician'}</span></div>
            </div>
            <div className="pt-2 text-[11px] border-t branded-border space-y-1.5 leading-relaxed">
              <div><strong className="text-slate-900">Chief Complaints:</strong> {profile.chief_complaints || 'None recorded.'}</div>
              <div><strong className="text-slate-900">Past Medical History:</strong> {profile.past_medical_history || 'No significant past medical history.'}</div>
              <div><strong className="text-slate-900">Past Medication History:</strong> {profile.past_medication_history || 'No long-term medications.'}</div>
            </div>
          </div>

          {/* Family & Social History */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="border p-3 rounded-lg bg-slate-50/40 branded-border space-y-1 text-[11px]">
              <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[10px] text-slate-800">
                Family History
              </strong>
              <div>{profile.family_history || 'No reported family history of hereditary disease.'}</div>
            </div>
            <div className="border p-3 rounded-lg bg-slate-50/40 branded-border space-y-1 text-[11px]">
              <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[10px]" style={{ color: secondaryCol }}>
                Social History
              </strong>
              <div className="font-medium">{profile.social_history || 'Non-smoker, Non-alcoholic, Balanced diet.'}</div>
            </div>
          </div>

        </div>
      </PharmDVerseBrandedDocumentContainer>

      {/* PAGE 2 OF 5: CLINICAL EXAMINATION & VITALS LOG */}
      <PharmDVerseBrandedDocumentContainer
        college={cCollege}
        branding={branding}
        documentTitle="Clinical Examination & Vital Signs"
        caseId={caseId}
        student={cStudent}
        preceptorName={preceptorName}
        pageNumber="2 of 5"
        showSignatures={false}
      >
        <div className="space-y-4 text-xs">
          
          {/* General & Systemic Examination */}
          <div className="border p-3.5 rounded-lg bg-slate-50/60 branded-border space-y-2 text-[11px]">
            <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
              Clinical Examinations
            </strong>
            <div className="space-y-1.5 leading-relaxed">
              <div><strong className="text-slate-900">General Examination:</strong> {profile.general_examination || 'Patient conscious and coherent. Cyanosis: Absent, Icterus: Absent, Pallor: Absent, Edema: Absent.'}</div>
              <div><strong className="text-slate-900">Systemic Examination:</strong> {profile.systemic_examination || 'CVS: S1S2 heard. RS: NVBS. GI: Soft. CNS: Intact.'}</div>
            </div>
          </div>

          {/* Vital Signs Table */}
          <div className="space-y-1.5 text-xs">
            <strong className="block font-extrabold uppercase text-[11px] border-b pb-1 branded-heading branded-border">
              Vital Signs Log Chart
            </strong>
            <table className="w-full text-left border border-collapse text-[10px] branded-border">
              <thead className="font-bold uppercase text-[9px] border-b branded-header-bg branded-border">
                <tr>
                  <th className="p-2 border-r branded-border">Recorded Date</th>
                  <th className="p-2 border-r branded-border">Temp (°F)</th>
                  <th className="p-2 border-r branded-border">Blood Pressure (mmHg)</th>
                  <th className="p-2 border-r branded-border">Pulse Rate (bpm)</th>
                  <th className="p-2 border-r branded-border">Resp Rate (/min)</th>
                  <th className="p-2">SpO2 (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y branded-border">
                {vitals.length > 0 ? (
                  vitals.map((v, idx) => (
                    <tr key={idx} className="border-b branded-border">
                      <td className="p-1.5 border-r font-mono font-bold branded-border">{v.date || 'N/A'}</td>
                      <td className="p-1.5 border-r font-mono branded-border">{v.temp || '98.6'}</td>
                      <td className="p-1.5 border-r font-mono font-bold branded-border">{v.bp || '120/80'}</td>
                      <td className="p-1.5 border-r font-mono branded-border">{v.pr || '72'}</td>
                      <td className="p-1.5 border-r font-mono branded-border">{v.rr || '18'}</td>
                      <td className="p-1.5 font-mono font-bold" style={{ color: secondaryCol }}>{v.spo2 ? `${v.spo2}%` : '98%'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-2 text-center text-slate-500 italic">No vital signs logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Provisional & Final Diagnosis Banner */}
          <div className="border-2 p-3.5 rounded-xl bg-emerald-50/70 border-emerald-600 text-center space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 block">
              Official Diagnostic Opinion
            </span>
            <h3 className="text-sm font-black text-emerald-900 uppercase">
              {finalDiagnosis}
            </h3>
          </div>

        </div>
      </PharmDVerseBrandedDocumentContainer>

      {/* PAGE 3 OF 5: LABORATORY & DIAGNOSTIC INVESTIGATIONS */}
      <PharmDVerseBrandedDocumentContainer
        college={cCollege}
        branding={branding}
        documentTitle="Laboratory & Diagnostic Reports"
        caseId={caseId}
        student={cStudent}
        preceptorName={preceptorName}
        pageNumber="3 of 5"
        showSignatures={false}
      >
        <div className="space-y-4 text-xs">
          
          {/* Laboratory Investigations Table */}
          <div className="space-y-1.5 text-xs">
            <strong className="block font-extrabold uppercase text-[11px] border-b pb-1 branded-heading branded-border">
              2. Key Laboratory Investigations
            </strong>
            <table className="w-full text-left border border-collapse text-[10px] branded-border">
              <thead className="font-bold uppercase text-[9px] border-b branded-header-bg branded-border">
                <tr>
                  <th className="p-1.5 border-r branded-border">Category</th>
                  <th className="p-1.5 border-r branded-border">Investigation Parameter</th>
                  <th className="p-1.5 border-r branded-border">Observed Value</th>
                  <th className="p-1.5 border-r branded-border">Reference Range</th>
                  <th className="p-1.5">Clinical Inference</th>
                </tr>
              </thead>
              <tbody className="divide-y branded-border">
                {labs.length > 0 ? (
                  labs.map((l, idx) => (
                    <tr key={idx} className="border-b branded-border">
                      <td className="p-1.5 border-r font-bold text-slate-700 branded-border">{l.category || 'General'}</td>
                      <td className="p-1.5 border-r font-bold branded-border">{l.parameter_name || l.test_name || 'N/A'}</td>
                      <td className="p-1.5 border-r font-mono font-bold branded-border">{l.test_value ? `${l.test_value} ${l.unit || ''}` : 'N/A'}</td>
                      <td className="p-1.5 border-r branded-border">{l.reference_range || l.normal_range || 'N/A'}</td>
                      <td className="p-1.5 font-bold" style={{ color: secondaryCol }}>{l.clinical_inference || 'Normal'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-2 text-center text-slate-500 italic">No laboratory investigations logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Other Diagnostic Investigations */}
          {profile.other_investigations && (
            <div className="border p-3 rounded-lg bg-sky-50/60 border-sky-300 text-sky-950 space-y-1 text-[11px]">
              <strong className="block font-bold uppercase text-[10px] text-sky-900 border-b border-sky-200 pb-0.5">
                Radiological & Special Diagnostic Findings
              </strong>
              <div className="leading-relaxed font-serif">{profile.other_investigations}</div>
            </div>
          )}

        </div>
      </PharmDVerseBrandedDocumentContainer>

      {/* PAGE 4 OF 5: PRESCRIBED MEDICATIONS & COUNSELLING */}
      <PharmDVerseBrandedDocumentContainer
        college={cCollege}
        branding={branding}
        documentTitle="Pharmacotherapy & Counselling Record"
        caseId={caseId}
        student={cStudent}
        preceptorName={preceptorName}
        pageNumber="4 of 5"
        showSignatures={false}
      >
        <div className="space-y-4 text-xs">
          
          {/* Prescribed Pharmacotherapy Table */}
          <div className="space-y-1.5 text-xs">
            <strong className="block font-extrabold uppercase text-[11px] border-b pb-1 branded-heading branded-border">
              3. Prescribed Pharmacotherapy Log
            </strong>
            <table className="w-full text-left border border-collapse text-[10px] branded-border">
              <thead className="font-bold uppercase text-[9px] border-b branded-header-bg branded-border">
                <tr>
                  <th className="p-1.5 border-r branded-border text-center">S.No</th>
                  <th className="p-1.5 border-r branded-border">Brand & Generic Name</th>
                  <th className="p-1.5 border-r branded-border">Dose & Route</th>
                  <th className="p-1.5 border-r branded-border">Frequency</th>
                  <th className="p-1.5">Therapeutic Indication</th>
                </tr>
              </thead>
              <tbody className="divide-y branded-border">
                {drugs.length > 0 ? (
                  drugs.map((d, idx) => (
                    <tr key={idx} className="border-b branded-border">
                      <td className="p-1.5 border-r text-center font-mono font-bold branded-border">{d.s_no || idx + 1}</td>
                      <td className="p-1.5 border-r font-bold branded-border">{d.trade_name} {d.generic_name ? `(${d.generic_name})` : ''}</td>
                      <td className="p-1.5 border-r branded-border">{d.dose || 'N/A'} ({d.route_of_admin || 'Oral'})</td>
                      <td className="p-1.5 border-r font-mono font-bold branded-border">{d.frequency || 'OD'}</td>
                      <td className="p-1.5">{d.indication || 'Symptomatic Management'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-2 text-center text-slate-500 italic">No medications logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Section 4: Patient Counselling Record */}
          <div className="border p-3.5 rounded-lg bg-slate-50/50 branded-border space-y-1.5 text-[11px]">
            <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
              4. Patient Counselling Record
            </strong>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>Counselled Provided To: <span className="font-bold">{counselling.counselling_provided_to || 'Patient'}</span></div>
              <div>Mode & Time: <span className="font-bold">{counselling.counselling_mode || 'Oral'} ({counselling.time_taken || '15 min'})</span></div>
              <div className="col-span-2">Disease & Meds Counselled: <span>{counselling.disease_counselled || finalDiagnosis}</span></div>
              <div className="col-span-2"><strong className="text-slate-900">Key Focus & Advice:</strong> {counselling.focus_points || 'Compliance and dietary instructions provided.'}</div>
              <div className="col-span-2"><strong className="text-slate-900">Barriers & Action:</strong> {counselling.barriers_action || 'None.'}</div>
            </div>
          </div>

          {/* Section 5: Pharmacist Intervention */}
          <div className="border p-3.5 rounded-lg bg-slate-50/50 branded-border space-y-1 text-[11px]">
            <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
              5. Clinical Pharmacist Intervention
            </strong>
            <div className="space-y-1">
              <div><strong className="text-slate-900">Problem Identified:</strong> {intervention.problem_identified || 'None.'}</div>
              <div><strong className="text-slate-900">Recommendation:</strong> {intervention.intervention_provided || 'None.'}</div>
              <div><strong className="text-slate-900">Physician Acceptance:</strong> <span className="font-bold" style={{ color: secondaryCol }}>{intervention.physician_acceptance || 'Accepted & Implemented.'}</span></div>
            </div>
          </div>

        </div>
      </PharmDVerseBrandedDocumentContainer>

      {/* PAGE 5 OF 5: DIR, ADR, DISCHARGE SUMMARY & SIGNATURES */}
      <PharmDVerseBrandedDocumentContainer
        college={cCollege}
        branding={branding}
        documentTitle="Clinical Case Logbook Record"
        caseId={caseId}
        student={cStudent}
        preceptorName={preceptorName}
        pageNumber="5 of 5"
        isLastPage={true}
        showSignatures={true}
      >
        <div className="space-y-4 text-xs">
          
          {/* Section 6: Drug Information Request (DIR) */}
          {dir.details_of_enquiry && (
            <div className="border p-3 rounded-lg bg-slate-50/50 branded-border space-y-1 text-[11px]">
              <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
                6. Drug Information Request (DIR)
              </strong>
              <div className="space-y-1">
                <div>Enquirer: <span className="font-bold">{dir.enquirer_name} ({dir.enquirer_category})</span></div>
                <div><strong className="text-slate-900">Details of Enquiry:</strong> {dir.details_of_enquiry}</div>
                <div><strong className="text-slate-900">Response Provided:</strong> {dir.information_provided}</div>
              </div>
            </div>
          )}

          {/* Section 7: Adverse Drug Reaction (ADR) Log */}
          <div className="border p-3 rounded-lg bg-amber-50/50 border-amber-300 text-amber-950 space-y-1 text-[11px]">
            <strong className="block border-b border-amber-200 pb-1 font-extrabold uppercase text-[11px] text-amber-900">
              7. Adverse Drug Reaction (ADR) Monitoring Log
            </strong>
            <div className="space-y-1">
              <div>Suspected Drug & Reaction: <span className="font-bold">{adr.suspected_drug || 'N/A'} — {adr.reaction_title || 'No ADR reported.'}</span></div>
              <div>Causality & Severity: <span>{adr.initial_causality_opinion || 'Unlikely'} (Score: {adr.naranjo_score || 'N/A'})</span></div>
              <div>Outcome: <span className="font-bold">{adr.patient_outcome || 'Resolved'}</span></div>
            </div>
          </div>

          {/* Discharge Summary Notes */}
          {profile.discharge_summary && (
            <div className="border p-3 rounded-lg bg-slate-50/60 branded-border space-y-1 text-[11px]">
              <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
                Discharge Summary & Hospital Course
              </strong>
              <div className="leading-relaxed">{profile.discharge_summary}</div>
            </div>
          )}

          {/* Institutional Case Approval Badge */}
          <div className="border-2 p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">PharmDVerse Verification Registry</div>
              <div className="font-bold">Case Status: OFFICIALLY APPROVED & LOCKED</div>
            </div>
            <div className="text-right text-[10px] font-mono text-slate-300">
              <div>Signed by: {cStudent.full_name || 'Student'}</div>
              <div>Approved by: {preceptorName}</div>
            </div>
          </div>

        </div>
      </PharmDVerseBrandedDocumentContainer>

    </div>
  );
};
