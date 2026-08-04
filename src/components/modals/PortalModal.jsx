import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { ExternalLink, ShieldCheck, UserCheck, Stethoscope, Award, ChevronRight } from 'lucide-react';

export const PortalModal = ({ isOpen, onClose, college }) => {
  if (!college) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`${college.name} Portal`}
      subtitle={`Dedicated PharmDVerse Cloud Gateway • ${college.city}, ${college.state}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* College Banner Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white relative overflow-hidden shadow-lg">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${college.logoBg} flex items-center justify-center text-white font-extrabold text-base shadow-md border border-white/20 shrink-0`}>
              {college.initials}
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-1">
                {college.status}
              </span>
              <h4 className="text-base font-bold text-white leading-tight">{college.name}</h4>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>{college.accreditation}</span>
                <span>•</span>
                <span>{college.studentsCount} Active PharmD Candidates</span>
              </p>
            </div>
          </div>
        </div>

        {/* Portal Access Roles Selection */}
        <div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Portal Gateway to Access:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={college.portalUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">Student Logbook</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">PharmD 1st - 6th Year</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href={college.portalUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">Preceptor Review</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Hospital Doctors & Faculty</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Security badge */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between border border-slate-200/50 dark:border-slate-800">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Single Sign-On (SSO) Enabled for {college.code}
          </span>
          <a
            href={college.portalUrl}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Direct Domain</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-medium"
          >
            Close Window
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
