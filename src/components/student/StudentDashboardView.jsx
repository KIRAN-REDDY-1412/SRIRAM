import React, { useState, useEffect } from 'react';
import { UserCheck, GraduationCap, Stethoscope, ArrowRight, ShieldCheck } from 'lucide-react';
import { fetchStudentAssignedPreceptorFromSupabase } from '../../services/supabaseService';

export const StudentDashboardView = ({ student, onNavigate }) => {
  const [assignedPreceptor, setAssignedPreceptor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreceptor = async () => {
      if (!student) return;
      setLoading(true);
      const res = await fetchStudentAssignedPreceptorFromSupabase(student.id);
      if (res.success && res.data) {
        setAssignedPreceptor(res.data);
      }
      setLoading(false);
    };

    loadPreceptor();
  }, [student]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* WELCOME CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-emerald-50/70 dark:from-[#0f172a] dark:via-slate-900 dark:to-emerald-950/40 text-slate-900 dark:text-white relative overflow-hidden shadow-md border border-slate-200/80 dark:border-slate-800">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
          {student?.profile_photo_url ? (
            <img
              src={student.profile_photo_url}
              alt={student.full_name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-400/60 shadow-md p-0.5 bg-white dark:bg-slate-800 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md border-2 border-emerald-400/60 shrink-0">
              {student?.full_name ? student.full_name.substring(0, 2).toUpperCase() : 'ST'}
            </div>
          )}

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Student Logbook Portal
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">Roll: {student?.roll_number}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Welcome, {student?.full_name}
            </h1>

            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Course: </span>
                <strong className="text-slate-900 dark:text-slate-100 font-bold">{student?.course} ({student?.year})</strong>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Batch: </span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{student?.batch}</strong>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div>
                <span className="text-slate-500 dark:text-slate-400">College: </span>
                <strong className="text-slate-900 dark:text-slate-100">{student?.colleges?.college_name || 'Pharmacy College'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* ASSIGNED PRECEPTOR CARD */}
        <div
          onClick={() => onNavigate('my-preceptor')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group border-l-4 border-l-emerald-500"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shadow-xs">
              <Stethoscope className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="mt-5">
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Assigned Clinical Preceptor:</span>
            {loading ? (
              <p className="text-base font-bold text-slate-400 mt-1">Loading preceptor...</p>
            ) : assignedPreceptor ? (
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {assignedPreceptor.full_name}
                </h3>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {assignedPreceptor.designation} • {assignedPreceptor.department}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  No Active Preceptor Assigned
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Contact College Admin to get assigned to a hospital preceptor.</p>
              </div>
            )}
          </div>
        </div>

        {/* MY PROFILE CARD */}
        <div
          onClick={() => onNavigate('profile')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group border-l-4 border-l-teal-500"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="mt-5">
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              ● Active Candidate
            </span>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">
              My Student Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              View your enrolled academic year, roll number, and contact details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
