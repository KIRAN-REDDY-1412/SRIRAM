import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { authenticatePreceptorInSupabase } from '../../services/supabaseService';
import { Eye, EyeOff, LogIn, AlertTriangle, Loader2 } from 'lucide-react';
import { LogoPreviewModal } from './LogoPreviewModal';
import { LoginHeader } from './LoginHeader';

export const PreceptorLoginModal = ({ isOpen, onClose, initialCollege, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);

  const collegeName = initialCollege?.name || initialCollege?.college_name || 'Pharmacy College';

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both Username (Email) and Password.');
      return;
    }

    setLoggingIn(true);
    const res = await authenticatePreceptorInSupabase(username.trim(), password.trim());
    setLoggingIn(false);

    if (res.success && res.preceptor) {
      if (onLoginSuccess) onLoginSuccess(res.preceptor);
      if (onClose) onClose();
    } else {
      setErrorMsg(res.error || 'Invalid Username or Password.');
    }
  };

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="max-w-md"
        hideDefaultHeader={true}
        customHeader={
          <LoginHeader
            college={initialCollege}
            portalTitle="Preceptor Portal"
            portalSubtitle="Hospital Doctor & Clinical Evaluator Access"
            onClose={onClose}
          />
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* PORTAL LOGIN TITLE & SUBTITLE */}
          <div className="text-center pt-2 pb-1">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Preceptor Portal Login
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
              Hospital Doctor & Evaluator Login for {collegeName}
            </p>
          </div>

          {/* DIVIDER */}
          <div className="border-t border-slate-100 dark:border-slate-800/60" />

          {/* CENTRAL ENLARGED PHARMDVERSE LOGO */}
          <div className="py-1 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setShowLogoModal(true)}
              className="relative group p-2 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all cursor-pointer focus:outline-none"
              title="Click to view official logo"
            >
              <img
                src="/pharmdverse-logo.png"
                alt="PharmDVerse Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          </div>
        
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-start gap-2 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Username (Email Address) *
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter preceptor email address"
              className="w-full h-[46px] px-3.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-[46px] pl-3.5 pr-10 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 focus:outline-none"
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
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loggingIn}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md shadow-cyan-600/20 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              {loggingIn ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In to Preceptor Portal</span>
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
