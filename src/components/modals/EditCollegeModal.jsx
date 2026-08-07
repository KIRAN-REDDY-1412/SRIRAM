import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useColleges } from '../../context/CollegeContext';
import { Building2, MapPin, Award, User, Save, CreditCard, Trash2, AlertTriangle, Image, Upload, Loader2, CheckCircle2, KeyRound, Eye, EyeOff, Lock, Globe } from 'lucide-react';

export const EditCollegeModal = ({ isOpen, onClose, college, onSave, onDelete, isFullPage = false }) => {
  const { uploadCollegeLogo, activeColleges } = useColleges();

  const [formData, setFormData] = useState({
    collegeName: '',
    collegeCode: '',
    collegeLogoUrl: '',
    collegeDescription: '',
    logoBg: 'from-emerald-600 to-teal-700',
    address: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    universityAffiliation: '',
    pciApprovalNo: '',
    principalName: '',
    principalMobile: '',
    principalEmail: '',
    adminPassword: '',
    confirmAdminPassword: '',
    subscriptionPlan: 'Professional',
    subscriptionStartDate: new Date().toISOString().split('T')[0],
    subscriptionExpiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    maxStudentsAllowed: 600,
    subscriptionStatus: 'Active',
    
    // Accreditations
    isAutonomous: false,
    naacEnabled: false,
    naacGrade: 'A',
    naacValidUntil: '',
    naacLogoUrl: '',
    nbaEnabled: false,
    nbaPrograms: [],
    nbaValidUntil: '',
    nbaLogoUrl: '',
    pciEnabled: false,
    pciLogoUrl: '',
    aicteEnabled: false,
    aicteLogoUrl: '',
    nirfEnabled: false,
    nirfRank: '',
    nirfYear: new Date().getFullYear(),
    
    // Visibility
    showLogoOnPortal: true,
    showNameOnPortal: true,
    showDescriptionOnPortal: true,
    showAutonomousOnPortal: true,
    showNaacOnPortal: true,
    showNbaOnPortal: true,
    showPciOnPortal: true,
    showAicteOnPortal: true,
    showNirfOnPortal: true,
    showWebsiteOnPortal: true,
    showAddressOnPortal: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (college) {
      const email = college.principalEmail || college.principal_email || college.email || '';
      setFormData({
        collegeName: college.name || college.collegeName || college.college_name || '',
        collegeCode: college.code || college.collegeCode || college.college_code || '',
        collegeLogoUrl: college.logoUrl || college.college_logo_url || '',
        collegeDescription: college.description || college.college_description || '',
        logoBg: college.logoBg || college.college_logo || 'from-emerald-600 to-teal-700',
        address: college.address || '',
        city: college.city || '',
        district: college.district || '',
        state: college.state || '',
        pinCode: college.pinCode || college.pincode || '',
        universityAffiliation: college.universityAffiliation || college.university_affiliation || '',
        pciApprovalNo: college.pciApprovalNo || college.pci_approval_number || '',
        principalName: college.principalName || college.principal_name || college.contactName || college.contact_person || '',
        principalMobile: college.principalMobile || college.principal_mobile || college.mobileNumber || college.mobile_number || '',
        principalEmail: email,
        adminPassword: '',
        confirmAdminPassword: '',
        subscriptionPlan: college.subscriptionPlan || 'Professional',
        subscriptionStartDate: college.subscriptionStartDate || new Date().toISOString().split('T')[0],
        subscriptionExpiryDate: college.subscriptionExpiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        maxStudentsAllowed: college.maxStudentsAllowed || 600,
        subscriptionStatus: college.subscriptionStatus || 'Active',
        
        // Accreditations from Supabase
        isAutonomous: college.is_autonomous ?? false,
        naacEnabled: college.naac_enabled ?? false,
        naacGrade: college.naac_grade || 'A',
        naacValidUntil: college.naac_valid_until || '',
        naacLogoUrl: college.naac_logo_url || '',
        nbaEnabled: college.nba_enabled ?? false,
        nbaPrograms: college.nba_programs || [],
        nbaValidUntil: college.nba_valid_until || '',
        nbaLogoUrl: college.nba_logo_url || '',
        pciEnabled: college.pci_enabled ?? false,
        pciLogoUrl: college.pci_logo_url || '',
        aicteEnabled: college.aicte_enabled ?? false,
        aicteLogoUrl: college.aicte_logo_url || '',
        nirfEnabled: college.nirf_enabled ?? false,
        nirfRank: college.nirf_rank || '',
        nirfYear: college.nirf_year || new Date().getFullYear(),
        
        // Visibility
        showLogoOnPortal: college.show_logo_on_portal ?? true,
        showNameOnPortal: college.show_name_on_portal ?? true,
        showDescriptionOnPortal: college.show_description_on_portal ?? true,
        showAutonomousOnPortal: college.show_autonomous_on_portal ?? true,
        showNaacOnPortal: college.show_naac_on_portal ?? true,
        showNbaOnPortal: college.show_nba_on_portal ?? true,
        showPciOnPortal: college.show_pci_on_portal ?? true,
        showAicteOnPortal: college.show_aicte_on_portal ?? true,
        showNirfOnPortal: college.show_nirf_on_portal ?? true,
        showWebsiteOnPortal: college.show_website_on_portal ?? true,
        showAddressOnPortal: college.show_address_on_portal ?? true
      });
      setValidationError('');
    }
  }, [college]);

  if (!isOpen && !isFullPage) return null;
  if (!college && !isFullPage) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleToggle = (name) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleNbaProgramToggle = (program) => {
    setFormData(prev => {
      const current = prev.nbaPrograms || [];
      const updated = current.includes(program)
        ? current.filter(p => p !== program)
        : [...current, program];
      return { ...prev, nbaPrograms: updated };
    });
  };

  const handleAccreditationLogoUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, WEBP, or SVG).');
      return;
    }

    try {
      const res = await uploadCollegeLogo(file);
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, [fieldName]: res.url }));
      } else {
        alert('Upload failed: ' + (res.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, WEBP, or SVG).');
      return;
    }

    setUploadingLogo(true);
    setLogoUploadSuccess(false);

    try {
      const res = await uploadCollegeLogo(file);
      setUploadingLogo(false);

      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, collegeLogoUrl: res.url }));
        setLogoUploadSuccess(true);
        setTimeout(() => setLogoUploadSuccess(false), 2500);
      } else {
        alert('Failed to upload logo image. Please try again.');
      }
    } catch (err) {
      setUploadingLogo(false);
      console.error('Logo upload error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // 1. Mandatory Principal Email
    if (!formData.principalEmail || !formData.principalEmail.trim()) {
      setValidationError('Principal Email Address is required and will be used as College Admin User ID.');
      return;
    }

    // 2. Check User ID Uniqueness across existing active colleges (excluding current college)
    const existingCollegeWithSameEmail = activeColleges.find(
      c => c.id !== college?.id && (c.adminUsername?.toLowerCase() === formData.principalEmail.trim().toLowerCase() || c.principalEmail?.toLowerCase() === formData.principalEmail.trim().toLowerCase())
    );

    if (existingCollegeWithSameEmail) {
      setValidationError(`User ID '${formData.principalEmail}' is already assigned to another college (${existingCollegeWithSameEmail.name}). User ID must be unique.`);
      return;
    }

    // 3. Password Validation if password entered or updating credentials
    if (formData.adminPassword || formData.confirmAdminPassword) {
      if (formData.adminPassword.length < 8) {
        setValidationError('College Admin Password must be at least 8 characters long.');
        return;
      }

      if (formData.adminPassword !== formData.confirmAdminPassword) {
        setValidationError('Password and Confirm Password do not match. Please verify both fields.');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await onSave(college ? college.id : null, formData);
      setSaving(false);

      if (res && res.error) {
        setValidationError(res.error);
      } else {
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          if (onClose) onClose();
        }, 500);
      }
    } catch (err) {
      setSaving(false);
      setValidationError(err.message || 'Failed to save college profile.');
    }
  };

  const handleDeleteConfirm = () => {
    if (onDelete && college) {
      onDelete(college.id);
      setShowDeleteConfirm(false);
      if (onClose) onClose();
    }
  };

  const logoPresetGradients = [
    { label: "Emerald Teal", value: "from-emerald-600 to-teal-700" },
    { label: "Ocean Cyan", value: "from-cyan-600 to-blue-700" },
    { label: "Indigo Sky", value: "from-blue-600 to-indigo-700" },
    { label: "Deep Purple", value: "from-purple-600 to-indigo-800" }
  ];

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* VALIDATION ERROR BANNER */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}
      
      {/* SECTION 1: COLLEGE BRANDING */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Image className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          College Branding
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Logo Upload & Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              College Logo (JPG / PNG / SVG)
            </label>

            <div className="flex items-start gap-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
              <div className="relative shrink-0">
                {formData.collegeLogoUrl ? (
                  <img
                    src={formData.collegeLogoUrl}
                    alt="College Logo Preview"
                    className="w-16 h-16 rounded-xl object-contain bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 shadow-sm"
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${formData.logoBg} flex items-center justify-center text-white font-extrabold text-sm shadow-sm border border-white/20`}>
                    {formData.collegeName ? formData.collegeName.substring(0, 4).toUpperCase() : 'LOGO'}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs">
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading Logo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.collegeLogoUrl ? 'Change Logo Image' : 'Upload Logo Image'}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/svg+xml,image/webp"
                    disabled={uploadingLogo}
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                </label>

                {logoUploadSuccess && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Logo uploaded successfully!
                  </span>
                )}

                {formData.collegeLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, collegeLogoUrl: '' }))}
                    className="block text-[10px] text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                  >
                    Remove uploaded logo (Use placeholder)
                  </button>
                )}

                <p className="text-[10px] text-slate-400">Recommended size: 200x200px or SVG vector</p>
              </div>
            </div>
          </div>

          {/* College Description Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                College Description (Max 500 characters)
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                {formData.collegeDescription.length}/500
              </span>
            </div>

            <textarea
              name="collegeDescription"
              rows={4}
              maxLength={500}
              value={formData.collegeDescription}
              onChange={handleChange}
              placeholder="e.g. Established in 2007, A.M.Reddy Memorial College of Pharmacy is committed to excellence in pharmacy education, clinical training, research, and patient care."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none leading-relaxed"
            />
          </div>

        </div>
      </div>

      {/* SECTION 2: BASIC INFORMATION */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Basic Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              College Name *
            </label>
            <input
              type="text"
              name="collegeName"
              required
              value={formData.collegeName}
              onChange={handleChange}
              placeholder="Enter college name"
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              College Code *
            </label>
            <input
              type="text"
              name="collegeCode"
              required
              value={formData.collegeCode}
              onChange={handleChange}
              placeholder="Enter college code"
              className="w-full h-[46px] px-3.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Fallback Placeholder Theme Gradient
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {logoPresetGradients.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, logoBg: preset.value }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  formData.logoBg === preset.value
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-slate-900'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${preset.value}`} />
                <span className="text-[11px] text-slate-700 dark:text-slate-300">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: LOCATION DETAILS */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Location Details
        </h4>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Campus Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter campus address"
            className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              City *
            </label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              District
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Enter district"
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              State *
            </label>
            <input
              type="text"
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter state"
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              PIN Code
            </label>
            <input
              type="text"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
              placeholder="Enter PIN code"
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: PRINCIPAL INFORMATION */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Principal / Dean Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Principal Name *
            </label>
            <input
              type="text"
              name="principalName"
              required
              value={formData.principalName}
              onChange={handleChange}
              placeholder="Enter principal name"
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mobile Number *
            </label>
            <input
              type="tel"
              name="principalMobile"
              required
              value={formData.principalMobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address * (Used as User ID)
            </label>
            <input
              type="email"
              name="principalEmail"
              required
              value={formData.principalEmail}
              onChange={handleChange}
              placeholder="e.g. principal@amrcp.edu.in"
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* SECTION 4.5: COLLEGE ADMIN LOGIN CREDENTIALS (NEW MANDATORY SECTION) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
              College Admin Login Credentials
            </h5>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/60 space-y-4">
            
            {/* User ID (Read-Only, Auto-Synced from Principal Email) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                User ID (Read Only • Auto-populated from Principal Email)
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  disabled
                  value={formData.principalEmail}
                  placeholder="Populates automatically from Principal Email"
                  className="w-full h-[46px] px-3.5 text-xs font-mono rounded-xl border border-indigo-200 dark:border-indigo-900/80 bg-white/80 dark:bg-slate-900/80 text-indigo-950 dark:text-indigo-200 font-bold cursor-not-allowed"
                />
                <Lock className="w-3.5 h-3.5 text-indigo-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Whenever the Principal Email Address above changes, this User ID updates automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Admin Password * (Min 8 chars)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="Enter admin password (min 8 chars)"
                    className="w-full h-[46px] pl-3.5 pr-10 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-1.5 top-1/2 -translate-y-1/2 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmAdminPassword"
                    value={formData.confirmAdminPassword}
                    onChange={handleChange}
                    placeholder="Confirm admin password"
                    className="w-full h-[46px] pl-3.5 pr-10 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-1.5 top-1/2 -translate-y-1/2 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password strength tips */}
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              🔒 Password will be securely hashed with SHA-256 before saving to database. Plain-text passwords are never stored.
            </p>

          </div>
        </div>
      </div>

      {/* SECTION 5: ACADEMIC INFORMATION */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Academic Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              University Affiliation / Affiliated University Name
            </label>
            <input
              type="text"
              name="universityAffiliation"
              value={formData.universityAffiliation}
              onChange={handleChange}
              placeholder="e.g. Jawaharlal Nehru Technological University"
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              PCI Approval Number
            </label>
            <input
              type="text"
              name="pciApprovalNo"
              value={formData.pciApprovalNo}
              onChange={handleChange}
              placeholder="Enter PCI approval number"
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5.5: ACCREDITATIONS & RECOGNITION (NEW) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Accreditations & Recognition
          </h4>
        </div>

        {/* AUTONOMOUS STATUS */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <strong className="text-xs font-extrabold text-slate-800 dark:text-white block">Autonomous Institution</strong>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Mark college as an Autonomous institution.</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAutonomous}
              onChange={() => handleToggle('isAutonomous')}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-350 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-650 peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* NAAC ACCREDITATION */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <strong className="text-xs font-bold text-slate-800 dark:text-white">NAAC Accreditation</strong>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.naacEnabled}
                onChange={() => handleToggle('naacEnabled')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-350 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-650 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {formData.naacEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">NAAC Grade</label>
                <select
                  name="naacGrade"
                  value={formData.naacGrade}
                  onChange={handleChange}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="A++">A++</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B++">B++</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">NAAC Valid Until</label>
                <input
                  type="date"
                  name="naacValidUntil"
                  value={formData.naacValidUntil}
                  onChange={handleChange}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">NAAC Logo (JPG/PNG/SVG)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/svg+xml"
                    onChange={(e) => handleAccreditationLogoUpload(e, 'naacLogoUrl')}
                    className="hidden"
                    id="naac-logo-upload"
                  />
                  <label
                    htmlFor="naac-logo-upload"
                    className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo</span>
                  </label>
                  {formData.naacLogoUrl && (
                    <span className="text-[10px] text-emerald-600 font-bold truncate max-w-[100px]" title={formData.naacLogoUrl}>
                      Uploaded!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* NBA ACCREDITATION */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <strong className="text-xs font-bold text-slate-800 dark:text-white">NBA Accreditation</strong>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.nbaEnabled}
                onChange={() => handleToggle('nbaEnabled')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-350 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-650 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {formData.nbaEnabled && (
            <div className="space-y-4 pt-2 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">NBA Valid Until</label>
                  <input
                    type="date"
                    name="nbaValidUntil"
                    value={formData.nbaValidUntil}
                    onChange={handleChange}
                    className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">NBA Logo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/svg+xml"
                      onChange={(e) => handleAccreditationLogoUpload(e, 'nbaLogoUrl')}
                      className="hidden"
                      id="nba-logo-upload"
                    />
                    <label
                      htmlFor="nba-logo-upload"
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                    </label>
                    {formData.nbaLogoUrl && (
                      <span className="text-[10px] text-emerald-600 font-bold truncate max-w-[100px]" title={formData.nbaLogoUrl}>
                        Uploaded!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Accredited Programs</label>
                <div className="flex items-center gap-4 flex-wrap">
                  {['B.Pharm', 'Pharm.D', 'M.Pharm'].map((prog) => (
                    <label key={prog} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.nbaPrograms || []).includes(prog)}
                        onChange={() => handleNbaProgramToggle(prog)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>{prog}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PCI APPROVAL */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <strong className="text-xs font-bold text-slate-800 dark:text-white">PCI Approval</strong>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pciEnabled}
                onChange={() => handleToggle('pciEnabled')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-350 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-650 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {formData.pciEnabled && (
            <div className="pt-2 animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">PCI Logo (Optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml"
                  onChange={(e) => handleAccreditationLogoUpload(e, 'pciLogoUrl')}
                  className="hidden"
                  id="pci-logo-upload"
                />
                <label
                  htmlFor="pci-logo-upload"
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo</span>
                </label>
                {formData.pciLogoUrl && (
                  <span className="text-[10px] text-emerald-600 font-bold truncate max-w-[100px]" title={formData.pciLogoUrl}>
                    Uploaded!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AICTE APPROVAL */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <strong className="text-xs font-bold text-slate-800 dark:text-white">AICTE Approval</strong>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aicteEnabled}
                onChange={() => handleToggle('aicteEnabled')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-350 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-650 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {formData.aicteEnabled && (
            <div className="pt-2 animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">AICTE Logo (Optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml"
                  onChange={(e) => handleAccreditationLogoUpload(e, 'aicteLogoUrl')}
                  className="hidden"
                  id="aicte-logo-upload"
                />
                <label
                  htmlFor="aicte-logo-upload"
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo</span>
                </label>
                {formData.aicteLogoUrl && (
                  <span className="text-[10px] text-emerald-600 font-bold truncate max-w-[100px]" title={formData.aicteLogoUrl}>
                    Uploaded!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* NIRF RANKING */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <strong className="text-xs font-bold text-slate-800 dark:text-white">NIRF Ranking</strong>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.nirfEnabled}
                onChange={() => handleToggle('nirfEnabled')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-350 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-650 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {formData.nirfEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">NIRF Ranking Position</label>
                <input
                  type="number"
                  name="nirfRank"
                  value={formData.nirfRank}
                  onChange={handleChange}
                  placeholder="e.g. 85"
                  className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">NIRF Ranking Year</label>
                <input
                  type="number"
                  name="nirfYear"
                  value={formData.nirfYear}
                  onChange={handleChange}
                  placeholder="e.g. 2026"
                  className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5.6: PORTAL VISIBILITY (NEW) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Eye className="w-4 h-4 text-indigo-650 dark:text-indigo-400" />
          Portal Visibility Settings
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Control which items are visible on the Live College Portal and Preview.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {/* Toggles */}
          {[
            { key: 'showLogoOnPortal', label: 'Show College Logo' },
            { key: 'showNameOnPortal', label: 'Show College Name' },
            { key: 'showDescriptionOnPortal', label: 'Show College Description' },
            { key: 'showAutonomousOnPortal', label: 'Show Autonomous Badge' },
            { key: 'showNaacOnPortal', label: 'Show NAAC Badge' },
            { key: 'showNbaOnPortal', label: 'Show NBA Badge' },
            { key: 'showPciOnPortal', label: 'Show PCI Badge' },
            { key: 'showAicteOnPortal', label: 'Show AICTE Badge' },
            { key: 'showNirfOnPortal', label: 'Show NIRF Badge' },
            { key: 'showWebsiteOnPortal', label: 'Show Website URL' },
            { key: 'showAddressOnPortal', label: 'Show Campus Address' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-150 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[item.key]}
                  onChange={() => handleToggle(item.key)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-slate-650 peer-checked:bg-indigo-650"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: SUBSCRIPTION PLAN SECTION */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/20 border border-emerald-300/60 dark:border-emerald-800/80 shadow-xs space-y-4">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-2 pb-2 border-b border-emerald-200/60 dark:border-emerald-800/60">
          <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Subscription Plan Section
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subscription Plan *
            </label>
            <select
              name="subscriptionPlan"
              value={formData.subscriptionPlan}
              onChange={handleChange}
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none font-semibold"
            >
              <option value="Basic">Basic Plan (Up to 200 Students)</option>
              <option value="Professional">Professional Plan (Up to 600 Students)</option>
              <option value="Enterprise">Enterprise Plan (Unlimited)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subscription Start Date *
            </label>
            <input
              type="date"
              name="subscriptionStartDate"
              required
              value={formData.subscriptionStartDate}
              onChange={handleChange}
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subscription Expiry Date *
            </label>
            <input
              type="date"
              name="subscriptionExpiryDate"
              required
              value={formData.subscriptionExpiryDate}
              onChange={handleChange}
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Maximum Students Allowed *
            </label>
            <input
              type="number"
              name="maxStudentsAllowed"
              required
              min={10}
              max={10000}
              value={formData.maxStudentsAllowed}
              onChange={handleChange}
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subscription Status *
            </label>
            <select
              name="subscriptionStatus"
              value={formData.subscriptionStatus}
              onChange={handleChange}
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none font-bold text-emerald-600 dark:text-emerald-400"
            >
              <option value="Active">Active (Live on Landing Page)</option>
              <option value="Inactive">Inactive (Suspended)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS: Delete, Cancel, Save */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800">
        
        {/* Delete College Button */}
        {onDelete && college ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="h-[48px] px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete College</span>
          </button>
        ) : <div />}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-[48px] px-6 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="h-[48px] px-7 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : savedSuccess ? 'Profile Saved Successfully!' : 'Save College Profile'}</span>
          </button>
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ModalWrapper
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete College"
          subtitle={`Are you sure you want to delete ${formData.collegeName}?`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div>
                <strong className="block font-bold mb-1">Permanent Action</strong>
                This action will permanently delete the college profile, portal access, and subscription details from the system.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

    </form>
  );

  const locationText = [formData.city, formData.district, formData.state].filter(Boolean).join(', ');
  const previewBaseUrl = formData.universityAffiliation 
    ? formData.universityAffiliation 
    : `https://${(formData.collegeCode || 'clg').toLowerCase()}.pharmdverse.com`;

  const previewPanel = (
    <div className="space-y-4 lg:sticky lg:top-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Live College Portal Preview
        </h4>
        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold uppercase">
          Real-Time
        </span>
      </div>

      {/* College Portal Hero Banner Preview */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white relative overflow-hidden shadow-xl border border-slate-700/60 transition-all duration-300">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col items-start gap-4 relative z-10">
          
          {/* Logo Preview */}
          {formData.showLogoOnPortal && (
            formData.collegeLogoUrl ? (
              <img
                src={formData.collegeLogoUrl}
                alt="Logo"
                className="w-16 h-16 rounded-xl object-contain bg-white p-1.5 border border-white/20 shadow-md"
              />
            ) : (
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${formData.logoBg} flex items-center justify-center text-white font-extrabold text-sm shadow-md border border-white/10`}>
                {formData.collegeName ? formData.collegeName.substring(0, 3).toUpperCase() : 'CLG'}
              </div>
            )
          )}

          <div className="space-y-2 w-full">
            {/* Status / Code Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Portal
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Code: {formData.collegeCode || 'CLG'}</span>
            </div>

            {/* College Name */}
            {formData.showNameOnPortal && (
              <h3 className="text-lg font-black text-white leading-snug tracking-tight">
                {formData.collegeName || 'Pharmacy College Name'}
              </h3>
            )}

            {/* Accreditation Badges Row below College Name */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Autonomous Badge */}
              {formData.isAutonomous && formData.showAutonomousOnPortal && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider">
                  Autonomous
                </span>
              )}

              {/* NAAC Badge */}
              {formData.naacEnabled && formData.showNaacOnPortal && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold flex items-center gap-1">
                  {formData.naacLogoUrl ? (
                    <img src={formData.naacLogoUrl} alt="NAAC" className="h-3.5 object-contain rounded-xs" />
                  ) : null}
                  <span>NAAC {formData.naacGrade || 'A+'}</span>
                </span>
              )}

              {/* NBA Badge */}
              {formData.nbaEnabled && formData.showNbaOnPortal && (
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold flex items-center gap-1">
                  {formData.nbaLogoUrl ? (
                    <img src={formData.nbaLogoUrl} alt="NBA" className="h-3.5 object-contain rounded-xs" />
                  ) : null}
                  <span>NBA Accredited {(formData.nbaPrograms || []).length > 0 ? `(${formData.nbaPrograms.join(', ')})` : ''}</span>
                </span>
              )}

              {/* PCI Badge */}
              {formData.pciEnabled && formData.showPciOnPortal && (
                <span className="px-2 py-0.5 rounded-md bg-teal-500/25 text-teal-300 border border-teal-500/30 text-[9px] font-bold flex items-center gap-1">
                  {formData.pciLogoUrl ? (
                    <img src={formData.pciLogoUrl} alt="PCI" className="h-3.5 object-contain rounded-xs" />
                  ) : null}
                  <span>PCI Approved</span>
                </span>
              )}

              {/* AICTE Badge */}
              {formData.aicteEnabled && formData.showAicteOnPortal && (
                <span className="px-2 py-0.5 rounded-md bg-blue-500/25 text-blue-300 border border-blue-500/30 text-[9px] font-bold flex items-center gap-1">
                  {formData.aicteLogoUrl ? (
                    <img src={formData.aicteLogoUrl} alt="AICTE" className="h-3.5 object-contain" />
                  ) : null}
                  <span>AICTE Approved</span>
                </span>
              )}

              {/* NIRF Badge */}
              {formData.nirfEnabled && formData.showNirfOnPortal && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                  NIRF {formData.nirfYear || '2026'} Rank {formData.nirfRank || '1'}
                </span>
              )}
            </div>

            {/* Description */}
            {formData.showDescriptionOnPortal && (
              <p className="text-xs text-slate-300 leading-relaxed pt-1.5 font-normal">
                {formData.collegeDescription || 'No college description available.'}
              </p>
            )}

            {/* Location & Website URL */}
            {(formData.showAddressOnPortal || formData.showWebsiteOnPortal) && (
              <div className="pt-2 border-t border-white/10 flex flex-col gap-1 text-[11px] text-slate-400 font-medium">
                {formData.showAddressOnPortal && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{locationText || 'College Campus Address'}</span>
                  </div>
                )}
                {formData.showWebsiteOnPortal && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="font-mono text-emerald-300 truncate">{previewBaseUrl}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isFullPage) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          {formContent}
        </div>
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
          {previewPanel}
        </div>
      </div>
    );
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Edit College Profile"
      subtitle={`Update details & Subscription Plan for ${college?.name || 'College'}`}
      maxWidth="max-w-7xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          {formContent}
        </div>
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
          {previewPanel}
        </div>
      </div>
    </ModalWrapper>
  );
};
