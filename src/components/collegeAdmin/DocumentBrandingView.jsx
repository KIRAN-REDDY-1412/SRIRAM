import React, { useState, useEffect } from 'react';
import { FileText, Save, RefreshCw, Eye, CheckCircle2, AlertTriangle, Loader2, Sparkles, Sliders, Type, Layout, ShieldCheck, Printer, Building, MonitorPlay, Info, Presentation } from 'lucide-react';
import { fetchDocumentBrandingSettingsFromSupabase, saveOrUpdateDocumentBrandingSettingsInSupabase, fetchCollegeByIdFromSupabase } from '../../services/supabaseService';
import { InlineActionNotification } from '../common/InlineActionNotification';
import { useInlineNotification } from '../../hooks/useInlineNotification';
import { ModalWrapper } from '../modals/ModalWrapper';
import { PharmDVerseBrandedDocumentContainer } from '../branding/PharmDVerseBrandedDocumentContainer';
import { ClinicalCaseDocumentRenderer } from '../branding/ClinicalCaseDocumentRenderer';
import { SAMPLE_CLINICAL_CASE_DATA } from '../../utils/sampleClinicalCaseDATA';

const DEFAULT_SETTINGS = {
  show_college_logo: true,
  show_college_name: true,
  show_autonomous: true,
  show_hospital_logo: true,
  show_hospital_name: true,
  watermark_enabled: true,
  watermark_text_line1: 'PHARMDVERSE',
  watermark_text_line2: 'Clinical Documentation System',
  watermark_opacity: 10,
  watermark_position: 'Center',
  footer_left_text: 'PharmDVerse',
  footer_center_text: 'Confidential Clinical Documentation',
  show_page_number: true,
  show_generated_datetime: true,
  paper_size: 'A4',
  orientation: 'Portrait',
  margin_top: '15mm',
  margin_bottom: '15mm',
  margin_left: '15mm',
  margin_right: '15mm',
  font_family: 'Times New Roman',
  title_font_size: '18px',
  heading_font_size: '14px',
  body_font_size: '12px',
  primary_color: '#0f172a',
  secondary_color: '#0284c7',
  table_header_color: '#f1f5f9',
  border_color: '#0f172a',
  text_color: '#0f172a',
  zebra_striping: false,
  repeat_table_header: true,
  repeat_header: true,
  repeat_footer: true,
  show_student_signature: true,
  show_preceptor_signature: true
};

const SampleTwoPageDocument = ({ college, settings }) => {
  return (
    <ClinicalCaseDocumentRenderer
      caseData={SAMPLE_CLINICAL_CASE_DATA}
      branding={settings}
      college={college}
      student={SAMPLE_CLINICAL_CASE_DATA.student}
      preceptor={SAMPLE_CLINICAL_CASE_DATA.preceptor}
    />
  );
};

