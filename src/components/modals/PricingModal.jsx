import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Sparkles, Building2, ShieldCheck, Clock, Layers } from 'lucide-react';

export const PricingModal = ({ isOpen, onClose }) => {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Institutional Pricing"
      subtitle="Our subscription plans are currently being finalized. We are designing flexible licensing plans suitable for pharmacy colleges and institutions."
      maxWidth="max-w-2xl"
    >
      <div className="py-8 px-4 sm:px-8 text-center space-y-6">
        
        {/* ILLUSTRATIVE ICON CONTAINER */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-indigo-500/20 border border-emerald-500/30 dark:border-emerald-400/30 shadow-lg">
          <Building2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
        </div>

        {/* MAIN COMING SOON HEADING & MESSAGE */}
        <div className="space-y-2 max-w-lg mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Pricing Plans Coming Soon 🚀</span>
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Official Subscription Plans Underway
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Official subscription plans, features, and licensing options will be announced soon. Stay tuned for updates as we finalize tailored packages for pharmacy colleges.
          </p>
        </div>

        {/* KEY HIGHLIGHTS PREVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-xs font-bold text-slate-900 dark:text-white">Institutional Licensing</strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Tailored annual tiers for pharmacy colleges of all sizes.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-xs font-bold text-slate-900 dark:text-white">Full Feature Access</strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Includes all 5 clinical modules and custom branding controls.</span>
            </div>
          </div>
        </div>

        {/* DISABLED ACTION BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            disabled
            className="w-full sm:w-auto px-8 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold text-xs cursor-not-allowed border border-slate-300 dark:border-slate-700 opacity-80 flex items-center justify-center gap-2 mx-auto"
          >
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Pricing Available Soon</span>
          </button>
        </div>

      </div>
    </ModalWrapper>
  );
};
