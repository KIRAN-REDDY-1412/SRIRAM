import React, { useState } from 'react';
import { Building2, User, Phone, Mail, MapPin, Award, KeyRound, Lock, Eye, EyeOff, Save, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { updateCollegeProfileAndSubscriptionInSupabase } from '../../services/supabaseService';

export const CollegeAdminProfileView = ({ college, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    principalName: college?.principalName || college?.principal_name || '',
    principalMobile: college?.principalMobile || college?.principal_mobile || '',
    principalEmail: college?.principalEmail || college?.principal_email || college?.adminUsername || '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.newPassword || formData.confirmNewPassword) {
      if (formData.newPassword.length < 8) {
        setErrorMsg('New Password must be at least 8 characters long.');
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setErrorMsg('New Password and Confirm Password do not match.');
        return;
      }
    }

    setSaving(true);
    const updatePayload = {
      collegeCode: college.code,
      collegeName: college.name,
      collegeLogoUrl: college.logoUrl,
      collegeDescription: college.description,
      city: college.city,
      state: college.state,
      principalName: formData.principalName,
      principalMobile: formData.principalMobile,
      principalEmail: formData.principalEmail,
      adminPassword: formData.newPassword || undefined,
      subscriptionPlan: college.subscriptionPlan || 'Professional',
      subscriptionStatus: college.status || 'Active'
    };

    const res = await updateCollegeProfileAndSubscriptionInSupabase(college.id, updatePayload);
    setSaving(false);

    if (res.success) {
      setSuccessMsg('Profile and admin security credentials updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        if (onProfileUpdated) onProfileUpdated();
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>My College & Admin Profile</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage institutional profile details and update College Admin login credentials.
        </p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* COLLEGE INFORMATION CARD */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Institutional Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">College Name</span>
              <strong className="text-sm text-slate-900 dark:text-white font-bold">{college?.name}</strong>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block">College Code</span>
              <strong className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{college?.code}</strong>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block">Location</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{[college?.city, college?.district, college?.state].filter(Boolean).join(', ')}</span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block">PCI Approval Number</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono font-medium">{college?.pciApprovalNo || 'Verified'}</span>
            </div>
          </div>
        </div>

        {/* PRINCIPAL DETAILS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Principal / Admin Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                className="w-full h-[46px] px-3.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address * (Admin User ID)
              </label>
              <input
                type="email"
                name="principalEmail"
                required
                value={formData.principalEmail}
                onChange={handleChange}
                className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECURITY CREDENTIALS UPDATE */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 dark:from-indigo-950/20 dark:via-slate-900 dark:to-sky-950/20 border border-indigo-200/80 dark:border-indigo-900/80 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-2 pb-2 border-b border-indigo-200/60 dark:border-indigo-900/60">
            <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Update College Admin Password
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Admin Password (Min 8 chars)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
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
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-[48px] px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