const SamplePptSlidePreview = ({ college, pptSettings }) => {
  const [slideNum, setSlideNum] = useState(1);
  const collegeName = pptSettings?.header_title || college?.college_name || college?.name || 'A.M.REDDY MEMORIAL COLLEGE OF PHARMACY';
  const hospitalName = college?.hospital_name || 'Lalitha Superspecialities Hospital';
  const fontFamily = pptSettings?.font_family || 'Times New Roman';
  const titleSize = pptSettings?.ppt_title_font_size || '22px';
  const subHeadingSize = pptSettings?.ppt_subheading_font_size || '20px';
  const bodySize = pptSettings?.ppt_body_font_size || '18px';
  const footerText = pptSettings?.footer_text || 'Pharm.D Clinical Case Presentation • Confidential';

  return (
    <div className="space-y-4">
      {/* Slide Navigation Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-md">
        <div className="flex items-center gap-2">
          <Presentation className="w-4 h-4 text-amber-400" />
          <span>PPT Slide Format Preview ({pptSettings?.aspect_ratio || '16:9'}) • Theme: {pptSettings?.theme || 'Clinical Emerald'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSlideNum(prev => Math.max(1, prev - 1))}
            disabled={slideNum === 1}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold transition-colors"
          >
            ← Prev Slide
          </button>
          <span className="font-mono text-amber-300 px-1 font-bold">Slide {slideNum} of 7</span>
          <button
            type="button"
            onClick={() => setSlideNum(prev => Math.min(7, prev + 1))}
            disabled={slideNum === 7}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold transition-colors"
          >
            Next Slide →
          </button>
        </div>
      </div>

      {/* Slide Screen Frame */}
      <div className="border-4 border-slate-900 rounded-3xl p-6 bg-white shadow-2xl space-y-6 text-slate-900 min-h-[420px] flex flex-col justify-between" style={{ fontFamily }}>
        {slideNum === 1 && (
          <div className="space-y-5">
            {/* Header Box with Dual Logos (College Left, Hospital Right) */}
            <div className="p-4 bg-slate-100 rounded-2xl border-2 border-slate-900 flex items-center justify-between gap-4">
              {/* College Logo (Left) */}
              {pptSettings?.show_logo !== false && (college?.college_logo_url || college?.logo_url) ? (
                <img src={college.college_logo_url || college.logo_url} alt="College Logo" className="w-14 h-14 object-contain rounded" />
              ) : (
                <img src="/logo.png" alt="College Logo" className="w-14 h-14 object-contain rounded" />
              )}

              {/* College & Hospital Name (Center) */}
              <div className="flex-1 text-center space-y-0.5">
                <h2 className="font-extrabold uppercase text-slate-900" style={{ fontSize: titleSize }}>
                  {collegeName}
                </h2>
                <p className="text-slate-600 italic font-semibold" style={{ fontSize: subHeadingSize }}>
                  (Autonomous) • {hospitalName}
                </p>
              </div>

              {/* Hospital Logo (Right Side - Lalitha Group of Hospitals) */}
              {pptSettings?.show_hospital_logo !== false && (
                <img src={college?.hospital_logo_url || '/hospital-logo.jpg'} alt="Lalitha Hospital Logo" className="w-14 h-14 object-contain rounded" />
              )}
            </div>

            {/* Case ID Banner */}
            <div className="p-2.5 bg-slate-900 text-white rounded-xl text-center font-mono font-bold" style={{ fontSize: bodySize }}>
              CASE ID : AMRMCP-2026-Y22PHD0316-0002
            </div>

            {/* Main Presentation Title */}
            <div className="text-center space-y-2 py-2">
              <h1 className="font-black text-emerald-700 uppercase tracking-tight" style={{ fontSize: `calc(${titleSize} + 4px)` }}>
                CLINICAL CASE PRESENTATION
              </h1>
              <p className="font-bold text-slate-800" style={{ fontSize: subHeadingSize }}>
                Final Diagnosis: IBD WITH TERMINAL ILETIS
              </p>
            </div>

            {/* Student & Preceptor Metadata - Split Left (Preceptor) / Right (Submitted By) */}
            {pptSettings?.show_student_preceptor !== false && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-300 grid grid-cols-2 gap-4 text-xs" style={{ fontSize: bodySize }}>
                {/* LEFT SIDE: PRECEPTOR */}
                <div className="text-left space-y-1 border-r border-slate-200 pr-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Evaluated & Approved By:</span>
                  <strong className="text-emerald-700 font-extrabold text-sm block">Dr. A. Sharma, M.D.</strong>
                  <span className="text-[11px] text-slate-600 block">Faculty Preceptor / Evaluator</span>
                </div>

                {/* RIGHT SIDE: SUBMITTED BY STUDENT */}
                <div className="text-right space-y-1 pl-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Submitted / Presented By:</span>
                  <strong className="text-slate-900 font-extrabold text-sm block">John Doe</strong>
                  <span className="text-[11px] text-slate-600 block font-mono">Roll No: Y22PHD0316</span>
                </div>
              </div>
            )}
          </div>
        )}

        {slideNum === 2 && (
          <div className="space-y-4">
            <h2 className="font-extrabold text-slate-900 border-b pb-2 border-slate-300 flex items-center justify-between" style={{ fontSize: titleSize }}>
              <span>1. Patient Profile, Demographics & Social History</span>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 font-bold">🟢 Approved</span>
            </h2>

            <table className="w-full text-left border-collapse border border-slate-300 rounded-xl overflow-hidden text-xs" style={{ fontSize: bodySize }}>
              <tbody>
                <tr className="border-b border-slate-300 bg-slate-100">
                  <th className="p-2 font-bold border-r border-slate-300">Patient Initials & Reg No</th>
                  <td className="p-2">BB (46 Yrs / Male / IP: 123456789)</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <th className="p-2 font-bold border-r border-slate-300">Department & Ward</th>
                  <td className="p-2">Gastroenterology (Female Medical Ward)</td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-100">
                  <th className="p-2 font-bold border-r border-slate-300">Chief Complaints</th>
                  <td className="p-2">Abdominal pain during defication for 3 days</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <th className="p-2 font-bold border-r border-slate-300">Past History</th>
                  <td className="p-2">Medical: Appendectomy P/S | Medication: Nil</td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-100">
                  <th className="p-2 font-bold border-r border-slate-300">Family History</th>
                  <td className="p-2">No history of hereditary systemic illness</td>
                </tr>
                <tr>
                  <th className="p-2 font-bold border-r border-slate-300 text-sky-800">Social History</th>
                  <td className="p-2 font-bold text-sky-700">Marital Status: Married | Non-smoker, Non-alcoholic, Mixed diet</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {slideNum === 3 && (
          <div className="space-y-4">
            <h2 className="font-extrabold text-slate-900 border-b pb-2 border-slate-300 flex items-center justify-between" style={{ fontSize: titleSize }}>
              <span>2. Vital Signs Log & Clinical Examinations</span>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 font-bold">🟢 Approved</span>
            </h2>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-1 text-xs" style={{ fontSize: bodySize }}>
              <div><strong>General Examination:</strong> Cyanosis: Absent | Icterus: Absent | Pallor: Absent</div>
              <div><strong>Systemic Examination:</strong> CVS: S1S2+ | GI: Soft and Tenderness | RS: B/L AE+ | CNS: HMF+NEND+</div>
            </div>

            <table className="w-full text-left border-collapse border border-slate-300 rounded-xl overflow-hidden text-xs" style={{ fontSize: bodySize }}>
              <thead className="bg-slate-100 font-bold">
                <tr className="border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">Date</th>
                  <th className="p-2 border-r border-slate-300">Temp (°F)</th>
                  <th className="p-2 border-r border-slate-300">BP (mmHg)</th>
                  <th className="p-2 border-r border-slate-300">Pulse</th>
                  <th className="p-2 border-r border-slate-300">Resp Rate</th>
                  <th className="p-2">SpO2 (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="p-2 border-r border-slate-300">2025-10-08</td>
                  <td className="p-2 border-r border-slate-300">98.3</td>
                  <td className="p-2 border-r border-slate-300 font-bold">120/70</td>
                  <td className="p-2 border-r border-slate-300">67</td>
                  <td className="p-2 border-r border-slate-300">18</td>
                  <td className="p-2 font-bold">98%</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300">2025-11-08</td>
                  <td className="p-2 border-r border-slate-300">98.6</td>
                  <td className="p-2 border-r border-slate-300 font-bold">130/70</td>
                  <td className="p-2 border-r border-slate-300">70</td>
                  <td className="p-2 border-r border-slate-300">19</td>
                  <td className="p-2 font-bold">98%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {slideNum === 4 && (
          <div className="space-y-4">
            <h2 className="font-extrabold text-slate-900 border-b pb-2 border-slate-300 flex items-center justify-between" style={{ fontSize: titleSize }}>
              <span>3. Laboratory & Diagnostic Investigations</span>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 font-bold">🟢 Approved</span>
            </h2>

            <table className="w-full text-left border-collapse border border-slate-300 rounded-xl overflow-hidden text-xs" style={{ fontSize: bodySize }}>
              <thead className="bg-slate-100 font-bold">
                <tr className="border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">Category</th>
                  <th className="p-2 border-r border-slate-300">Parameter</th>
                  <th className="p-2 border-r border-slate-300">Observed Value</th>
                  <th className="p-2">Reference Range</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="p-2 border-r border-slate-300">Haematological</td>
                  <td className="p-2 border-r border-slate-300 font-bold">Hb %</td>
                  <td className="p-2 border-r border-slate-300 font-bold">13.0 g/dL</td>
                  <td className="p-2">11 - 16.5 %</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 border-r border-slate-300">Haematological</td>
                  <td className="p-2 border-r border-slate-300 font-bold">WBC Count</td>
                  <td className="p-2 border-r border-slate-300 font-bold">11,200 /cu.mm</td>
                  <td className="p-2">4000 - 11000</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300">Biochemistry</td>
                  <td className="p-2 border-r border-slate-300 font-bold">Blood Urea</td>
                  <td className="p-2 border-r border-slate-300 font-bold">24 mg/dL</td>
                  <td className="p-2">15 - 45 mg/dL</td>
                </tr>
              </tbody>
            </table>

            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1 text-xs text-sky-900" style={{ fontSize: bodySize }}>
              <strong className="block font-bold text-sky-900">Other Diagnostic Investigations:</strong>
              <div>HISTOPATHOLOGY REPORT: FOCAL CHOLESTEROLOSIS | US SCAN OF WHOLE ABDOMEN: RIGHT RENAL CORTICAL CYST.</div>
            </div>
          </div>
        )}

        {slideNum === 5 && (
          <div className="space-y-4">
            <h2 className="font-extrabold text-slate-900 border-b pb-2 border-slate-300 flex items-center justify-between" style={{ fontSize: titleSize }}>
              <span>4. Final Diagnosis & Prescribed Medications</span>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 font-bold">🟢 Approved</span>
            </h2>

            <div className="p-3 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-center">
              <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider block">Final Diagnosis</span>
              <strong className="text-lg font-black text-emerald-700">IBD WITH TERMINAL ILETIS</strong>
            </div>

            <table className="w-full text-left border-collapse border border-slate-300 rounded-xl overflow-hidden text-xs" style={{ fontSize: bodySize }}>
              <thead className="bg-slate-100 font-bold">
                <tr className="border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">S.No</th>
                  <th className="p-2 border-r border-slate-300">Brand & Generic Name</th>
                  <th className="p-2 border-r border-slate-300">Dose & Route</th>
                  <th className="p-2">Frequency</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="p-2 border-r border-slate-300 text-center">1</td>
                  <td className="p-2 border-r border-slate-300 font-bold">Inj. Ceftriaxone 1g</td>
                  <td className="p-2 border-r border-slate-300">1g (IV)</td>
                  <td className="p-2 font-bold">BD</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 border-r border-slate-300 text-center">2</td>
                  <td className="p-2 border-r border-slate-300 font-bold">Tab. Pantoprazole 40mg</td>
                  <td className="p-2 border-r border-slate-300">40mg (Oral)</td>
                  <td className="p-2 font-bold">OD (Before Food)</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300 text-center">3</td>
                  <td className="p-2 border-r border-slate-300 font-bold">Tab. Mesalamine 1.2g</td>
                  <td className="p-2 border-r border-slate-300">1.2g (Oral)</td>
                  <td className="p-2 font-bold">TID</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {slideNum === 6 && (
          <div className="space-y-4">
            <h2 className="font-extrabold text-slate-900 border-b pb-2 border-slate-300 flex items-center justify-between" style={{ fontSize: titleSize }}>
              <span>5. Patient Counselling & Pharmacist Interventions</span>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 font-bold">🟢 Approved</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ fontSize: bodySize }}>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-300 space-y-2">
                <h3 className="font-bold text-amber-800 uppercase text-xs tracking-wider border-b pb-1 border-slate-200">Patient Counselling Record</h3>
                <div>Counselling Provided To: <strong>Patient</strong></div>
                <div>Mode & Time: <strong>Oral & Leaflet (15 min)</strong></div>
                <div>Key Focus: <strong>Antibiotic compliance, glucose monitoring & hydration.</strong></div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-300 space-y-2">
                <h3 className="font-bold text-indigo-800 uppercase text-xs tracking-wider border-b pb-1 border-slate-200">Pharmacist Intervention</h3>
                <div>Problem Identified: <strong>Verified non-cross-reactivity with Ceftriaxone.</strong></div>
                <div>Recommendation: <strong>Spaced oral antidiabetic vs IV infusion.</strong></div>
                <div>Status: <strong className="text-emerald-700 font-bold">Accepted by Physician</strong></div>
              </div>
            </div>
          </div>
        )}

        {slideNum === 7 && (
          <div className="space-y-4">
            <h2 className="font-extrabold text-slate-900 border-b pb-2 border-slate-300 flex items-center justify-between" style={{ fontSize: titleSize }}>
              <span>6. ADR Log, Discharge Summary & Preceptor Approval</span>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 font-bold">🟢 Approved</span>
            </h2>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900" style={{ fontSize: bodySize }}>
              <strong className="block font-bold text-amber-900">ADR Log & Causality:</strong>
              <div>Reaction: Suspected ADR (Drug: Metformin) | Naranjo Causality: Probable | Outcome: Recovered</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-1 text-xs" style={{ fontSize: bodySize }}>
              <strong className="block font-bold text-slate-900">Discharge Summary:</strong>
              <div>A 54Y female patient was admitted with chief complaints of abdominal pain and vomiting. All investigations done. Patient treated with antibiotics, antiemetics, and discharged with supportive care.</div>
            </div>

            <div className="p-3 bg-emerald-50 border-2 border-emerald-600 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="block font-bold text-emerald-900 uppercase">Faculty Preceptor Verification</span>
                <strong className="text-slate-900 font-extrabold">Dr. A. Sharma, M.D.</strong>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs">STATUS: APPROVED</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-300 text-center text-xs text-slate-500 font-medium">
          {footerText}
        </div>
      </div>
    </div>
  );
};

export const DocumentBrandingView = ({ college: initialCollege }) => {
  const [college, setCollege] = useState(initialCollege);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPptPreviewModalOpen, setIsPptPreviewModalOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // PPT Format Settings State
  const [pptSettings, setPptSettings] = useState({
    theme: 'Clinical Emerald',
    aspect_ratio: '16:9 (Widescreen)',
    header_title: initialCollege?.college_name || initialCollege?.name || '',
    footer_text: 'Pharm.D Clinical Case Presentation • Confidential',
    show_logo: true,
    show_autonomous: true,
    show_student_preceptor: true
  });
  const [pptSaving, setPptSaving] = useState(false);
  const { notification: pptNotify, showNotification: showPptNotify, clearNotification: clearPptNotify } = useInlineNotification();
  const { notification: brandNotify, showNotification: showBrandNotify, clearNotification: clearBrandNotify } = useInlineNotification();

  useEffect(() => {
    setCollege(initialCollege);
    if (initialCollege?.college_name || initialCollege?.name) {
      setPptSettings(prev => ({
        ...prev,
        header_title: prev.header_title || initialCollege.college_name || initialCollege.name
      }));
    }
  }, [initialCollege]);

  // LIVE SYNCHRONIZATION FOR COLLEGE IDENTITY
  useEffect(() => {
    const handleCollegeUpdated = (e) => {
      if (e.detail) {
        setCollege(e.detail);
      }
    };
    window.addEventListener('pharmdverse_college_updated', handleCollegeUpdated);
    return () => window.removeEventListener('pharmdverse_college_updated', handleCollegeUpdated);
  }, []);

  const loadBranding = async () => {
    if (!college?.id) return;
    setLoading(true);

    // Load PPT settings from localStorage if available
    try {
      const savedPpt = localStorage.getItem(`pharmdverse_ppt_settings_${college.id}`);
      if (savedPpt) {
        setPptSettings(JSON.parse(savedPpt));
      }
    } catch (e) {}

    const [res, colRes] = await Promise.all([
      fetchDocumentBrandingSettingsFromSupabase(college.id),
      fetchCollegeByIdFromSupabase(college.id)
    ]);

    if (colRes.success && colRes.college) {
      setCollege(colRes.college);
    }

    if (res.success && res.settings) {
      setSettings({
        ...DEFAULT_SETTINGS,
        ...res.settings,
        show_college_logo: res.settings.show_college_logo ?? true,
        show_college_name: res.settings.show_college_name ?? true,
        show_autonomous: res.settings.show_autonomous ?? true,
        show_hospital_logo: res.settings.show_hospital_logo ?? true,
        show_hospital_name: res.settings.show_hospital_name ?? true,
        watermark_enabled: res.settings.watermark_enabled ?? true
      });
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBranding();
  }, [college?.id]);

  const handleChange = (key, value) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      window.dispatchEvent(new CustomEvent('pharmdverse_branding_updated', { detail: updated }));
      return updated;
    });
  };

  const handleToggle = (key) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      window.dispatchEvent(new CustomEvent('pharmdverse_branding_updated', { detail: updated }));
      return updated;
    });
  };

  const handleRestoreDefault = () => {
    setSettings(DEFAULT_SETTINGS);
    window.dispatchEvent(new CustomEvent('pharmdverse_branding_updated', { detail: DEFAULT_SETTINGS }));
  };

  const handleSave = async () => {
    if (!college?.id) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await saveOrUpdateDocumentBrandingSettingsInSupabase(college.id, settings);
    setSaving(false);

    if (res.success) {
      window.dispatchEvent(new CustomEvent('pharmdverse_branding_updated', { detail: settings }));
      showBrandNotify({
        type: 'success',
        message: '✓ PDF Format Settings saved successfully!'
      });
    } else {
      showBrandNotify({
        type: 'error',
        message: res.error || '✖ Failed to save PDF Format Settings.'
      });
    }
  };

  const handleSavePptFormat = async () => {
    if (!college?.id) return;
    setPptSaving(true);
    
    // Save to Supabase (and local storage backup)
    const combinedPayload = { ...settings, ...pptSettings };
    const res = await saveOrUpdateDocumentBrandingSettingsInSupabase(college.id, combinedPayload);
    try {
      localStorage.setItem(`pharmdverse_ppt_settings_${college.id}`, JSON.stringify(pptSettings));
    } catch (e) {}

    setPptSaving(false);
    if (res.success) {
      showPptNotify({
        type: 'success',
        message: '✓ PPT Format Settings saved successfully!'
      });
    } else {
      showPptNotify({
        type: 'error',
        message: res.error || '✖ Failed to save PPT Format Settings.'
      });
    }
  };

  const handleRestorePptDefault = () => {
    const def = {
      theme: 'Clinical Emerald',
      aspect_ratio: '16:9 (Widescreen)',
      header_title: college?.college_name || college?.name || 'Pharmacy College',
      footer_text: 'Pharm.D Clinical Case Presentation • Confidential',
      font_family: 'Times New Roman',
      ppt_title_font_size: '22px',
      ppt_subheading_font_size: '20px',
      ppt_body_font_size: '18px',
      show_logo: true,
      show_autonomous: true,
      show_student_preceptor: true
    };
    setPptSettings(def);
    try {
      if (college?.id) {
        localStorage.setItem(`pharmdverse_ppt_settings_${college.id}`, JSON.stringify(def));
      }
    } catch (e) {}
    showPptNotify({
      type: 'success',
      message: '✓ PPT Format Settings restored to default.'
    });
  };

  if (loading) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-500">Loading PDF & PPT Format Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      
      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>PDF Format Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized PDF & Print Format Settings for all clinical documentation modules in <strong className="text-slate-800 dark:text-slate-200">{college?.college_name || college?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>Preview Full A4</span>
          </button>

          <button
            type="button"
            onClick={handleRestoreDefault}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            <span>Restore Default</span>
          </button>

          <div className="flex items-center gap-2">
            <InlineActionNotification notification={brandNotify} onClose={clearBrandNotify} position="inline" />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save PDF Format'}</span>
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* FULL-WIDTH CONFIGURATION PANELS */}
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="space-y-6">
          
          {/* SECTION 1: COLLEGE & HOSPITAL IDENTITY (READ ONLY WITH MANDATORY MESSAGE) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Section 1: College & Hospital Identity
              </h3>
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                Read Only
              </span>
            </div>

            {/* MANDATORY PROMINENT MESSAGE */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2.5 shadow-xs">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>These details are managed from My College Profile.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs opacity-90">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                {college?.college_logo_url || college?.logoUrl ? (
                  <img src={college?.college_logo_url || college?.logoUrl} alt="College Logo" className="w-10 h-10 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 font-bold flex items-center justify-center">CL</div>
                )}
                <div>
                  <span className="text-[10px] text-slate-400 block">College Name:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{college?.college_name || college?.name}</strong>
                  {Boolean(college?.is_autonomous ?? college?.isAutonomous) && (
                    <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold italic">(Autonomous)</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                {college?.hospital_logo_url || college?.hospitalLogoUrl ? (
                  <img src={college?.hospital_logo_url || college?.hospitalLogoUrl} alt="Hospital Logo" className="w-10 h-10 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 font-bold flex items-center justify-center">HL</div>
                )}
                <div>
                  <span className="text-[10px] text-slate-400 block">Hospital Name:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{college?.hospital_name || college?.hospitalName || 'Lalitha Superspecialities Hospital'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: HEADER SETTINGS */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Section 2: Header Display Switches
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { key: 'show_college_logo', label: 'Show College Logo' },
                { key: 'show_college_name', label: 'Show College Name' },
                { key: 'show_autonomous', label: 'Show Autonomous' },
                { key: 'show_hospital_logo', label: 'Show Hospital Logo' },
                { key: 'show_hospital_name', label: 'Show Hospital Name' }
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleToggle(item.key)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    settings[item.key]
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-800 font-bold text-slate-900 dark:text-white'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                    settings[item.key] ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                  }`}>
                    {settings[item.key] ? 'ON' : 'OFF'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: WATERMARK */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Section 3: PDF Watermark
              </h3>
              <button
                type="button"
                onClick={() => handleToggle('watermark_enabled')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  settings.watermark_enabled ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                }`}
              >
                {settings.watermark_enabled ? 'Watermark Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Watermark Line 1</label>
                  <input type="text" value={settings.watermark_text_line1} onChange={(e) => handleChange('watermark_text_line1', e.target.value)} className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Watermark Line 2</label>
                  <input type="text" value={settings.watermark_text_line2} onChange={(e) => handleChange('watermark_text_line2', e.target.value)} className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Opacity ({settings.watermark_opacity}%)</label>
                  <input type="range" min={5} max={30} value={settings.watermark_opacity} onChange={(e) => handleChange('watermark_opacity', e.target.value)} className="w-full" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Position</label>
                  <select value={settings.watermark_position} onChange={(e) => handleChange('watermark_position', e.target.value)} className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                    <option value="Center">Center</option>
                    <option value="Diagonal">Diagonal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: FOOTER */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Layout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Section 4: Document Footer
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Left Footer Text</label>
                  <input type="text" value={settings.footer_left_text} onChange={(e) => handleChange('footer_left_text', e.target.value)} className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Center Footer Text</label>
                  <input type="text" value={settings.footer_center_text} onChange={(e) => handleChange('footer_center_text', e.target.value)} className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div onClick={() => handleToggle('show_page_number')} className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center ${settings.show_page_number ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200'}`}>
                  <span>Show Page Number</span>
                  <span className="text-[10px]">{settings.show_page_number ? 'YES' : 'NO'}</span>
                </div>

                <div onClick={() => handleToggle('show_generated_datetime')} className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center ${settings.show_generated_datetime ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200'}`}>
                  <span>Show Date & Time</span>
                  <span className="text-[10px]">{settings.show_generated_datetime ? 'YES' : 'NO'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTIONS 5 & 6: PAGE SETUP, MARGINS & TYPOGRAPHY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* SECTION 5: PAGE SETUP & MARGINS */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <Printer className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Page & Margins
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Paper Size</label>
                  <select value={settings.paper_size} onChange={(e) => handleChange('paper_size', e.target.value)} className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white">
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Orientation</label>
                  <select value={settings.orientation} onChange={(e) => handleChange('orientation', e.target.value)} className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white">
                    <option value="Portrait">Portrait</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>

                <div className="pt-1 grid grid-cols-2 gap-1.5 text-[10px]">
                  <div>
                    <label className="block text-slate-400 mb-0.5">Margin Top</label>
                    <select
                      value={settings.margin_top || '15mm'}
                      onChange={(e) => handleChange('margin_top', e.target.value)}
                      className="w-full h-7 px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 font-mono text-slate-900 dark:text-white font-bold"
                    >
                      <option value="5mm">5 mm</option>
                      <option value="10mm">10 mm</option>
                      <option value="15mm">15 mm (Default)</option>
                      <option value="20mm">20 mm</option>
                      <option value="25mm">25 mm</option>
                      <option value="30mm">30 mm</option>
                      <option value="35mm">35 mm</option>
                      <option value="40mm">40 mm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-0.5">Margin Bottom</label>
                    <select
                      value={settings.margin_bottom || '15mm'}
                      onChange={(e) => handleChange('margin_bottom', e.target.value)}
                      className="w-full h-7 px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 font-mono text-slate-900 dark:text-white font-bold"
                    >
                      <option value="5mm">5 mm</option>
                      <option value="10mm">10 mm</option>
                      <option value="15mm">15 mm (Default)</option>
                      <option value="20mm">20 mm</option>
                      <option value="25mm">25 mm</option>
                      <option value="30mm">30 mm</option>
                      <option value="35mm">35 mm</option>
                      <option value="40mm">40 mm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-0.5">Margin Left</label>
                    <select
                      value={settings.margin_left || '15mm'}
                      onChange={(e) => handleChange('margin_left', e.target.value)}
                      className="w-full h-7 px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 font-mono text-slate-900 dark:text-white font-bold"
                    >
                      <option value="5mm">5 mm</option>
                      <option value="10mm">10 mm</option>
                      <option value="15mm">15 mm (Default)</option>
                      <option value="20mm">20 mm</option>
                      <option value="25mm">25 mm</option>
                      <option value="30mm">30 mm</option>
                      <option value="35mm">35 mm</option>
                      <option value="40mm">40 mm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-0.5">Margin Right</label>
                    <select
                      value={settings.margin_right || '15mm'}
                      onChange={(e) => handleChange('margin_right', e.target.value)}
                      className="w-full h-7 px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 font-mono text-slate-900 dark:text-white font-bold"
                    >
                      <option value="5mm">5 mm</option>
                      <option value="10mm">10 mm</option>
                      <option value="15mm">15 mm (Default)</option>
                      <option value="20mm">20 mm</option>
                      <option value="25mm">25 mm</option>
                      <option value="30mm">30 mm</option>
                      <option value="35mm">35 mm</option>
                      <option value="40mm">40 mm</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 6: TYPOGRAPHY & FONT SIZES */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <Type className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Typography & Font Sizes
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Font Family (Font Type)</label>
                  <select value={settings.font_family} onChange={(e) => handleChange('font_family', e.target.value)} className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white">
                    <option value="Times New Roman">Times New Roman (Serif)</option>
                    <option value="Calibri">Calibri (Sans-serif)</option>
                    <option value="Arial">Arial (Sans-serif)</option>
                    <option value="Georgia">Georgia (Serif)</option>
                    <option value="Inter">Inter (Clean Modern)</option>
                    <option value="Roboto">Roboto (Technical)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div>
                    <label className="block text-slate-400 mb-0.5">Title Pt</label>
                    <select value={settings.title_font_size} onChange={(e) => handleChange('title_font_size', e.target.value)} className="w-full h-7 px-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white">
                      <option value="10pt">10pt</option>
                      <option value="11pt">11pt</option>
                      <option value="12pt">12pt</option>
                      <option value="14pt">14pt</option>
                      <option value="16pt">16pt</option>
                      <option value="18pt">18pt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Heading Pt</label>
                    <select value={settings.heading_font_size} onChange={(e) => handleChange('heading_font_size', e.target.value)} className="w-full h-7 px-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white">
                      <option value="10pt">10pt</option>
                      <option value="11pt">11pt</option>
                      <option value="12pt">12pt</option>
                      <option value="14pt">14pt</option>
                      <option value="16pt">16pt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Body Pt</label>
                    <select value={settings.body_font_size} onChange={(e) => handleChange('body_font_size', e.target.value)} className="w-full h-7 px-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white">
                      <option value="10pt">10pt</option>
                      <option value="11pt">11pt</option>
                      <option value="12pt">12pt</option>
                      <option value="14pt">14pt</option>
                      <option value="16pt">16pt</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION 7: PDF MULTI-PAGE CONTROLS & SIGNATURES */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Section 7: PDF Multi-Page Controls & Signatures
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div onClick={() => handleToggle('repeat_header')} className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${settings.repeat_header ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 font-bold text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                <div>
                  <span className="block font-bold">Repeat Header</span>
                  <span className="text-[10px] text-slate-400 font-normal">Header on every page</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${settings.repeat_header ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
                  {settings.repeat_header ? 'ON' : 'OFF'}
                </span>
              </div>

              <div onClick={() => handleToggle('repeat_footer')} className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${settings.repeat_footer ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 font-bold text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                <div>
                  <span className="block font-bold">Repeat Footer</span>
                  <span className="text-[10px] text-slate-400 font-normal">Footer on every page</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${settings.repeat_footer ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
                  {settings.repeat_footer ? 'ON' : 'OFF'}
                </span>
              </div>

              <div onClick={() => handleToggle('show_student_signature')} className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${settings.show_student_signature ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 font-bold text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                <div>
                  <span className="block font-bold">Student Sig</span>
                  <span className="text-[10px] text-slate-400 font-normal">Display signature line</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${settings.show_student_signature ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
                  {settings.show_student_signature ? 'SHOW' : 'HIDE'}
                </span>
              </div>

              <div onClick={() => handleToggle('show_preceptor_signature')} className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${settings.show_preceptor_signature ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 font-bold text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                <div>
                  <span className="block font-bold">Preceptor Sig</span>
                  <span className="text-[10px] text-slate-400 font-normal">Display signature line</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${settings.show_preceptor_signature ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
                  {settings.show_preceptor_signature ? 'SHOW' : 'HIDE'}
                </span>
              </div>

              <div onClick={() => handleToggle('zebra_striping')} className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${settings.zebra_striping ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-400 font-bold text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                <div>
                  <span className="block font-bold">Zebra Striping</span>
                  <span className="text-[10px] text-slate-400 font-normal">Alternating table rows</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${settings.zebra_striping ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
                  {settings.zebra_striping ? 'ON' : 'OFF'}
                </span>
              </div>

              <div onClick={() => handleToggle('repeat_table_header')} className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${settings.repeat_table_header ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-400 font-bold text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                <div>
                  <span className="block font-bold">Repeat Table Th</span>
                  <span className="text-[10px] text-slate-400 font-normal">Table header on split</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${settings.repeat_table_header ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
                  {settings.repeat_table_header ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>



        </div>

      </div>

      {/* PPT FORMAT CONFIGURATION SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Presentation className="w-5 h-5 text-amber-500" />
              <span>PPT Format Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize presentation slides layout, header, themes, and presentation export formats for student case presentations.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsPptPreviewModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Preview PPT Slides</span>
            </button>

            <button
              type="button"
              onClick={handleRestorePptDefault}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>Restore PPT Default</span>
            </button>

            <InlineActionNotification notification={pptNotify} onClose={clearPptNotify} position="inline" />
            <button
              type="button"
              onClick={handleSavePptFormat}
              disabled={pptSaving}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              {pptSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{pptSaving ? 'Saving...' : 'Save PPT Format'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* PPT Theme */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Presentation Theme
            </label>
            <select
              value={pptSettings.theme}
              onChange={(e) => setPptSettings(prev => ({ ...prev, theme: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="Clinical Emerald">Clinical Emerald (Recommended)</option>
              <option value="Modern Navy">Modern Navy</option>
              <option value="Academic Indigo">Academic Indigo</option>
              <option value="Classic White">Classic Minimal White</option>
            </select>
          </div>

          {/* Slide Aspect Ratio */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Slide Aspect Ratio
            </label>
            <select
              value={pptSettings.aspect_ratio}
              onChange={(e) => setPptSettings(prev => ({ ...prev, aspect_ratio: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="16:9 (Widescreen)">16:9 (Widescreen - Modern HDTV)</option>
              <option value="4:3 (Standard)">4:3 (Standard Projector)</option>
            </select>
          </div>

          {/* PPT Font Family */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              PPT Font Family
            </label>
            <select
              value={pptSettings.font_family || 'Times New Roman'}
              onChange={(e) => setPptSettings(prev => ({ ...prev, font_family: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="Times New Roman">Times New Roman (Recommended)</option>
              <option value="Arial">Arial</option>
              <option value="Calibri">Calibri</option>
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>

          {/* Slide Title Font Size */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Slide Title Font Size
            </label>
            <select
              value={pptSettings.ppt_title_font_size || '22px'}
              onChange={(e) => setPptSettings(prev => ({ ...prev, ppt_title_font_size: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
            >
              <option value="20px">20 px</option>
              <option value="22px">22 px (Default)</option>
              <option value="24px">24 px</option>
              <option value="28px">28 px</option>
              <option value="32px">32 px</option>
            </select>
          </div>

          {/* Sub-heading Font Size */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Sub-heading Font Size
            </label>
            <select
              value={pptSettings.ppt_subheading_font_size || '20px'}
              onChange={(e) => setPptSettings(prev => ({ ...prev, ppt_subheading_font_size: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
            >
              <option value="16px">16 px</option>
              <option value="18px">18 px</option>
              <option value="20px">20 px (Default)</option>
              <option value="22px">22 px</option>
              <option value="24px">24 px</option>
            </select>
          </div>

          {/* Body Text Font Size */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Body Text Font Size
            </label>
            <select
              value={pptSettings.ppt_body_font_size || '18px'}
              onChange={(e) => setPptSettings(prev => ({ ...prev, ppt_body_font_size: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
            >
              <option value="14px">14 px</option>
              <option value="16px">16 px</option>
              <option value="18px">18 px (Default)</option>
              <option value="20px">20 px</option>
            </select>
          </div>

          {/* Header Title */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Title Slide Header
            </label>
            <input
              type="text"
              value={pptSettings.header_title}
              onChange={(e) => setPptSettings(prev => ({ ...prev, header_title: e.target.value }))}
              placeholder="e.g. Lalitha College of Pharmacy"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          {/* Footer Text */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Slide Footer Text
            </label>
            <input
              type="text"
              value={pptSettings.footer_text}
              onChange={(e) => setPptSettings(prev => ({ ...prev, footer_text: e.target.value }))}
              placeholder="e.g. Pharm.D Clinical Case Presentation • Confidential"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          {/* Display Toggles */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Slide Details & Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={pptSettings.show_logo}
                  onChange={(e) => setPptSettings(prev => ({ ...prev, show_logo: e.target.checked }))}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Include College Logo on Title Slide</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={pptSettings.show_student_preceptor}
                  onChange={(e) => setPptSettings(prev => ({ ...prev, show_student_preceptor: e.target.checked }))}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Include Student & Preceptor Details</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW FULL PAGE MODAL */}
      {isPreviewModalOpen && (
        <ModalWrapper
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`Full ${settings.paper_size} (${settings.orientation}) PDF Format Preview`}
          subtitle={`Exact rendering across all PharmDVerse clinical documentation modules (${settings.paper_size} - ${settings.orientation})`}
          maxWidth={settings.orientation === 'Landscape' ? 'max-w-6xl' : 'max-w-4xl'}
        >
          <div className="p-4 bg-slate-100 dark:bg-slate-950 max-h-[82vh] overflow-y-auto">
            <SampleTwoPageDocument college={college} settings={settings} />
          </div>
        </ModalWrapper>
      )}

      {/* PREVIEW PPT SLIDES MODAL */}
      {isPptPreviewModalOpen && (
        <ModalWrapper
          isOpen={isPptPreviewModalOpen}
          onClose={() => setIsPptPreviewModalOpen(false)}
          title={`PowerPoint Slide Format Preview (${pptSettings.aspect_ratio || '16:9'})`}
          subtitle={`Theme: ${pptSettings.theme || 'Clinical Emerald'} • Font: ${pptSettings.font_family || 'Times New Roman'}`}
          maxWidth="max-w-5xl"
        >
          <div className="p-4 bg-slate-100 dark:bg-slate-950 max-h-[82vh] overflow-y-auto">
            <SamplePptSlidePreview college={college} pptSettings={pptSettings} />
          </div>
        </ModalWrapper>
      )}

    </div>
  );
};
