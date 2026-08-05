import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { ExternalLink, ShieldCheck, UserCheck, Stethoscope, Building2, ChevronRight, MapPin } from 'lucide-react';

export const PortalModal = ({ isOpen, onClose, college }) => {
  if (!college) return null;

  const baseUrl = college.portalUrl || `https://${(college.code || 'clg').toLowerCase()}.pharmdverse.com`;
  const locationText = [college.city, college.district, college.state].filter(Boolean).join(', ');

  const portals = [
    {
      id: 'admin',
      name: 'College Admin Portal',
      description: 'Principal, HODs & Faculty Management',
      icon: Building2,
      url: `${baseUrl}/admin`,
      color: 'text-indigo-600 dark:text-indigo-400',
      hoverBorder: 'hover:border-indigo-500 dark:hover:border-indigo-500'
    },
    {
      id: 'preceptor',
      name: 'Preceptor Portal',
      description: 'Hospital Doctors & Clinical Preceptors',
      icon: Stethoscope,
      url: `${baseUrl}/preceptor`,
      color: 'text-cyan-600 dark:text-cyan-400',
      hoverBorder: 'hover:border-cyan-500 dark:hover:border-cyan-500'
    },
    {
      id: 'student',
      name: 'Student Portal',
      description: 'PharmD 1st - 6th Year Candidates',
      icon: UserCheck,
      url: `${baseUrl}/student`,
      color: 'text-emerald-600 dark:text-emerald-400',
      hoverBorder: 'hover:border-emerald-500 dark:hover:border-emerald-500'
    }
  ];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`${college.name} Portal`}
      subtitle={`Dedicated PharmDVerse Cloud Gateway • ${locationText}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Dynamic College Branding Banner Card (No hardcoded values) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white relative overflow-hidden shadow-lg border border-slate-700/60">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start gap-4 relative z-10">
            {/* Dynamic College Logo or Placeholder */}
            {college.logoUrl ? (
              <img
                src={college.logoUrl}
                alt={college.name}
                className="w-14 h-14 rounded-2xl object-contain bg-white p-1 border border-white/30 shadow-md shrink-0"
              />
            ) : (
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${college.logoBg || 'from-emerald-600 to-teal-700'} flex items-center justify-center text-white font-extrabold text-base shadow-md border border-white/20 shrink-0`}>
                {college.initials}
              </div>
            )}

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base font-extrabold text-white leading-snug tracking-tight truncate">
                  {college.name}
                </h4>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {college.status || 'Active'}
                </span>
              </div>

              {/* Dynamic College Description (fallback if empty) */}
              <p className="text-xs text-slate-300 leading-relaxed font-normal line-clamp-3">
                {college.description ? college.description : 'No college description available.'}
              </p>

              {/* Location Line */}
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{locationText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Portal Access Roles Selection (THREE PORTALS: ADMIN, PRECEPTOR, STUDENT) */}
        <div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
            Select Portal Gateway to Access:
          </p>
          
          <div className="grid grid-cols-1 gap-2.5">
            {portals.map((p) => {
              const IconComponent = p.icon;
              return (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 ${p.hoverBorder} transition-all flex items-center justify-between group shadow-xs`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <IconComponent className={`w-4 h-4 ${p.color}`} />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {p.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    <span>Enter</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Security badge */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between border border-slate-200/50 dark:border-slate-800">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Single Sign-On (SSO) Enabled for {college.code}
          </span>
          <a
            href={baseUrl}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Direct Domain</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
