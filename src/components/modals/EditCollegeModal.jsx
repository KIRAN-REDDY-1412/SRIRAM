import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useColleges } from '../../context/CollegeContext';
import { Building2, MapPin, Award, User, Save, CreditCard, Trash2, AlertTriangle, Image, FileText, Upload, Loader2, CheckCircle2 } from 'lucide-react';

export const EditCollegeModal = ({ isOpen, onClose, college, onSave, onDelete, isFullPage = false }) => {
  const { uploadCollegeLogo } = useColleges();

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
    subscriptionPlan: 'Professional',
    subscriptionStartDate: new Date().toISOString().split('T')[0],
    subscriptionExpiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    maxStudentsAllowed: 600,
    subscriptionStatus: 'Active'
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (college) {
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
        principalEmail: college.principalEmail || college.principal_email || college.email || '',
        subscriptionPlan: college.subscriptionPlan || 'Professional',
        subscriptionStartDate: college.subscriptionStartDate || new Date().toISOString().split('T')[0],
        subscriptionExpiryDate: college.subscriptionExpiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        maxStudentsAllowed: college.maxStudentsAllowed || 600,
        subscriptionStatus: college.subscriptionStatus || 'Active'
      });
    }
  }, [college]);

  if (!isOpen && !isFullPage) return null;
  if (!college && !isFullPage) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (JPG, PNG, SVG)
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      onSave(college ? college.id : null, formData);
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        if (onClose) onClose();
      }, 500);
    }, 450);
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
      
      {/* SECTION 1: COLLEGE BRANDING (NEW REQUIRED SECTION) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Image className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          College Branding
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 1. College Logo Upload & Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              College Logo (JPG / PNG / SVG)
            </label>

            <div className="flex items-start gap-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
              {/* Logo Preview */}
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

              {/* Upload Action */}
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
                    Remove uploaded logo (Use default placeholder)
                  </button>
                )}

                <p className="text-[10px] text-slate-400">Recommended size: 200x200px or SVG vector</p>
              </div>
            </div>
          </div>

          {/* 2. College Description Textarea */}
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

      {/* SECTION 4: ACADEMIC INFORMATION */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Academic Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              University Affiliation
            </label>
            <input
              type="text"
              name="universityAffiliation"
              value={formData.universityAffiliation}
              onChange={handleChange}
              placeholder="Enter university affiliation"
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

      {/* SECTION 5: PRINCIPAL INFORMATION */}
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
              Email Address *
            </label>
            <input
              type="email"
              name="principalEmail"
              required
              value={formData.principalEmail}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>
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

  if (isFullPage) {
    return formContent;
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Edit College Profile"
      subtitle={`Update details & Subscription Plan for ${college?.name || 'College'}`}
      maxWidth="max-w-4xl"
    >
      {formContent}
    </ModalWrapper>
  );
};
