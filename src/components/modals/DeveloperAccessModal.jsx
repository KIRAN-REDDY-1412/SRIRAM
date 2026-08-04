import React, { useState, useEffect, useRef } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { KeyRound, Lock, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

export const DeveloperAccessModal = ({ isOpen, onClose, onSuccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0); // in seconds
  const [isVerifying, setIsVerifying] = useState(false);
  
  const inputRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setAccessCode('');
      setError('');
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 120);
    }
  }, [isOpen]);

  // Handle Lockout 5-minute countdown (300 seconds)
  useEffect(() => {
    if (lockoutTimer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setFailedAttempts(0); // Reset attempts after lockout period
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [lockoutTimer]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (lockoutTimer > 0) return;

    if (!accessCode.trim()) {
      setError('Access Code is required.');
      return;
    }

    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      setIsVerifying(false);

      // Check code: '1412'
      if (accessCode.trim() === '1412') {
        setFailedAttempts(0);
        setError('');
        onClose();
        onSuccess();
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 5) {
          setLockoutTimer(300); // 5 minutes (300s) lockout
          setError('Maximum attempts exceeded. Developer access locked for 5 minutes.');
        } else {
          setError(`Invalid Developer Access Code. (${5 - nextAttempts} attempts remaining)`);
        }
      }
    }, 300);
  };

  const formatLockoutTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[420px] w-[90vw] md:w-[420px]"
      rounded="rounded-3xl"
      title="Developer Access"
      subtitle="Enter the Developer Access Code."
    >
      <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
        
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-600/20">
          <KeyRound className="w-7 h-7 stroke-[2.2]" />
        </div>

        {/* Validation or Lockout Error Notice */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 text-left font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span>{error}</span>
              {lockoutTimer > 0 && (
                <div className="mt-1 font-mono text-xs text-rose-800 dark:text-rose-200 font-bold">
                  Time remaining: {formatLockoutTime(lockoutTimer)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-left">
            Access Code *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="password"
              disabled={lockoutTimer > 0}
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value);
                if (error && lockoutTimer === 0) setError('');
              }}
              placeholder="••••"
              maxLength={20}
              className={`w-full h-[52px] pl-10 pr-4 text-center font-mono text-base tracking-widest rounded-[14px] border ${
                error 
                  ? 'border-rose-500 ring-2 ring-rose-500/15 bg-rose-50/20 dark:bg-rose-950/20' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60'
              } text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {/* Secondary Button: Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="h-[48px] px-5 rounded-[14px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            Cancel
          </button>

          {/* Primary Button: Continue */}
          <button
            type="submit"
            disabled={isVerifying || lockoutTimer > 0}
            className="h-[48px] flex-1 px-6 rounded-[14px] bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <span>Verifying...</span>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>

      </form>
    </ModalWrapper>
  );
};
