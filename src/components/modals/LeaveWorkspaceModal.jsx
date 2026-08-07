import React from 'react';
import { LogOut, ArrowLeft, ShieldAlert } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';

export const LeaveWorkspaceModal = ({
  isOpen,
  onClose,
  onConfirmLeave,
  leaveButtonText = "Go to College Landing Page"
}) => {
  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Leave Workspace?"
      subtitle="Confirmation Required"
      maxWidth="max-w-md"
    >
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Workspace Navigation Notice</strong>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
              You are about to leave your current workspace.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/2 h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm"
          >
            Stay in Workspace
          </button>

          <button
            type="button"
            onClick={onConfirmLeave}
            className="w-full sm:w-1/2 h-11 px-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="truncate">{leaveButtonText}</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
