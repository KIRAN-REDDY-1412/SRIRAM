import React from 'react';
import { User, Phone, Mail, Award, Briefcase, Building2, ShieldCheck } from 'lucide-react';

export const PreceptorProfileView = ({ preceptor }) => {
  if (!preceptor) return null;

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <span>My Clinical Profile</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Read-only preceptor credentials and department information.
        </p>
      </div>

      {/* MAIN PROFILE CARD */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        
        {/* AVATAR & TITLE HEADER */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
          {preceptor.profile_photo_url ? (
            <img
              src={preceptor.profile_photo_url}
              alt={preceptor.full_name}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-cyan-500 shadow-md shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shrink-0">
              {preceptor.full_name ? preceptor.full_name.substring(0, 2).toUpperCase() : 'PR'}
            </div>
          )}

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                Preceptor
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {preceptor.status}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {preceptor.full_name}
            </h3>

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {preceptor.designation} • {preceptor.department}
            </p>

            <p className="text-xs text-slate-400 font-mono">
              College: {preceptor.colleges?.college_name || 'Pharmacy College'}
            </p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium text-[11px] block">Full Name</span>
            <strong className="text-slate-900 dark:text-white font-bold">{preceptor.full_name}</strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium text-[11px] block">Qualification</span>
            <strong className="text-slate-900 dark:text-white font-bold">{preceptor.qualification}</strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium text-[11px] block">Designation</span>
            <strong className="text-slate-900 dark:text-white font-bold">{preceptor.designation}</strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium text-[11px] block">Department</span>
            <strong className="text-slate-900 dark:text-white font-bold text-cyan-600 dark:text-cyan-400">{preceptor.department}</strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium text-[11px] block">Mobile Number</span>
            <strong className="text-slate-900 dark:text-white font-mono font-bold">{preceptor.mobile_number}</strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium text-[11px] block">Email Address (Username)</span>
            <strong className="text-slate-900 dark:text-white font-mono font-bold">{preceptor.email}</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>🔒 Read-only profile view. To request changes, contact College Admin.</span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Status: {preceptor.status}</span>
        </div>

      </div>
    </div>
  );
};
