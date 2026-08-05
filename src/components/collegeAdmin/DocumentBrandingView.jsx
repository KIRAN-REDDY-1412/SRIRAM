import React, { useState, useEffect } from 'react';
import { FileText, Save, RefreshCw, Eye, CheckCircle2, AlertTriangle, Loader2, Sparkles, Sliders, Type, Palette, Layout, ShieldCheck, Printer, Building, MonitorPlay, Info } from 'lucide-react';
import { fetchDocumentBrandingSettingsFromSupabase, saveOrUpdateDocumentBrandingSettingsInSupabase } from '../../services/supabaseService';
import { ModalWrapper } from '../modals/ModalWrapper';
import { PharmDVerseBrandedDocumentContainer } from '../branding/PharmDVerseBrandedDocumentContainer';

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
  title_font_size: '18pt',
  heading_font_size: '14pt',
  body_font_size: '12pt',
  primary_color: '#0f172a',
  secondary_color: '#0284c7',
  table_header_color: '#f1f5f9',
  border_color: '#0f172a',
  text_color: '#0f172a',
  zebra_striping: false,
  repeat_table_header: true,
  show_student_signature: true,
  show_preceptor_signature: true
};

export const DocumentBrandingView = ({ college }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [showLivePreviewPanel, setShowLivePreviewPanel] = useState(true);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const loadBranding = async () => {
    if (!college) return;
    setLoading(true);
    const res = await fetchDocumentBrandingSettingsFromSupabase(college.id);
    if (res.success && res.settings) {
      const loadedSettings = {
        ...DEFAULT_SETTINGS,
        ...res.settings
      };
      setSettings(loadedSettings);
      window.dispatchEvent(new CustomEvent('pharmdverse_branding_updated', { detail: loadedSettings }));
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBranding();
  }, [college]);

  const handleToggle = (key) => {
    const nextVal = !settings[key];
    const updated = { ...settings, [key]: nextVal };
    setSettings(updated);
    window.dispatchEvent(new CustomEvent('pharmdverse_branding_updated', { detail: updated }));
  };

  const handleChange = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    window.dispatchEvent(new CustomEvent('pharmdverse_branding_updated', { detail: updated }));
  };

  const handleRestoreDefault = () => {
    if (window.confirm('Are you sure you want to restore default branding settings?')) {
      setSettings(DEFAULT_SETTINGS);
      window.dispatchEvent(new CustomEvent('pharmdverse_branding_updated', { detail: DEFAULT_SETTINGS }));
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!college) return;

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await saveOrUpdateDocumentBrandingSettingsInSupabase(college.id, settings);
    setSaving(false);

    if (res.success) {
      const updatedSettings = { ...DEFAULT_SETTINGS, ...res.settings };
      setSettings(updatedSettings);

      // BROADCAST LIVE SYNCHRONIZATION EVENT TO ALL OPEN MODALS AND PREVIEWS
      window.dispatchEvent(new CustomEvent('pharmdverse_branding_updated', { detail: updatedSettings }));

      setSuccessMsg('Document Branding Settings saved successfully to Supabase! Live Preview, Print Previews, and PDFs across PharmDVerse have been synchronized instantly.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to save Document Branding Settings.');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-500">Loading Document Branding Settings...</p>
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
            <span>Document Branding Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized PDF & Print Preview branding for all clinical documentation modules in <strong className="text-slate-800 dark:text-slate-200">{college?.college_name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowLivePreviewPanel(!showLivePreviewPanel)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showLivePreviewPanel
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MonitorPlay className="w-4 h-4 text-indigo-500" />
            <span>Live Preview {showLivePreviewPanel ? 'ON' : 'OFF'}</span>
          </button>

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

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Branding'}</span>
          </button>
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

      {/* SPLIT LAYOUT: FORM INPUTS + INSTANT LIVE PREVIEW PANEL */}
      <div className={`grid grid-cols-1 ${showLivePreviewPanel ? 'lg:grid-cols-12 gap-8' : ''}`}>
        
        {/* LEFT COLUMN: BRANDING CONTROLS */}
        <div className={`${showLivePreviewPanel ? 'lg:col-span-7' : 'col-span-1'} space-y-6`}>
          
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
                  <input type="range" min={5} max={20} value={settings.watermark_opacity} onChange={(e) => handleChange('watermark_opacity', e.target.value)} className="w-full" />
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

          {/* SECTIONS 5, 6, 7: PAGE SETTINGS, TYPOGRAPHY, COLORS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* SECTION 5: PAGE SETUP */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <Printer className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Setup
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Paper Size</label>
                  <select value={settings.paper_size} onChange={(e) => handleChange('paper_size', e.target.value)} className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 font-bold">
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Orientation</label>
                  <select value={settings.orientation} onChange={(e) => handleChange('orientation', e.target.value)} className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 font-bold">
                    <option value="Portrait">Portrait</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 6: TYPOGRAPHY */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <Type className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Fonts
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Font Family</label>
                  <select value={settings.font_family} onChange={(e) => handleChange('font_family', e.target.value)} className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 font-bold">
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Inter">Inter (Sans-serif)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 7: COLORS */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <Palette className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                Colors
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400">Primary</label>
                  <input type="color" value={settings.primary_color} onChange={(e) => handleChange('primary_color', e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Borders</label>
                  <input type="color" value={settings.border_color} onChange={(e) => handleChange('border_color', e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0" />
                </div>
              </div>
            </div>

          </div>

          {/* SECTION 8 & 9: TABLE SETTINGS & SIGNATURES */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Section 8 & 9: Signatures & Table Layout
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div onClick={() => handleToggle('show_student_signature')} className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center ${settings.show_student_signature ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200'}`}>
                <span>Student Sig</span>
                <span className="text-[10px]">{settings.show_student_signature ? 'SHOW' : 'HIDE'}</span>
              </div>

              <div onClick={() => handleToggle('show_preceptor_signature')} className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center ${settings.show_preceptor_signature ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200'}`}>
                <span>Preceptor Sig</span>
                <span className="text-[10px]">{settings.show_preceptor_signature ? 'SHOW' : 'HIDE'}</span>
              </div>

              <div onClick={() => handleToggle('zebra_striping')} className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center ${settings.zebra_striping ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200'}`}>
                <span>Zebra Striping</span>
                <span className="text-[10px]">{settings.zebra_striping ? 'ON' : 'OFF'}</span>
              </div>

              <div onClick={() => handleToggle('repeat_table_header')} className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center ${settings.repeat_table_header ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200'}`}>
                <span>Repeat Header</span>
                <span className="text-[10px]">{settings.repeat_table_header ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INSTANT REAL-TIME LIVE PREVIEW PANEL */}
        {showLivePreviewPanel && (
          <div className="lg:col-span-5 space-y-3 sticky top-24 self-start">
            <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2 text-xs font-extrabold">
                <MonitorPlay className="w-4 h-4 text-emerald-400" />
                <span>Live Interactive PDF Preview</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold animate-pulse">
                REAL-TIME LIVE
              </span>
            </div>

            <div className="border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-950 max-h-[80vh] overflow-y-auto p-2 scale-[0.92] origin-top">
              <PharmDVerseBrandedDocumentContainer
                college={college}
                branding={settings}
                documentTitle="Patient Profile Documentation"
                caseId="AMRMCP-2026-000001"
                student={{ full_name: 'Kiran Reddy', roll_number: '202601' }}
                preceptorName="Dr. Preceptor"
                pageNumber="1 of 1"
              >
                <div className="space-y-2 border border-slate-900 p-3 bg-slate-50/20 font-bold text-xs">
                  <strong className="block border-b border-slate-900 pb-1 uppercase">Sample Patient Information</strong>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Patient Name: <span className="underline">John Doe</span></div>
                    <div>Age / Gender: <span className="underline">45 yrs / Male</span></div>
                    <div>IP No: <span className="font-mono underline">IP-98765</span></div>
                    <div>BMI: <span className="font-mono underline">24.2 kg/m²</span></div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <strong className="block uppercase font-bold text-xs border-b border-slate-900 pb-1">
                    Sample Prescribed Drugs:
                  </strong>
                  <table className="w-full text-left border border-slate-900 border-collapse text-[11px]">
                    <thead className="bg-slate-100 font-bold uppercase text-[9px] border-b border-slate-900">
                      <tr>
                        <th className="p-1 border-r border-slate-900">Brand</th>
                        <th className="p-1 border-r border-slate-900">Generic</th>
                        <th className="p-1">Dose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-serif">
                      <tr className="border-b border-slate-900">
                        <td className="p-1 border-r border-slate-900 font-bold">Augmentin 625mg</td>
                        <td className="p-1 border-r border-slate-900">Amoxicillin + Clavulanic Acid</td>
                        <td className="p-1 font-mono">1 Tab BD</td>
                      </tr>
                      <tr>
                        <td className="p-1 border-r border-slate-900 font-bold">Paracetamol 650mg</td>
                        <td className="p-1 border-r border-slate-900">Acetaminophen</td>
                        <td className="p-1 font-mono">1 Tab TID</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </PharmDVerseBrandedDocumentContainer>
            </div>
          </div>
        )}

      </div>

      {/* PREVIEW FULL A4 MODAL */}
      {isPreviewModalOpen && (
        <ModalWrapper
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title="Full A4 Centralized Document Branding Preview"
          subtitle="Exact rendering across all PharmDVerse clinical documentation modules"
          maxWidth="max-w-4xl"
        >
          <div className="p-4 bg-slate-100 dark:bg-slate-950">
            <PharmDVerseBrandedDocumentContainer
              college={college}
              branding={settings}
              documentTitle="Patient Profile Documentation"
              caseId="AMRMCP-2026-000001"
              student={{ full_name: 'Kiran Reddy', roll_number: '202601' }}
              preceptorName="Dr. Preceptor"
              pageNumber="1 of 1"
            >
              <div className="space-y-3 text-xs">
                <div className="p-3 border border-slate-900 bg-slate-50 font-bold">
                  <strong>Full A4 Page Layout Test</strong>
                  <p className="font-normal italic text-slate-600 mt-1">
                    This preview uses your real-time configured font family ({settings.font_family}), opacity ({settings.watermark_opacity}%), header toggles, signature settings, and footer branding.
                  </p>
                </div>
              </div>
            </PharmDVerseBrandedDocumentContainer>
          </div>
        </ModalWrapper>
      )}

    </div>
  );
};
