import React from 'react';
import { PharmDVerseBrandedDocumentContainer } from './PharmDVerseBrandedDocumentContainer';
import { buildNormalizedApprovedCaseData } from '../../utils/buildNormalizedApprovedCaseData';

/**
 * Unified Multi-Page Clinical Case PDF Document Renderer.
 * Consumes the central normalized data model from buildNormalizedApprovedCaseData.
 */
export const ClinicalCaseDocumentRenderer = ({
  caseData = {},
  branding = {},
  college = {},
  student = {},
  preceptor = {}
}) => {
  const norm = buildNormalizedApprovedCaseData({
    clinicalCase: caseData.clinicalCase,
    student: student?.full_name ? student : caseData.student,
    preceptor: preceptor?.full_name ? preceptor : caseData.preceptor,
    college: college?.college_name ? college : caseData.college,
    caseModulesData: caseData.caseModulesData
  });

  const cCollege = college?.college_name || college?.name ? college : (caseData.college || {});
  const cStudent = student?.full_name ? student : (caseData.student || {});
  const cPreceptor = preceptor?.full_name ? preceptor : (caseData.preceptor || {});

  const caseId = norm.caseId;
  const preceptorName = norm.preceptorName;
  const finalDiagnosis = norm.diagnosis.final;

  const secondaryCol = branding?.secondary_color || '#0284c7';

  const isProfileCompleted = norm.isProfileCompleted;
  const isCounsellingCompleted = norm.isCounsellingCompleted;
  const isInterventionCompleted = norm.isInterventionCompleted;
  const isDirCompleted = norm.isDirCompleted;
  const isAdrCompleted = norm.isAdrCompleted;

  const vitals = norm.vitals;
  const labs = norm.labs;
  const drugs = norm.drugs;

  const profile = norm.profile || {};
  const counselling = norm.counselling || {};
  const intervention = norm.intervention || {};
  const dir = norm.dir || {};
  const adr = norm.adr || {};

  // Extract Profile Demographics & History from central norm model
  const pName = norm.demographics.patientName;
  const pAge = norm.demographics.age;
  const pGender = norm.demographics.gender;
  const pIpOp = norm.demographics.ipOpNo;
  const pWard = norm.demographics.wardBed;
  const pDept = norm.demographics.department;
  const pDoa = norm.dates.doa;
  const pDod = norm.dates.dod;
  const pPhysician = norm.demographics.physician;

  const pHwt = (profile.height || profile.weight || profile.bmi)
    ? `Ht: ${profile.height || '—'} cm | Wt: ${profile.weight || '—'} kg | BMI: ${profile.bmi || '—'}`
    : null;

  const pAllergies = (profile.allergy_drugs || profile.allergy_food || profile.allergies)
    ? `Drug Allergies: ${profile.allergy_drugs || 'None'} | Food Allergies: ${profile.allergy_food || 'None'}`
    : null;

  const pSocial = profile.social_history || [
    profile.smoker_pack_day ? `Smoker (${profile.smoker_pack_day}/day)` : null,
    profile.alcoholic_amount_day ? `Alcoholic (${profile.alcoholic_amount_day})` : null,
    profile.marital_status
  ].filter(Boolean).join(', ') || 'Non-smoker, Non-alcoholic, Balanced diet.';

  const pGeneralExam = profile.general_examination || [
    profile.cyanosis ? `Cyanosis: ${profile.cyanosis}` : null,
    profile.icterus ? `Icterus: ${profile.icterus}` : null,
    profile.pallor ? `Pallor: ${profile.pallor}` : null
  ].filter(Boolean).join(' | ') || 'Conscious and coherent. No acute distress.';

  const pSystemicExam = profile.systemic_examination || [
    profile.cvs ? `CVS: ${profile.cvs}` : null,
    profile.rs ? `RS: ${profile.rs}` : null,
    profile.gi ? `GI: ${profile.gi}` : null,
    profile.cns ? `CNS: ${profile.cns}` : null
  ].filter(Boolean).join(' | ') || 'CVS: S1S2 heard. RS: NVBS. GI: Soft. CNS: Intact.';

  // Extract Counselling Data
  const cProvidedTo = counselling.counselling_provided_to || counselling.patient_type || 'Patient';
  const cMode = counselling.counselling_mode || counselling.counselling_aids_used || 'Oral';
  const cTime = counselling.time_taken || counselling.counselling_time || '15 min';
  const cDisease = counselling.disease_counselled || finalDiagnosis;
  const cFocus = counselling.focus_points || (Array.isArray(counselling.points_covered) ? counselling.points_covered.join(', ') : counselling.points_covered) || 'Compliance and dietary instructions provided.';
  const cBarriers = counselling.barriers_action || counselling.barrier_overcome || counselling.barrier_details || counselling.major_barriers_involved || 'None.';

  // Extract Intervention Data
  const iProblem = intervention.problem_identified || intervention.description_of_problem || (Array.isArray(intervention.prescription_problems) ? intervention.prescription_problems.join(', ') : intervention.prescription_problems) || 'None.';
  const iAction = intervention.intervention_provided || (Array.isArray(intervention.action_taken) ? intervention.action_taken.join(', ') : intervention.action_taken) || 'None.';
  const iRecs = (Array.isArray(intervention.recommendations) ? intervention.recommendations.join(', ') : intervention.recommendations) || '';
  const iAccepted = intervention.physician_acceptance || (intervention.accepted === true || intervention.accepted === 'Yes' ? 'Accepted & Implemented' : intervention.accepted === false || intervention.accepted === 'No' ? 'Not Accepted' : 'Accepted & Implemented');

  // Extract DIR Data
  const dirEnquirer = dir.enquirer_name ? `${dir.enquirer_name} (${dir.enquirer_category || dir.professional_status || dir.designation || 'Physician'})` : null;
  const dirRefs = [dir.ref_textbooks, dir.ref_journals, dir.ref_micromedex, dir.ref_clinirex, dir.ref_others].filter(Boolean).join(', ');

  // Extract ADR Data
  const adrDrug = adr.suspected_drug || (Array.isArray(adr.suspected_medications) && adr.suspected_medications[0] ? (adr.suspected_medications[0].drug_name || adr.suspected_medications[0].brand_name) : '') || 'N/A';
  const adrTitle = adr.reaction_title || adr.reaction_description || 'No ADR reported.';
  const adrCausality = adr.initial_causality_opinion || adr.reaction_severity || 'Unlikely';
  const adrScore = adr.naranjo_score || adr.causality_score || 'N/A';
  const adrOutcome = adr.patient_outcome || 'Resolved';

  return (
    <div id="official-clinical-case-pdf-container" className="space-y-8 print:space-y-0">
      
      {/* PAGE 1 OF 5: PATIENT PROFILE & SOCIAL HISTORY */}
      <PharmDVerseBrandedDocumentContainer
        college={cCollege}
        branding={branding}
        documentTitle="Patient Profile Documentation"
        caseId={caseId}
        student={cStudent}
        preceptor={cPreceptor}
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
              <div>Patient Name: <span className="font-bold text-slate-900">{pName}</span></div>
              <div>Age / Gender: <span className="font-bold text-slate-900">{pAge} Yrs / {pGender}</span></div>
              <div>IP / OP No: <span className="font-bold font-mono text-slate-900">{pIpOp}</span></div>
              <div>Ward / Bed No: <span>{pWard}</span></div>
              <div>Department: <span className="font-bold">{pDept}</span></div>
              <div>Date of Admission: <span className="font-mono font-bold">{pDoa}</span></div>
              {pDod !== 'N/A' && <div>Date of Discharge: <span className="font-mono font-bold">{pDod}</span></div>}
              <div>Attending Physician: <span className="font-bold">{pPhysician}</span></div>
              {pHwt && <div className="col-span-2 text-slate-700 font-medium">{pHwt}</div>}
            </div>

            {pAllergies && (
              <div className="pt-1 text-[11px] text-rose-700 font-semibold border-t border-rose-200">
                ⚠️ {pAllergies}
              </div>
            )}

            <div className="pt-2 text-[11px] border-t branded-border space-y-1.5 leading-relaxed">
              <div><strong className="text-slate-900">Chief Complaints:</strong> {profile.chief_complaints || cCase.chief_complaints || 'None recorded.'}</div>
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
                Social & Lifestyle History
              </strong>
              <div className="font-medium">{pSocial}</div>
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
        preceptor={cPreceptor}
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
              <div><strong className="text-slate-900">General Examination:</strong> {pGeneralExam}</div>
              <div><strong className="text-slate-900">Systemic Examination:</strong> {pSystemicExam}</div>
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
            {profile.provisional_diagnosis && (
              <div className="text-[11px] font-semibold text-slate-650">
                Provisional Diagnosis: {profile.provisional_diagnosis}
              </div>
            )}
            <h3 className="text-sm font-black text-emerald-900 uppercase">
              Final Diagnosis: {finalDiagnosis}
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
        preceptor={cPreceptor}
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
              <div className="leading-relaxed font-serif whitespace-pre-line">{profile.other_investigations}</div>
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
        preceptor={cPreceptor}
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
                      <td className="p-1.5 border-r font-bold branded-border">{d.trade_name || d.brand_name} {d.generic_name ? `(${d.generic_name})` : ''}</td>
                      <td className="p-1.5 border-r branded-border">{d.dose || 'N/A'} ({d.route_of_admin || d.route || 'Oral'})</td>
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

          {/* Section 4: Patient Counselling Record (Mandatory) */}
          <div className="border p-3.5 rounded-lg bg-slate-50/50 branded-border space-y-1.5 text-[11px]">
            <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
              4. Patient Counselling Record
            </strong>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>Counselled Provided To: <span className="font-bold">{cProvidedTo}</span></div>
              <div>Mode & Duration: <span className="font-bold">{cMode} ({cTime})</span></div>
              <div className="col-span-2">Disease & Meds Counselled: <span>{cDisease}</span></div>
              <div className="col-span-2"><strong className="text-slate-900">Key Focus & Advice:</strong> {cFocus}</div>
              {cBarriers && <div className="col-span-2"><strong className="text-slate-900">Barriers & Action:</strong> {cBarriers}</div>}
            </div>
          </div>

          {/* Section 5: Pharmacist Intervention (Optional — Render ONLY if completed) */}
          {isInterventionCompleted && (
            <div className="border p-3.5 rounded-lg bg-slate-50/50 branded-border space-y-1 text-[11px]">
              <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
                5. Clinical Pharmacist Intervention
              </strong>
              <div className="space-y-1">
                {iProblem !== 'None.' && <div><strong className="text-slate-900">Problem Identified:</strong> {iProblem}</div>}
                {iAction !== 'None.' && <div><strong className="text-slate-900">Action & Recommendation:</strong> {iAction} {iRecs ? `— ${iRecs}` : ''}</div>}
                <div><strong className="text-slate-900">Physician Acceptance:</strong> <span className="font-bold" style={{ color: secondaryCol }}>{iAccepted}</span></div>
              </div>
            </div>
          )}

        </div>
      </PharmDVerseBrandedDocumentContainer>

      {/* PAGE 5 OF 5: DIR, ADR, DISCHARGE SUMMARY & SIGNATURES */}
      <PharmDVerseBrandedDocumentContainer
        college={cCollege}
        branding={branding}
        documentTitle="Clinical Case Logbook Record"
        caseId={caseId}
        student={cStudent}
        preceptor={cPreceptor}
        preceptorName={preceptorName}
        pageNumber="5 of 5"
        isLastPage={true}
        showSignatures={true}
      >
        <div className="space-y-4 text-xs">
          
          {/* Section 6: Drug Information Request (DIR - Optional — Render ONLY if completed) */}
          {isDirCompleted && (
            <div className="border p-3 rounded-lg bg-slate-50/50 branded-border space-y-1 text-[11px]">
              <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
                6. Drug Information Request (DIR)
              </strong>
              <div className="space-y-1">
                {dirEnquirer && <div>Enquirer: <span className="font-bold">{dirEnquirer}</span></div>}
                {dir.details_of_enquiry && <div><strong className="text-slate-900">Details of Enquiry:</strong> {dir.details_of_enquiry}</div>}
                {dir.information_provided && <div><strong className="text-slate-900">Response Provided:</strong> {dir.information_provided}</div>}
                {dirRefs && <div><strong className="text-slate-900">References Consulted:</strong> {dirRefs}</div>}
              </div>
            </div>
          )}

          {/* Section 7: Adverse Drug Reaction (ADR) Log (Optional — Render ONLY if completed) */}
          {isAdrCompleted && (
            <div className="border p-3 rounded-lg bg-amber-50/50 border-amber-300 text-amber-950 space-y-1 text-[11px]">
              <strong className="block border-b border-amber-200 pb-1 font-extrabold uppercase text-[11px] text-amber-900">
                7. Adverse Drug Reaction (ADR) Monitoring Log
              </strong>
              <div className="space-y-1">
                <div>Suspected Drug & Reaction: <span className="font-bold">{adrDrug} — {adrTitle}</span></div>
                <div>Causality & Severity: <span>{adrCausality} (Score: {adrScore})</span></div>
                <div>Outcome: <span className="font-bold">{adrOutcome}</span></div>
              </div>
            </div>
          )}

          {/* Discharge Summary Notes */}
          {profile.discharge_summary && (
            <div className="border p-3 rounded-lg bg-slate-50/60 branded-border space-y-1 text-[11px]">
              <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
                Discharge Summary & Hospital Course
              </strong>
              <div className="leading-relaxed whitespace-pre-line">{profile.discharge_summary}</div>
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
