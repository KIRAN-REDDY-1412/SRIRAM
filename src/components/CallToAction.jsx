import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CallToAction = ({ onOpenRegisterModal }) => {
  return (
    <section className="relative py-8 md:py-10 bg-gradient-to-b from-transparent via-slate-100/60 to-transparent dark:via-slate-900/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-2xl relative overflow-hidden border border-slate-700/60">
          
          {/* Background ambient light */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            
            {/* Centered Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Register Your College Today
            </h2>

            {/* Centered Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Digitize your pharmacy college with PharmDVerse and provide students, faculty, and preceptors with one unified clinical education platform.
            </p>

            {/* Single Large Primary Button */}
            <div className="pt-3">
              <button
                onClick={() => onOpenRegisterModal("Professional")}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 cursor-pointer"
              >
                <span>Register Your College</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
