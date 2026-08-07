import React, { useState, useEffect } from 'react';
import { UserCheck, Stethoscope, GraduationCap, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { fetchPreceptorAssignedStudentsFromSupabase } from '../../services/supabaseService';

export const PreceptorDashboardView = ({ preceptor, onNavigate }) => {
  const [assignedCount, setAssignedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!preceptor) return;
      setLoading(true);
      const res = await fetchPreceptorAssignedStudentsFromSupabase(preceptor.id);
      if (res.success) {
        setAssignedCount(res.data.length);
      }
      setLoading(false);
    };

    loadStats();
  }, [preceptor]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* WELCOME CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-purple-50/70 dark:from-[#0f172a] dark:via-slate-900 dark:to-purple-950/40 text-slate-900 dark:text-white relative overflow-hidden shadow-md border border-slate-200/80 dark:border-slate-800">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
          {preceptor?.profile_photo_url ? (
            <img
              src={preceptor.profile_photo_url}
              alt={preceptor.full_name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-purple-400/60 shadow-md p-0.5 bg-white dark:bg-slate-800 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-2xl shadow-md border-2 border-purple-400/60 shrink-0">
              {preceptor?.full_name ? preceptor.full_name.substring(0, 2).toUpperCase() : 'PR'}
            </div>
          )}

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Stethoscope className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Preceptor Portal
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{preceptor?.colleges?.college_name || 'Pharmacy College'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Welcome, {preceptor?.full_name}
            </h1>

            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Department: </span>
                <strong className="text-slate-900 dark:text-slate-100 font-bold">{preceptor?.department}</strong>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Qualification: </span>
                <strong className="text-slate-900 dark:text-slate-100 font-bold">{preceptor?.qualification}</strong>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Designation: </span>
                <strong className="text-slate-900 dark:text-slate-100">{preceptor?.designation}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC STATISTICS CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div
          onClick={() => onNavigate('assigned-students')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group border-l-4 border-l-cyan-500"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center shadow-xs">
              <GraduationCap className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="mt-5">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {loading ? '...' : assignedCount}
            </span>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">
              Total Assigned Students
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pharm.D candidates currently allocated under your preceptorshp.
            </p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('profile')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group border-l-4 border-l-indigo-500"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="mt-5">
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              ● Active Account
            </span>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">
              My Clinical Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              View your read-only profile & hospital department credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
