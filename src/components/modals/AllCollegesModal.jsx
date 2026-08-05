import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useColleges } from '../../context/CollegeContext';
import { Search, MapPin, ExternalLink, Building2, CheckCircle2 } from 'lucide-react';

export const AllCollegesModal = ({ isOpen, onClose, onOpenPortal }) => {
  const { activeColleges } = useColleges();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredColleges = activeColleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="All Subscribed Pharmacy Colleges"
      subtitle="Select your institution to open its dedicated clinical portal"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search college name, city, district, state or code..."
            className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        {/* Colleges Grid or Empty State */}
        {filteredColleges.length === 0 ? (
          <div className="py-16 text-center bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No Active Pharmacy Colleges Available
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registered pharmacy colleges will appear here once approved by Super Admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {filteredColleges.map((college) => {
              const locationText = [college.city, college.district, college.state]
                .filter(Boolean)
                .join(', ');

              return (
                <div
                  key={college.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${college.logoBg || 'from-emerald-600 to-teal-700'} flex items-center justify-center text-white font-extrabold text-[11px]`}>
                          {college.initials}
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {college.code}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {college.name}
                    </h4>

                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{locationText}</span>
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPortal(college);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </ModalWrapper>
  );
};
