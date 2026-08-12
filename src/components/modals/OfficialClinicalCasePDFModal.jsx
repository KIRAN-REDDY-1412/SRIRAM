import React, { useState, useEffect } from 'react';
import { Download, X, Eye, Loader2, CheckCircle2, ShieldCheck, FileCheck2, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { fetchCaseModuleStatusesFromSupabase, fetchDocumentBrandingSettingsFromSupabase, fetchCollegeByIdFromSupabase } from '../../services/supabaseService';
import { ModalWrapper } from './ModalWrapper';
import { PharmDVerseBrandedDocumentContainer } from '../branding/PharmDVerseBrandedDocumentContainer';

export const OfficialClinicalCasePDFModal = ({ isOpen, onClose, clinicalCase, student, preceptor, college }) => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [caseModulesData, setCaseModulesData] = useState({});
  const [branding, setBranding] = useState(null);
  const [collegeData, setCollegeData] = useState(college);

  const caseId = clinicalCase?.case_id || 'AMRMCP-2026-000001';
  const fileName = `${caseId}_Approved.pdf`;
  const approvedDateStr = clinicalCase?.reviewed_at || clinicalCase?.approved_at
    ? new Date(clinicalCase.reviewed_at || clinicalCase.approved_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    const loadModules = async () => {
      if (!clinicalCase?.id) return;
      setLoading(true);
      const collegeId = college?.id || student?.college_id || clinicalCase?.college_id;
      const [res, brandRes, collegeRes] = await Promise.all([
        fetchCaseModuleStatusesFromSupabase(clinicalCase.id),
        collegeId ? fetchDocumentBrandingSettingsFromSupabase(collegeId) : Promise.resolve({ success: false }),
        collegeId ? fetchCollegeByIdFromSupabase(collegeId) : Promise.resolve({ success: false })
      ]);

      if (res.success) {
        setCaseModulesData(res.records || {});
      }
      if (brandRes.success && brandRes.settings) {
        setBranding(brandRes.settings);
      }
      if (collegeRes.success && collegeRes.college) {
        setCollegeData(collegeRes.college);
      } else {
        setCollegeData(college);
      }
      setLoading(false);
    };

    if (isOpen) {
      loadModules();
    }
  }, [isOpen, clinicalCase?.id, college?.id, student?.college_id, clinicalCase?.college_id]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('official-clinical-case-pdf-container');
    if (!element) return;

    setDownloading(true);
    try {
      const pageElements = element.querySelectorAll('.pharmdverse-document-page');
      const isLandscape = branding?.orientation?.toLowerCase() === 'landscape';
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: branding?.paper_size?.toLowerCase() === 'letter' ? 'letter' : 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const pagesToCapture = pageElements.length > 0 ? Array.from(pageElements) : [element];

      for (let i = 0; i < pagesToCapture.length; i++) {
        if (i > 0) pdf.addPage();
        const pageCanvas = await html2canvas(pagesToCapture[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = pageCanvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(fileName);
    } catch (err) {
      console.error('Failed to generate Official PDF:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  const profile = caseModulesData.profile || {};
  const counselling = caseModulesData.counselling || {};
  const intervention = caseModulesData.intervention || {};
  const dir = caseModulesData.dir || {};
  const adr = caseModulesData.adr || {};
  const labs = caseModulesData.labs || [];
  const drugs = caseModulesData.drugs || [];

  const finalCollegeObj = collegeData || college || student?.colleges;

  // Extract complete module fields
  const patientName = profile.patient_name || '—';
  const ageGender = profile.age && profile.gender ? `${profile.age} Yrs / ${profile.gender}` : (profile.age || profile.gender || '—');
  const ipNo = profile.ip_no || profile.ip_op_number || '—';
  const heightWeightBmi = [
    profile.height ? `Ht: ${profile.height} cm` : null,
    profile.weight ? `Wt: ${profile.weight} kg` : null,
    profile.bmi ? `BMI: ${profile.bmi} kg/m²` : null
  ].filter(Boolean).join(' | ');

  const dept = profile.department || clinicalCase?.department || '—';
  const ward = profile.ward || clinicalCase?.ward_unit || '—';
  const physician = profile.physician || '—';

  const complaints = profile.chief_complaints || '';
  const pastMedical = profile.past_medical_history || '';
  const pastMedication = profile.past_medication_history || '';
  const familyHist = profile.family_history || '';
  const socialHist = [
    profile.smoker_pack_day && profile.smoker_pack_day !== 'NIL' ? `Smoker: ${profile.smoker_pack_day} (${profile.smoker_duration || ''})` : null,
    profile.alcoholic_amount_day && profile.alcoholic_amount_day !== 'NIL' ? `Alcohol: ${profile.alcoholic_amount_day} (${profile.alcoholic_duration || ''})` : null,
    profile.marital_status ? `Marital Status: ${profile.marital_status}` : null
  ].filter(Boolean).join(' | ');

  const allergiesStr = [
    profile.allergy_drugs && profile.allergy_drugs !== 'NIL' ? `Drug Allergies: ${profile.allergy_drugs}` : null,
    profile.allergy_food && profile.allergy_food !== 'NIL' ? `Food Allergies: ${profile.allergy_food}` : null
  ].filter(Boolean).join(' | ');

  const generalExam = [
    profile.cyanosis ? `Cyanosis: ${profile.cyanosis}` : null,
    profile.icterus ? `Icterus: ${profile.icterus}` : null,
    profile.pallor ? `Pallor: ${profile.pallor}` : null
  ].filter(Boolean).join(' | ');

  const systemicExam = [
    profile.cvs ? `CVS: ${profile.cvs}` : null,
    profile.gi ? `GI: ${profile.gi}` : null,
    profile.rs ? `RS: ${profile.rs}` : null,
    profile.cns ? `CNS: ${profile.cns}` : null
  ].filter(Boolean).join(' | ');

  const diagnosisStr = profile.final_diagnosis || profile.provisional_diagnosis || clinicalCase?.final_diagnosis || 'Not specified';
  const vitalsList = Array.isArray(profile.vital_signs) ? profile.vital_signs : [];
  const otherInvStr = profile.other_investigations || '';
  const dischargeSumStr = profile.discharge_summary || '';

  // Counselling Data
  const counsellingDateVal = counselling.counselling_date ? new Date(counselling.counselling_date).toLocaleDateString() : '—';
  const counsellingTimeVal = counselling.counselling_time || '';
  const counsellingModeVal = counselling.patient_type || counselling.counselling_provided_to || 'In patient';
  const pointsCoveredList = Array.isArray(counselling.points_covered) ? counselling.points_covered : (counselling.points_covered ? [counselling.points_covered] : []);

  // Intervention Data
  const interDateVal = intervention.date_of_intervention ? new Date(intervention.date_of_intervention).toLocaleDateString() : '—';
  const interProblemsList = Array.isArray(intervention.prescription_problems) ? intervention.prescription_problems : (intervention.prescription_problems ? [intervention.prescription_problems] : []);
  const interActionsList = Array.isArray(intervention.action_taken) ? intervention.action_taken : (intervention.action_taken ? [intervention.action_taken] : []);
  const interRecsList = Array.isArray(intervention.recommendations) ? intervention.recommendations : (intervention.recommendations ? [intervention.recommendations] : []);
  const interPrescriptionList = Array.isArray(intervention.prescription_details) ? intervention.prescription_details : [];

  // ADR Data
  const adrSuspectedList = Array.isArray(adr.suspected_medications) ? adr.suspected_medications : [];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`Official Approved PDF Record`}
      subtitle={`Document: ${fileName}`}
      maxWidth={branding?.orientation === 'Landscape' ? 'max-w-6xl' : 'max-w-4xl'}
    >
      <div className="space-y-4 text-xs">
        {/* TOP ACTION BAR */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Official Clinical Record Approved</h4>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Branded PDF document with complete clinical student documentation.</p>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading || loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Download {fileName}</span>
          </button>
        </div>

        {/* PRINTABLE CONTAINER */}
        <div className="max-h-[65vh] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-100 dark:bg-slate-900/50">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
              <p className="font-semibold text-slate-500">Compiling Official Approved Clinical Case Record...</p>
            </div>
          ) : (
            <div id="official-clinical-case-pdf-container" className="space-y-6">
              
              {/* PAGE 1 OF 2 */}
              <PharmDVerseBrandedDocumentContainer
                college={finalCollegeObj}
                branding={branding}
                caseId={caseId}
                student={student}
                preceptorName={clinicalCase?.assigned_preceptor_name || preceptor?.full_name}
                pageNumber="1 of 2"
                showSignatures={false}
              >
                <div className="space-y-4 text-xs">

                  {/* MODULE 1: PATIENT PROFILE */}
                  {profile.id && (
                    <div className="space-y-3 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>1. Patient Profile & Clinical Demographics</span>
                        <span className="text-[10px] text-emerald-600 font-bold">🟢 Approved</span>
                      </h3>

                      <div className="grid grid-cols-3 gap-2 text-[11px] bg-white border border-slate-300 p-3 rounded-lg branded-border">
                        <div>Patient: <strong>{patientName}</strong></div>
                        <div>Age / Gender: <strong>{ageGender}</strong></div>
                        <div>IP/OP No: <strong>{ipNo}</strong></div>
                        {heightWeightBmi && <div className="col-span-3">Anthropometry: <strong>{heightWeightBmi}</strong></div>}
                        <div>Department: <strong>{dept}</strong></div>
                        <div>Ward: <strong>{ward}</strong></div>
                        <div>Physician: <strong>{physician}</strong></div>
                        {complaints && <div className="col-span-3">Chief Complaints: <strong>{complaints}</strong></div>}
                        {pastMedical && <div className="col-span-3">Past Medical History: <strong>{pastMedical}</strong></div>}
                        {pastMedication && <div className="col-span-3">Past Medication History: <strong>{pastMedication}</strong></div>}
                        {familyHist && <div className="col-span-3">Family History: <strong>{familyHist}</strong></div>}
                        {socialHist && <div className="col-span-3">Social History: <strong>{socialHist}</strong></div>}
                        {allergiesStr && <div className="col-span-3">Allergies: <strong>{allergiesStr}</strong></div>}
                        {generalExam && <div className="col-span-3">General Examination: <strong>{generalExam}</strong></div>}
                        {systemicExam && <div className="col-span-3">Systemic Examination: <strong>{systemicExam}</strong></div>}
                        <div className="col-span-3">Diagnosis: <strong>{diagnosisStr}</strong></div>
                        {otherInvStr && <div className="col-span-3">Other Investigations: <strong>{otherInvStr}</strong></div>}
                        {dischargeSumStr && <div className="col-span-3">Discharge Summary: <strong>{dischargeSumStr}</strong></div>}
                      </div>

                      {/* VITAL SIGNS TABLE */}
                      {vitalsList.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <strong className="block text-[11px] font-extrabold uppercase branded-subheading">
                            Vital Signs Log
                          </strong>
                          <table className="w-full text-left border border-collapse text-[10px] branded-border">
                            <thead className="font-bold uppercase text-[9px] border-b branded-header-bg branded-border">
                              <tr>
                                <th className="p-1.5 border-r branded-border">Date</th>
                                <th className="p-1.5 border-r branded-border">Temp (°F)</th>
                                <th className="p-1.5 border-r branded-border">BP (mmHg)</th>
                                <th className="p-1.5 border-r branded-border">Pulse Rate</th>
                                <th className="p-1.5 border-r branded-border">Resp Rate</th>
                                <th className="p-1.5">SpO2 (%)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y branded-border">
                              {vitalsList.map((v, idx) => (
                                <tr key={idx} className="border-b branded-border">
                                  <td className="p-1.5 border-r font-mono branded-border">{v.date}</td>
                                  <td className="p-1.5 border-r font-mono branded-border">{v.temp || '—'}</td>
                                  <td className="p-1.5 border-r font-mono font-bold branded-border">{v.bp || '—'}</td>
                                  <td className="p-1.5 border-r font-mono branded-border">{v.pr || '—'}</td>
                                  <td className="p-1.5 border-r font-mono branded-border">{v.rr || '—'}</td>
                                  <td className="p-1.5 font-mono font-bold branded-border">{v.spo2 ? `${v.spo2}%` : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* LAB INVESTIGATIONS TABLE */}
                      {labs.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <strong className="block text-[11px] font-extrabold uppercase branded-subheading">
                            Laboratory Investigations
                          </strong>
                          <table className="w-full text-left border border-collapse text-[10px] branded-border">
                            <thead className="font-bold uppercase text-[9px] border-b branded-header-bg branded-border">
                              <tr>
                                <th className="p-1.5 border-r branded-border">Category</th>
                                <th className="p-1.5 border-r branded-border">Parameter Name</th>
                                <th className="p-1.5 border-r branded-border">Observed Value</th>
                                <th className="p-1.5">Reference Range</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y branded-border">
                              {labs.map((l, idx) => (
                                <tr key={idx} className="border-b branded-border">
                                  <td className="p-1.5 border-r branded-border">{l.category || 'General'}</td>
                                  <td className="p-1.5 border-r font-bold branded-border">{l.parameter_name}</td>
                                  <td className="p-1.5 border-r font-mono font-bold branded-border">{l.test_value} {l.unit || ''}</td>
                                  <td className="p-1.5 border-r branded-border">{l.reference_range || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* PRESCRIBED PHARMACOTHERAPY TABLE */}
                      {drugs.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <strong className="block text-[11px] font-extrabold uppercase branded-subheading">
                            Prescribed Pharmacotherapy Log
                          </strong>
                          <table className="w-full text-left border border-collapse text-[10px] branded-border">
                            <thead className="font-bold uppercase text-[9px] border-b branded-header-bg branded-border">
                              <tr>
                                <th className="p-1.5 border-r branded-border">S.No</th>
                                <th className="p-1.5 border-r branded-border">Brand & Generic Name</th>
                                <th className="p-1.5 border-r branded-border">Dose & Route</th>
                                <th className="p-1.5">Frequency</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y branded-border">
                              {drugs.map((d, idx) => (
                                <tr key={idx} className="border-b branded-border">
                                  <td className="p-1.5 border-r text-center font-mono branded-border">{d.s_no || idx + 1}</td>
                                  <td className="p-1.5 border-r font-bold branded-border">
                                    {d.trade_name} {d.generic_name ? `(${d.generic_name})` : ''}
                                  </td>
                                  <td className="p-1.5 border-r branded-border">{d.dose} ({d.route_of_admin || 'Oral'})</td>
                                  <td className="p-1.5 font-mono font-bold branded-border">{d.frequency || 'OD'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </PharmDVerseBrandedDocumentContainer>

              {/* PAGE 2 OF 2 */}
              <PharmDVerseBrandedDocumentContainer
                college={finalCollegeObj}
                branding={branding}
                caseId={caseId}
                student={student}
                preceptorName={clinicalCase?.assigned_preceptor_name || preceptor?.full_name || 'Assigned Faculty Preceptor'}
                pageNumber="2 of 2"
                isLastPage={true}
                showSignatures={true}
              >
                <div className="space-y-4 text-xs">

                  {/* MODULE 2: PATIENT COUNSELLING */}
                  {counselling.id && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>2. Patient Counselling Record</span>
                        <span className="text-[10px] text-teal-600 font-bold">🟢 Approved</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white border border-slate-300 p-3 rounded-lg branded-border">
                        <div>Date & Time: <strong>{counsellingDateVal} {counsellingTimeVal}</strong></div>
                        <div>Counselling Mode / Patient Type: <strong>{counsellingModeVal} (Ward: {counselling.unit_ward || ward})</strong></div>
                        <div>Counselled To: <strong>{counselling.counselling_provided_to || 'Patient'}</strong></div>
                        <div>Time Duration: <strong>{counselling.time_taken || '15 min'}</strong></div>
                        {counselling.allergies && <div className="col-span-2">Allergies Noted: <strong>{counselling.allergies}</strong></div>}
                        {counselling.disease_counselled && <div className="col-span-2">Disease Counselled: <strong>{counselling.disease_counselled}</strong></div>}
                        {counselling.medications_counselled && <div className="col-span-2">Medications Counselled: <strong>{counselling.medications_counselled}</strong></div>}
                        
                        {pointsCoveredList.length > 0 && (
                          <div className="col-span-2 pt-1">
                            <span className="font-bold block mb-0.5">Key Focus & Points Covered:</span>
                            <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                              {pointsCoveredList.map((pt, idx) => (
                                <li key={idx}><strong>{pt}</strong></li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {counselling.counselling_aids_used && <div className="col-span-2">Aids / Leaflets Used: <strong>{counselling.counselling_aids_used}</strong></div>}
                        <div>Patient Understanding: <strong>{counselling.understanding_ascertained ? 'Ascertained & Confirmed' : 'Needs Review'}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* MODULE 3: PHARMACIST INTERVENTION */}
                  {intervention.id && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>3. Pharmacist Intervention Log</span>
                        <span className="text-[10px] text-indigo-600 font-bold">🟢 Approved</span>
                      </h3>
                      <div className="text-[11px] bg-white border border-slate-300 p-3 rounded-lg space-y-1.5 branded-border">
                        <div className="grid grid-cols-2 gap-2 pb-1 border-b border-slate-200">
                          <div>Date of Intervention: <strong>{interDateVal}</strong></div>
                          <div>Present Diagnosis: <strong>{intervention.present_diagnosis || diagnosisStr}</strong></div>
                        </div>

                        {interPrescriptionList.length > 0 && (
                          <div className="pt-1">
                            <span className="font-bold block mb-1">Prescription Items Under Review:</span>
                            <div className="flex flex-wrap gap-2">
                              {interPrescriptionList.map((item, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">
                                  {item.drug_name} ({item.dose_frequency})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {interProblemsList.length > 0 && <div>Problems Identified: <strong>{interProblemsList.join(', ')}</strong></div>}
                        {intervention.description_of_problem && <div>Detailed Description: <strong>{intervention.description_of_problem}</strong></div>}
                        {interActionsList.length > 0 && <div>Action Taken: <strong>{interActionsList.join(', ')} {intervention.action_taken_other || ''}</strong></div>}
                        {interRecsList.length > 0 && <div>Recommendations: <strong>{interRecsList.join(', ')} {intervention.recommendation_other || ''}</strong></div>}
                        
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                          <div>Physician Discussion: <strong>{intervention.discussed_with_physician ? 'Discussed with Physician' : 'Direct Patient Action'}</strong></div>
                          <div>Physician Acceptance: <strong>{intervention.accepted ? 'Accepted & Implemented' : 'Under Review'}</strong></div>
                          {intervention.significance_of_intervention && <div>Significance: <strong>{intervention.significance_of_intervention}</strong></div>}
                          {intervention.outcome && <div>Outcome: <strong>{intervention.outcome}</strong></div>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODULE 4: DRUG INFORMATION REQUEST */}
                  {dir.id && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>4. Drug Information Request</span>
                        <span className="text-[10px] text-cyan-600 font-bold">🟢 Approved</span>
                      </h3>
                      <div className="text-[11px] bg-white border border-slate-300 p-3 rounded-lg space-y-1 branded-border">
                        <div>Enquirer Name & Role: <strong>{dir.enquirer_name || 'Clinician'} ({dir.enquirer_category || 'Doctor'})</strong></div>
                        <div>Enquiry Details: <strong>{dir.details_of_enquiry || dir.background_info || 'Drug Query'}</strong></div>
                        {dir.sources_consulted && <div>Sources Consulted: <strong>{dir.sources_consulted}</strong></div>}
                        <div>Response Summary: <strong>{dir.information_provided || 'Provided via Micromedex / UpToDate'}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* MODULE 5: ADR DOCUMENTATION */}
                  {adr.id && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 branded-border">
                      <h3 className="text-xs font-black uppercase tracking-wider branded-heading flex items-center justify-between border-b pb-1 branded-border">
                        <span>5. Adverse Drug Reaction Log</span>
                        <span className="text-[10px] text-amber-600 font-bold">🟢 Approved</span>
                      </h3>
                      <div className="text-[11px] bg-white border border-slate-300 p-3 rounded-lg space-y-1 branded-border">
                        <div className="grid grid-cols-2 gap-2 pb-1 border-b border-slate-200">
                          <div>ADR Report No: <strong>{adr.adr_number || 'ADR-2026-001'}</strong></div>
                          <div>Reporting Date: <strong>{adr.reporting_date ? new Date(adr.reporting_date).toLocaleDateString() : '—'}</strong></div>
                          <div>Patient Initials / Reg: <strong>{adr.patient_initials || patientName} ({adr.hospital_reg_number || ipNo})</strong></div>
                          <div>Age / Gender / Wt: <strong>{adr.age || profile.age} Yrs / {adr.gender || profile.gender} / {adr.weight || profile.weight} kg</strong></div>
                        </div>

                        <div>Reaction Title & Category: <strong>{adr.reaction_title || adr.reaction_category || 'Suspected ADR'} ({adr.reaction_category || 'Dermatological'})</strong></div>
                        {adr.reaction_description && <div>Reaction Description: <strong>{adr.reaction_description}</strong></div>}
                        {adr.suspected_drug && <div>Suspected Drug: <strong>{adr.suspected_drug}</strong></div>}
                        
                        {adrSuspectedList.length > 0 && (
                          <div className="pt-1">
                            <span className="font-bold block mb-1">Suspected Medications:</span>
                            <div className="flex flex-wrap gap-2">
                              {adrSuspectedList.map((m, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px]">
                                  {m.drug_name} ({m.dose || 'Standard Dose'})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                          <div>Action Taken on Suspected Drug: <strong>{adr.action_taken_on_suspected_drug || 'Drug Withdrawn'}</strong></div>
                          <div>Initial Causality Opinion / Naranjo: <strong>{adr.initial_causality_opinion || adr.naranjo_score || 'Probable'}</strong></div>
                          <div>Severity: <strong>{adr.reaction_severity || 'Moderate'}</strong></div>
                          <div>Patient Outcome: <strong>{adr.patient_outcome || adr.current_patient_condition || 'Recovered'}</strong></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OFFICIAL PRECEPTOR APPROVAL BOX */}
                  <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/50 space-y-3 mt-6">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-700" />
                        <span className="font-black text-emerald-900 uppercase tracking-wider text-xs">Official Preceptor Approval & Verification</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-800">Status: APPROVED</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Reviewed & Approved By</span>
                        <strong className="text-slate-900 text-sm font-black">{clinicalCase?.assigned_preceptor_name || preceptor?.full_name || 'Assigned Faculty Preceptor'}</strong>
                        <span className="text-[11px] text-slate-600 block">Clinical Preceptor / Faculty Evaluator</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Approved On</span>
                        <strong className="text-slate-900 text-sm font-mono font-black">{approvedDateStr}</strong>
                        <span className="text-[10px] text-emerald-700 font-bold block mt-1">Verified via PharmDVerse Cloud</span>
                      </div>
                    </div>

                    {clinicalCase?.overall_preceptor_comments && (
                      <div className="pt-2 border-t border-emerald-200 text-[11px] text-slate-800">
                        <span className="font-bold block text-slate-700">Preceptor Comments:</span>
                        <p className="italic bg-white p-2 rounded border border-emerald-200 mt-1">{clinicalCase.overall_preceptor_comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              </PharmDVerseBrandedDocumentContainer>

            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
