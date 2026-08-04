import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { authenticateSuperAdmin } from '../../services/authService';
import { 
  ShieldAlert, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle 
} from 'lucide-react';

export const SuperAdminModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginErrors, setLoginErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const validateLoginForm = () => {
    const errors = {};
    if (!loginEmail.trim()) {
      errors.email = 'Email Address is required.';
    }

    if (!loginPassword.trim()) {
      errors.password = 'Password is required.';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!validateLoginForm()) return;

    setIsAuthenticating(true);

    const result = await authenticateSuperAdmin(loginEmail, loginPassword);
    setIsAuthenticating(false);

    if (result.success) {
      setAuthError('');
      setLoginPassword('');
      onClose();
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setAuthError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[480px] w-[90vw] md:w-[480px]"
      rounded="rounded-3xl"
      hideDefaultHeader={true}
    >
      <div className="space-y-6 animate-fadeIn">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-700 to-emerald-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-600/25 transform -rotate-2">
            <ShieldAlert className="w-7 h-7 stroke-[2.2]" />
          </div>

          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight pt-1">
            Super Admin Login
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Authorized Central Governance Access
          </p>
        </div>

        {/* General Authentication Failure Alert */}
        {authError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-center gap-2 text-center font-semibold animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSignIn} className="space-y-4">
          
          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  if (loginErrors.email) setLoginErrors(prev => ({ ...prev, email: '' }));
                  if (authError) setAuthError('');
                }}
                placeholder="admin@pharmdverse.org"
                className={`w-full h-[52px] pl-10 pr-4 text-xs rounded-[14px] border ${
                  loginErrors.email || authError
                    ? 'border-rose-500 ring-2 ring-rose-500/15 bg-rose-50/20 dark:bg-rose-950/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60'
                } text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 transition-all duration-200`}
              />
            </div>
            {loginErrors.email && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">{loginErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password *
              </label>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  if (loginErrors.password) setLoginErrors(prev => ({ ...prev, password: '' }));
                  if (authError) setAuthError('');
                }}
                placeholder="••••••••••••"
                className={`w-full h-[52px] pl-10 pr-12 text-xs rounded-[14px] border ${
                  loginErrors.password || authError
                    ? 'border-rose-500 ring-2 ring-rose-500/15 bg-rose-50/20 dark:bg-rose-950/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60'
                } text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {loginErrors.password && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">{loginErrors.password}</p>
            )}
          </div>

          {/* Options: Remember Me & Show/Hide */}
          <div className="flex items-center justify-between text-xs py-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-900"
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showPassword ? 'Hide Password' : 'Show Password'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[48px] px-5 rounded-[14px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="flex-1 h-[48px] px-6 rounded-[14px] bg-gradient-to-r from-blue-600 via-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </ModalWrapper>
  );
};
