import React from 'react';
import { PharmDVerseBrandedDocumentContainer } from './PharmDVerseBrandedDocumentContainer';
import { buildNormalizedApprovedCaseData } from '../../utils/buildNormalizedApprovedCaseData';

/**
 * Unified Multi-Page Clinical Case PDF Document Renderer.
 * Consumes the central normalized data model from buildNormalizedApprovedCaseData.
 * Strictly respects form boundaries, rendering only completed/submitted forms on fresh pages.
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

  const profile = norm.profile || {};
  const counselling = norm.counselling || {};
  const intervention = norm.intervention || {};
  const dir = norm.dir || {};
  const adr = norm.adr || {};

  const vitals = norm.vitals || [];
  const labs = norm.labs || [];
  const drugs = norm.drugs || [];

  // Demographics
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
    profile.marital_status ? `Marital: ${profile.marital_status}` : null
  ].filter(Boolean).join(', ') || 'Non-smoker, Non-alcoholic, Balanced diet.';

  const pGeneralExam = profile.general_examination || 'Conscious and coherent. No acute distress.';
  const pSystemicExam = profile.systemic_examination || 'CVS: S1S2 heard. RS: NVBS. GI: Soft. CNS: Intact.';

  // Determine active completed forms for dynamic page numbering
  const activeForms = [];
  if (norm.isProfileCompleted) activeForms.push('profile');
  if (norm.isCounsellingCompleted) activeForms.push('counselling');
  if (norm.isInterventionCompleted) activeForms.push('intervention');
  if (norm.isDirCompleted) activeForms.push('dir');
  if (norm.isAdrCompleted) activeForms.push('adr');

  const totalPageCount = activeForms.length || 1;
  let currentPageIndex = 1;

  return (
    <div id="official-clinical-case-pdf-container" className="space-y-8 print:space-y-0">
      
      {/* FORM 1: PATIENT PROFILE DOCUMENTATION */}
      {norm.isProfileCompleted && (
        <PharmDVerseBrandedDocumentContainer
          college={cCollege}
          branding={branding}
          documentTitle="Patient Profile Documentation"
          caseId={caseId}
          student={cStudent}
          preceptor={cPreceptor}
          preceptorName={preceptorName}
          pageNumber={`${currentPageIndex++} of ${totalPageCount}`}
          showSignatures={true}
          isLastPage={currentPageIndex > totalPageCount}
        >
          <div className="space-y-4 text-xs">
            
            {/* Patient Demographics */}
            <div className="border p-3.5 rounded-lg bg-slate-50/60 branded-border space-y-2.5">
              <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px] tracking-wide">
                Patient Demographics & Profile
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
                  Social & Lifestyle History
                </strong>
                <div className="font-medium">{pSocial}</div>
              </div>
            </div>

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

            {/* Laboratory Investigations Table */}
            <div className="space-y-1.5 text-xs">
              <strong className="block font-extrabold uppercase text-[11px] border-b pb-1 branded-heading branded-border">
                Laboratory Investigations
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

            {/* Prescribed Pharmacotherapy Log Table */}
            <div className="space-y-1.5 text-xs">
              <strong className="block font-extrabold uppercase text-[11px] border-b pb-1 branded-heading branded-border">
                Prescribed Medication Profile
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

            {/* Discharge Summary Notes (Belongs to Profile Form) */}
            {profile.discharge_summary && (
              <div className="border p-3 rounded-lg bg-slate-50/60 branded-border space-y-1 text-[11px]">
                <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
                  Discharge Summary & Instructions
                </strong>
                <div className="leading-relaxed whitespace-pre-line">{profile.discharge_summary}</div>
              </div>
            )}

          </div>
        </PharmDVerseBrandedDocumentContainer>
      )}

      {/* FORM 2: PATIENT COUNSELLING DOCUMENTATION */}
      {norm.isCounsellingCompleted && (
        <PharmDVerseBrandedDocumentContainer
          college={cCollege}
          branding={branding}
          documentTitle="Patient Counselling Documentation"
          caseId={caseId}
          student={cStudent}
          preceptor={cPreceptor}
          preceptorName={preceptorName}
          pageNumber={`${currentPageIndex++} of ${totalPageCount}`}
          showSignatures={true}
          isLastPage={currentPageIndex > totalPageCount}
        >
          <div className="space-y-4 text-xs">
            <div className="border p-3.5 rounded-lg bg-slate-50/60 branded-border space-y-2.5 text-[11px]">
              <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
                Patient Counselling Details
              </strong>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Counselled Provided To: <span className="font-bold">{counselling.counselling_provided_to || counselling.patient_type || 'Patient'}</span></div>
                <div>Mode & Duration: <span className="font-bold">{counselling.counselling_mode || 'Oral'} ({counselling.time_taken || '15 min'})</span></div>
                <div className="col-span-2">Disease Counselled: <span className="font-bold">{counselling.disease_counselled || finalDiagnosis}</span></div>
                <div className="col-span-2"><strong className="text-slate-900">Key Focus & Advice:</strong> {counselling.counselling_points || counselling.points_covered || 'Medication compliance, lifestyle & dietary restrictions.'}</div>
                {(counselling.barriers_action || counselling.barrier_details) && (
                  <div className="col-span-2"><strong className="text-slate-900">Barriers & Action Taken:</strong> {counselling.barriers_action || counselling.barrier_details}</div>
                )}
              </div>
            </div>
          </div>
        </PharmDVerseBrandedDocumentContainer>
      )}

      {/* FORM 3: PHARMACIST INTERVENTION DOCUMENTATION */}
      {norm.isInterventionCompleted && (
        <PharmDVerseBrandedDocumentContainer
          college={cCollege}
          branding={branding}
          documentTitle="Pharmacist Intervention Documentation"
          caseId={caseId}
          student={cStudent}
          preceptor={cPreceptor}
          preceptorName={preceptorName}
          pageNumber={`${currentPageIndex++} of ${totalPageCount}`}
          showSignatures={true}
          isLastPage={currentPageIndex > totalPageCount}
        >
          <div className="space-y-4 text-xs">
            <div className="border p-3.5 rounded-lg bg-slate-50/60 branded-border space-y-2 text-[11px]">
              <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
                Clinical Pharmacist Intervention Details
              </strong>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Intervention Date: <span className="font-mono font-bold">{norm.dates.interventionDate}</span></div>
                <div>Reporting Date: <span className="font-mono font-bold">{norm.dates.reportingDate}</span></div>
                <div className="col-span-2"><strong className="text-slate-900">Problem Identified:</strong> {intervention.prescription_problems || intervention.description_of_problem || intervention.problem_identified || 'None'}</div>
                <div className="col-span-2"><strong className="text-slate-900">Action & Recommendation:</strong> {intervention.recommendations || intervention.action_taken || intervention.intervention_provided || 'None'}</div>
                <div>Physician Acceptance: <span className="font-bold text-emerald-700">{intervention.physician_acceptance || intervention.status || 'Accepted'}</span></div>
                <div>Clinical Outcome: <span className="font-bold">{intervention.outcome || intervention.clinical_outcome || 'Positive / Resolved'}</span></div>
              </div>
            </div>
          </div>
        </PharmDVerseBrandedDocumentContainer>
      )}

      {/* FORM 4: DRUG INFORMATION REQUEST DOCUMENTATION */}
      {norm.isDirCompleted && (
        <PharmDVerseBrandedDocumentContainer
          college={cCollege}
          branding={branding}
          documentTitle="Drug Information Request Documentation"
          caseId={caseId}
          student={cStudent}
          preceptor={cPreceptor}
          preceptorName={preceptorName}
          pageNumber={`${currentPageIndex++} of ${totalPageCount}`}
          showSignatures={true}
          isLastPage={currentPageIndex > totalPageCount}
        >
          <div className="space-y-4 text-xs">
            <div className="border p-3.5 rounded-lg bg-slate-50/60 branded-border space-y-2 text-[11px]">
              <strong className="block border-b pb-1 font-extrabold uppercase branded-heading branded-border text-[11px]">
                Drug Information Query Details
              </strong>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Query Date: <span className="font-mono font-bold">{norm.dates.queryDate}</span></div>
                <div>Enquirer: <span className="font-bold">{dir.enquirer_name || 'Physician'} ({dir.enquirer_category || dir.professional_status || 'Doctor'})</span></div>
                <div>Category of Enquiry: <span>{dir.category_of_enquiry || 'Therapeutic Dosing'}</span></div>
                <div>Turnaround Time: <span>{dir.turnaround_time || 'Immediate (<1 hr)'}</span></div>
                <div className="col-span-2"><strong className="text-slate-900">Details of Query:</strong> {dir.details_of_enquiry || dir.query || 'N/A'}</div>
                <div className="col-span-2"><strong className="text-slate-900">Response Provided:</strong> {dir.information_provided || dir.response || 'N/A'}</div>
              </div>
            </div>
          </div>
        </PharmDVerseBrandedDocumentContainer>
      )}

      {/* FORM 5: ADR DOCUMENTATION LOG */}
      {norm.isAdrCompleted && (
        <PharmDVerseBrandedDocumentContainer
          college={cCollege}
          branding={branding}
          documentTitle="ADR Documentation Log"
          caseId={caseId}
          student={cStudent}
          preceptor={cPreceptor}
          preceptorName={preceptorName}
          pageNumber={`${currentPageIndex++} of ${totalPageCount}`}
          showSignatures={true}
          isLastPage={true}
        >
          <div className="space-y-4 text-xs">
            <div className="border p-3.5 rounded-lg bg-amber-50/60 border-amber-300 text-amber-950 space-y-2 text-[11px]">
              <strong className="block border-b border-amber-200 pb-1 font-extrabold uppercase text-[11px] text-amber-900">
                Adverse Drug Reaction Monitoring Log
              </strong>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>ADR Onset Date: <span className="font-mono font-bold">{norm.dates.adrOnsetDate}</span></div>
                <div>Suspected Drug: <span className="font-bold">{adr.suspected_drug || 'N/A'}</span></div>
                <div className="col-span-2"><strong className="text-amber-900">Reaction Description:</strong> {adr.reaction_title || adr.reaction_description || 'Nil'}</div>
                <div>Causality (Naranjo): <span className="font-bold">{adr.naranjo_causality || adr.initial_causality_opinion || 'Possible'}</span></div>
                <div>Reaction Severity: <span className="font-bold">{adr.reaction_severity || 'Moderate'}</span></div>
              </div>
            </div>
          </div>
        </PharmDVerseBrandedDocumentContainer>
      )}

    </div>
  );
};
