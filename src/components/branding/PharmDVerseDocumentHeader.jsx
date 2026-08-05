import React from 'react';

export const PharmDVerseDocumentHeader = ({ college, branding, documentTitle, caseId }) => {
  const showCollegeLogo = branding?.show_college_logo ?? true;
  const showCollegeName = branding?.show_college_name ?? true;
  const showAutonomous = branding?.show_autonomous ?? true;
  const showHospitalLogo = branding?.show_hospital_logo ?? true;
  const showHospitalName = branding?.show_hospital_name ?? true;

  const collegeName = college?.college_name || 'A.M. REDDY MEMORIAL COLLEGE OF PHARMACY';
  const collegeLogoUrl = college?.college_logo_url;
  const hospitalName = college?.hospital_name || 'Lalitha Superspecialities Hospital';
  const hospitalLogoUrl = college?.hospital_logo_url;
  const isAutonomous = Boolean(college?.is_autonomous);

  return (
    <div className="space-y-2 mb-6 text-slate-900 font-serif">
      
      {/* HEADER ROW 1 */}
      <div className="border-2 border-slate-900 p-4 text-center flex items-center justify-between min-h-[90px] relative">
        
        {/* LEFT: COLLEGE LOGO */}
        <div className="w-16 h-16 flex items-center justify-start shrink-0">
          {showCollegeLogo && collegeLogoUrl ? (
            <img src={collegeLogoUrl} alt={collegeName} className="max-w-16 max-h-16 object-contain border border-slate-300 rounded-sm" />
          ) : showCollegeLogo ? (
            <div className="w-14 h-14 border border-slate-900 font-sans text-[9px] flex items-center justify-center font-bold text-slate-700 bg-slate-50">COLLEGE LOGO</div>
          ) : null}
        </div>

        {/* CENTER: COLLEGE NAME, AUTONOMOUS, HOSPITAL NAME */}
        <div className="flex-1 text-center px-4 space-y-0.5">
          {showCollegeName && (
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wide leading-tight">
              {collegeName}
            </h1>
          )}

          {showAutonomous && isAutonomous && (
            <div className="text-xs font-bold italic text-indigo-900 tracking-wide">
              (Autonomous)
            </div>
          )}

          {showHospitalName && (
            <h2 className="text-xs sm:text-sm font-extrabold uppercase text-slate-800 tracking-wider">
              {hospitalName}
            </h2>
          )}
        </div>

        {/* RIGHT: HOSPITAL LOGO */}
        <div className="w-16 h-16 flex items-center justify-end shrink-0">
          {showHospitalLogo && hospitalLogoUrl ? (
            <img src={hospitalLogoUrl} alt={hospitalName} className="max-w-16 max-h-16 object-contain border border-slate-300 rounded-sm" />
          ) : showHospitalLogo ? (
            <div className="w-14 h-14 border border-slate-900 font-sans text-[9px] flex items-center justify-center font-bold text-slate-700 bg-slate-50">HOSPITAL LOGO</div>
          ) : null}
        </div>

      </div>

      {/* HEADER ROW 2 */}
      <div className="flex justify-between items-center text-xs font-extrabold font-mono border-b-2 border-slate-900 pb-2 px-1">
        <span className="font-serif text-sm font-black uppercase tracking-wider text-slate-900">
          {documentTitle}
        </span>
        <span className="text-slate-900">
          Case ID : {caseId || 'AMRMCP-2026-000001'}
        </span>
      </div>

    </div>
  );
};
