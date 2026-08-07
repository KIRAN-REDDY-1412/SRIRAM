import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { hashPassword } from '../../services/supabaseService';
import { Eye, EyeOff, ShieldCheck, Key, Lock, AlertTriangle } from 'lucide-react';

export function ChangePasswordSection({ user, userType, isForceReset = false, onSuccess, onLogout }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Password Strength Evaluator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'Empty', color: 'bg-slate-200 dark:bg-slate-800 text-slate-400', width: 'w-0' };
    if (pwd.length < 8) return { label: 'Too Short', color: 'bg-rose-500 text-rose-500', width: 'w-1/4' };
    
    let score = 0;
    if (/[a-zA-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score === 1) return { label: 'Weak', color: 'bg-rose-500 text-rose-500', width: 'w-1/3' };
    if (score === 2) return { label: 'Medium', color: 'bg-amber-500 text-amber-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-500 text-emerald-500', width: 'w-full' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const errs = {};

    // 1. Verify old password if not a forced reset
    if (!isForceReset) {
      if (!oldPassword) {
        errs.oldPassword = '❌ Current password is required.';
      }
    }

    // 2. Validate new password
    if (!newPassword) {
      errs.newPassword = '❌ Password is required.';
    } else if (newPassword.length < 8) {
      errs.newPassword = '❌ Password must contain at least 8 characters.';
    }

    if (!confirmNewPassword) {
      errs.confirmNewPassword = '❌ Please confirm the password.';
    } else if (newPassword !== confirmNewPassword) {
      errs.confirmNewPassword = '❌ Passwords do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const table = userType === 'Student' ? 'students' : 'preceptors';
      
      // Fetch latest user data to verify old password
      if (!isForceReset) {
        const { data: dbUser, error: fetchErr } = await supabase
          .from(table)
          .select('password_hash')
          .eq('id', user.id)
          .single();

        if (fetchErr || !dbUser) {
          setToastMsg('❌ Error verifying account details.');
          setSaving(false);
          return;
        }

        const oldHash = await hashPassword(oldPassword);
        if (dbUser.password_hash !== oldHash) {
          setErrors({ oldPassword: '❌ Incorrect current password.' });
          setSaving(false);
          return;
        }
      }

      const newHash = await hashPassword(newPassword);

      // Update Database
      const { data: updatedUser, error: updateErr } = await supabase
        .from(table)
        .update({
          password_hash: newHash,
          password_changed_at: new Date().toISOString(),
          force_password_reset: false, // Reset this to false on password update!
          failed_login_attempts: 0
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateErr) {
        setToastMsg(`❌ Database Error: ${updateErr.message}`);
        setSaving(false);
        return;
      }

      // Record Audit Log if it was done by themselves or in forced mode
      await supabase
        .from('password_audit_logs')
        .insert({
          user_id: user.id,
          user_type: userType,
          action: isForceReset ? 'Password Reset' : 'Password Changed',
          performed_by: user.id // Logged user performed it themselves
        });

      setToastMsg('✅ Password changed successfully. Redirecting to login...');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      if (onSuccess) {
        onSuccess(updatedUser);
      }

      // Force logout after showing success toast
      if (onLogout) {
        setTimeout(() => {
          onLogout();
        }, 2000);
      }
    } catch (err) {
      setToastMsg(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border ${
      isForceReset ? 'border-indigo-200 dark:border-indigo-900 shadow-xl max-w-md w-full' : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
    } space-y-4`}>
      
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {isForceReset ? 'Setup New Secure Password' : 'Change Account Password'}
          </h4>
          {isForceReset && (
            <p className="text-[10px] text-slate-400 mt-0.5">Your college administrator has requested a password reset. You must update your password to continue.</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Old Password (only if not forced reset) */}
        {!isForceReset && (
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className={`w-full h-[38px] pl-3 pr-9 text-xs rounded-xl border bg-slate-50/50 dark:bg-slate-950/20 text-slate-900 dark:text-white focus:outline-none transition-all ${
                  errors.oldPassword 
                    ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
              >
                {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="text-[10px] text-rose-600 mt-1 font-semibold pl-1">{errors.oldPassword}</p>
            )}
          </div>
        )}

        {/* New Password */}
        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
            New Password * (Min 8 chars)
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className={`w-full h-[38px] pl-3 pr-9 text-xs rounded-xl border bg-slate-50/50 dark:bg-slate-950/20 text-slate-900 dark:text-white focus:outline-none transition-all ${
                errors.newPassword 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-[10px] text-rose-600 mt-1 font-semibold pl-1">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
            Confirm New Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm new password"
              className={`w-full h-[38px] pl-3 pr-9 text-xs rounded-xl border bg-slate-50/50 dark:bg-slate-950/20 text-slate-900 dark:text-white focus:outline-none transition-all ${
                errors.confirmNewPassword 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p className="text-[10px] text-rose-600 mt-1 font-semibold pl-1">{errors.confirmNewPassword}</p>
          )}
        </div>

        {/* Strength Indicator */}
        {newPassword && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span className="text-slate-400">Password Strength:</span>
              <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full h-[38px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {saving ? 'Updating Password...' : 'Save New Password'}
        </button>
      </form>

      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-3 animate-slideIn">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            ✓
          </div>
          <div className="text-xs font-bold pr-2">{toastMsg}</div>
        </div>
      )}
    </div>
  );
}
