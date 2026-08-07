import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { hashPassword } from '../../services/supabaseService';
import { Eye, EyeOff, ShieldCheck, Key, RefreshCw, Copy, Check, AlertTriangle } from 'lucide-react';

export function SecurityManagementSection({ user, userType, collegeAdminId, onUpdateUser }) {
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Reset Password State
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [showTempModal, setShowTempModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Local state for toggle to keep UI responsive
  const [forceReset, setForceReset] = useState(user?.force_password_reset || false);

  useEffect(() => {
    setForceReset(user?.force_password_reset || false);
  }, [user]);

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

  // Handle Toggle Force Password Reset
  const handleToggleForceReset = async () => {
    const table = userType === 'Student' ? 'students' : 'preceptors';
    const nextVal = !forceReset;
    setForceReset(nextVal);

    try {
      const { data, error } = await supabase
        .from(table)
        .update({ force_password_reset: nextVal })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        setForceReset(!nextVal); // Rollback
        setToastMsg(`❌ Error updating force reset setting: ${error.message}`);
      } else {
        setToastMsg(nextVal ? '✅ Force password reset enabled for next login.' : '✅ Force password reset disabled.');
        if (onUpdateUser) onUpdateUser(data);
      }
    } catch (err) {
      setForceReset(!nextVal); // Rollback
      setToastMsg(`❌ Error updating force reset setting: ${err.message}`);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const errs = {};
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
      const newHash = await hashPassword(newPassword);

      // Update Database
      const { data, error } = await supabase
        .from(table)
        .update({
          password_hash: newHash,
          password_changed_at: new Date().toISOString(),
          failed_login_attempts: 0
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        setToastMsg(`❌ Database Error: ${error.message}`);
        setSaving(false);
        return;
      }

      // Record Audit Log
      await supabase
        .from('password_audit_logs')
        .insert({
          user_id: user.id,
          user_type: userType,
          action: 'Password Changed',
          performed_by: collegeAdminId
        });

      setToastMsg('✅ Password updated successfully.');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowChangeForm(false);
      
      if (onUpdateUser) onUpdateUser(data);
    } catch (err) {
      setToastMsg(`❌ Error updating password: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle Reset Password (Generate Temporary Password)
  const handleResetPassword = async () => {
    setSaving(true);
    setShowResetConfirm(false);
    
    // Generate secure temporary password matching Temp@4831 pattern
    const generated = 'Temp@' + Math.floor(1000 + Math.random() * 9000);

    try {
      const table = userType === 'Student' ? 'students' : 'preceptors';
      const tempHash = await hashPassword(generated);

      // Update Database - reset failed logins, set force reset to true, update changed_at
      const { data, error } = await supabase
        .from(table)
        .update({
          password_hash: tempHash,
          force_password_reset: true,
          password_changed_at: new Date().toISOString(),
          failed_login_attempts: 0
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        setToastMsg(`❌ Database Error: ${error.message}`);
        setSaving(false);
        return;
      }

      // Record Audit Log
      await supabase
        .from('password_audit_logs')
        .insert({
          user_id: user.id,
          user_type: userType,
          action: 'Password Reset',
          performed_by: collegeAdminId
        });

      setTempPassword(generated);
      setShowTempModal(true);
      setForceReset(true);
      
      if (onUpdateUser) onUpdateUser(data);
    } catch (err) {
      setToastMsg(`❌ Error resetting password: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Copy temporary password to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format Dates Helper
  const formatDateTime = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
      {/* Header Title */}
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        Security & Password Management
      </h4>

      {/* Security Properties Info Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
        <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-slate-800">
          <span className="text-slate-400 font-semibold">Username:</span>
          <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{user.username}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-slate-800">
          <span className="text-slate-400 font-semibold">Registered Email:</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">{user.email}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-slate-800">
          <span className="text-slate-400 font-semibold">Account Status:</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
            user.status === 'Active'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
          }`}>
            {user.status || 'Active'}
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-slate-800">
          <span className="text-slate-400 font-semibold">Last Login Date & Time:</span>
          <span className="text-slate-700 dark:text-slate-300">{formatDateTime(user.last_login_at)}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-slate-800">
          <span className="text-slate-400 font-semibold">Password Last Changed On:</span>
          <span className="text-slate-700 dark:text-slate-300">{formatDateTime(user.password_changed_at)}</span>
        </div>

        {/* Force Reset Toggle Switch */}
        <div className="flex items-center justify-between py-1.5">
          <div className="space-y-0.5">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Force Password Reset On Next Login</span>
            <p className="text-[10px] text-slate-400">User will be prompted to change password immediately after logging in.</p>
          </div>
          <button
            type="button"
            onClick={handleToggleForceReset}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              forceReset ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                forceReset ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Buttons Actions */}
      {!showChangeForm && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            disabled={saving}
            className="h-[40px] rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Password</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowChangeForm(true)}
            disabled={saving}
            className="h-[40px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-600/10"
          >
            <Key className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </div>
      )}

      {/* Manual Change Password Form */}
      {showChangeForm && (
        <form onSubmit={handleChangePassword} className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/10 dark:bg-indigo-950/10 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-indigo-100/50 dark:border-indigo-950 pb-2">
            <h5 className="font-bold text-slate-800 dark:text-slate-200">Manually Set New Password</h5>
            <button
              type="button"
              onClick={() => {
                setShowChangeForm(false);
                setErrors({});
                setNewPassword('');
                setConfirmNewPassword('');
              }}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1">
              New Password * (Min 8 chars)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={`w-full h-[38px] pl-3 pr-9 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none transition-all ${
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
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full h-[38px] pl-3 pr-9 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none transition-all ${
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
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
              </div>
            </div>
          )}

          {/* Submit Change Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full h-[38px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Save New Password'}
          </button>
        </form>
      )}

      {/* SUCCESS TOAST MESSAGE */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-3 animate-slideIn">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            ✓
          </div>
          <div className="text-xs font-bold pr-2">{toastMsg}</div>
        </div>
      )}

      {/* CONFIRM RESET PASSWORD DIALOG */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block font-bold mb-1">Reset Password</strong>
                This will reset the user's password. The current password cannot be recovered. Continue?
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPLAY TEMPORARY PASSWORD DIALOG */}
      {showTempModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scaleUp">
            <div className="space-y-1">
              <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">Temporary Password Generated</h5>
              <p className="text-[11px] text-slate-400">Share this temporary password with the user. They will be forced to change it on their next login.</p>
            </div>

            {/* Password Display Box */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 font-mono text-center relative group">
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 select-all mx-auto tracking-wider">{tempPassword}</span>
              
              <button
                type="button"
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40 transition-colors"
                title="Copy Password"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {copied && (
              <p className="text-[10px] text-emerald-600 text-center font-bold animate-pulse">✓ Copied to clipboard!</p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowTempModal(false);
                  setTempPassword('');
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-850 text-white font-extrabold text-xs shadow-md shadow-slate-900/10 hover:bg-slate-800"
              >
                Close & Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
