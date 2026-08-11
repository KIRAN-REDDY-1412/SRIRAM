import React, { useState } from 'react';
import { LogOut, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';

export const LogoutConfirmModal = ({
  isOpen,
  onClose,
  onConfirmLogout,
  userType = 'Session'
}) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    setLoggingOut(true);
    setSuccessMsg('✅ Logged out successfully! Redirecting...');
    setTimeout(() => {
      setLoggingOut(false);
      setSuccessMsg('');
      onConfirmLogout();
    }, 1000);
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Logout"
      subtitle={`End your ${userType} session`}
      maxWidth="max-w-md"
    >
      <div className="p-6 space-y-5">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold mb-0.5">Are you sure you want to log out?</strong>
            Any unsaved changes in progress will be preserved as draft where applicable.
          </div>
        </div>

        {/* INLINE SUCCESS MESSAGE */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 shadow-xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loggingOut}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loggingOut}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            {loggingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Confirm Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
