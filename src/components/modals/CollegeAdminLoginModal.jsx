import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useColleges } from '../../context/CollegeContext';
import { Building2, KeyRound, Lock, Eye, EyeOff, LogIn, AlertTriangle, Loader2 } from 'lucide-react';

import { LogoPreviewModal } from './LogoPreviewModal';

export const CollegeAdminLoginModal = ({ isOpen, onClose, initialCollege, onLoginSuccess }) => {
  const { loginCollegeAdmin, activeColleges } = useColleges();
  const [username, setUsername] = useState(initialCollege?.adminUsername || initialCollege?.principalEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both User ID (Email) and Password.');
      return;
    }

    setLoggingIn(true);
    const res = await loginCollegeAdmin(username.trim(), password.trim());
    setLoggingIn(false);

    if (res.success && res.college) {
      if (onLoginSuccess) onLoginSuccess(res.college);
      if (onClose) onClose();
    } else {
      setErrorMsg(res.error || 'Invalid User ID or Password.');
    }
  };

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        title="College Admin Login"
        subtitle={`Access administrative control for ${initialCollege?.name || 'Pharmacy College'}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex items-center justify-center pb-1">
            <img
              src="/pharmdverse-logo.png"
              alt="PharmDVerse Logo"
              className="w-10 h-10 object-contain cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowLogoModal(true)}
              title="Click to view official logo"
            />
          </div>
        
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-start gap-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            User ID (Principal Email Address) *
          </label>
          <input
            type="email"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. principal@amrcp.edu.in"
            className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Admin Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your admin password"
              className="w-full h-[46px] pl-3.5 pr-10 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
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

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loggingIn}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            {loggingIn ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Admin Portal</span>
              </>
            )}
          </button>
        </div>

      </form>
    </ModalWrapper>
    <LogoPreviewModal isOpen={showLogoModal} onClose={() => setShowLogoModal(false)} />
    </>
  );
};
