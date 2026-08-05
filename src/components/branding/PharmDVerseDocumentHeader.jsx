import React, { useState, useEffect } from 'react';
import { fetchCollegeByIdFromSupabase } from '../../services/supabaseService';

export const PharmDVerseDocumentHeader = ({ college: initialCollege, branding, documentTitle, caseId }) => {
  const [currentCollege, setCurrentCollege] = useState(initialCollege);

  useEffect(() => {
    setCurrentCollege(initialCollege);
  }, [initialCollege]);

  // LIVE SYNCHRONIZATION FOR COLLEGE IDENTITY (AUTONOMOUS STATUS, LOGOS, NAMES)
  useEffect(() => {
    const handleCollegeUpdated = (e) => {
      if (e.detail) {
        setCurrentCollege(e.detail);
      }
    };

    window.addEventListener('pharmdverse_college_updated', handleCollegeUpdated);
    return () => window.removeEventListener('pharmdverse_college_updated', handleCollegeUpdated);
  }, []);

  // ALSO FETCH FRESH COLLEGE RECORD DIRECTLY FROM SUPABASE IF ID EXISTS
  useEffect(() => {
    const fetchFreshCollege = async () => {
      if (initialCollege?.id) {
        const res = await fetchCollegeByIdFromSupabase(initialCollege.id);
        if (res.success && res.college) {
          setCurrentCollege(res.college);
        }
      }
    };
    fetchFreshCollege();
  }, [initialCollege?.id]);

  const showCollegeLogo = branding?.show_college_logo ?? true;
  const showCollegeName = branding?.show_college_name ?? true;
  const showAutonomous = branding?.show_autonomous ?? true;
  const showHospitalLogo = branding?.show_hospital_logo ?? true;
  const showHospitalName = branding?.show_hospital_name ?? true;

  const collegeName = currentCollege?.college_name || currentCollege?.name || 'A.M. REDDY MEMORIAL COLLEGE OF PHARMACY';
  const collegeLogoUrl = currentCollege?.college_logo_url || currentCollege?.logoUrl;
  const hospitalName = currentCollege?.hospital_name || currentCollege?.hospitalName || 'Lalitha Superspecialities Hospital';
  const hospitalLogoUrl = currentCollege?.hospital_logo_url || currentCollege?.hospitalLogoUrl;
  
  // SINGLE SOURCE OF TRUTH FOR AUTONOMOUS STATUS
  const isAutonomous = Boolean(currentCollege?.is_autonomous ?? currentCollege?.isAutonomous);

  return (
    <div className="space-y-2 mb-6 text-slate-900 font-serif">
      
      {/* HEADER ROW 1 */}
      <div className="border-2 border-slate-900 p-3 sm:p-4 text-center flex items-center justify-between min-h-[90px] relative gap-2">
        
        {/* LEFT: COLLEGE LOGO */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-start shrink-0">
          {showCollegeLogo && collegeLogoUrl ? (
            <img src={collegeLogoUrl} alt={collegeName} className="max-w-14 max-h-14 sm:max-w-16 sm:max-h-16 object-contain border border-slate-300 rounded-sm" />
          ) : showCollegeLogo ? (
            <div className="w-12 h-12 sm:w-14 sm:h-14 border border-slate-900 font-sans text-[8px] sm:text-[9px] flex items-center justify-center font-bold text-slate-700 bg-slate-50">COLLEGE LOGO</div>
          ) : null}
        </div>

        {/* CENTER: COLLEGE NAME (SINGLE LINE), AUTONOMOUS, HOSPITAL NAME */}
        <div className="flex-1 text-center px-1 sm:px-3 space-y-0.5 min-w-0">
          {showCollegeName && (
            <h1 className="text-[11px] sm:text-sm md:text-base font-black uppercase tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
              {collegeName}
            </h1>
          )}

          {showAutonomous && isAutonomous && (
            <div className="text-[10px] sm:text-xs font-bold italic text-indigo-900 tracking-wide whitespace-nowrap">
              (Autonomous)
            </div>
          )}

          {showHospitalName && (
            <h2 className="text-[10px] sm:text-xs md:text-sm font-extrabold uppercase text-slate-800 tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
              {hospitalName}
            </h2>
          )}
        </div>

        {/* RIGHT: HOSPITAL LOGO */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-end shrink-0">
          {showHospitalLogo && hospitalLogoUrl ? (
            <img src={hospitalLogoUrl} alt={hospitalName} className="max-w-14 max-h-14 sm:max-w-16 sm:max-h-16 object-contain border border-slate-300 rounded-sm" />
          ) : showHospitalLogo ? (
            <div className="w-12 h-12 sm:w-14 sm:h-14 border border-slate-900 font-sans text-[8px] sm:text-[9px] flex items-center justify-center font-bold text-slate-700 bg-slate-50">HOSPITAL LOGO</div>
          ) : null}
        </div>

      </div>

      {/* HEADER ROW 2 */}
      <div className="flex justify-between items-center text-xs font-extrabold font-mono border-b-2 border-slate-900 pb-2 px-1">
        <span className="font-serif text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
          {documentTitle}
        </span>
        <span className="text-slate-900">
          Case ID : {caseId || 'AMRMCP-2026-000001'}
        </span>
      </div>

    </div>
  );
};
