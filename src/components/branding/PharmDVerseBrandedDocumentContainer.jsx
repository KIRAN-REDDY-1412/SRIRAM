import React from 'react';
import { PharmDVerseDocumentHeader } from './PharmDVerseDocumentHeader';

export const PharmDVerseBrandedDocumentContainer = ({
  college,
  branding,
  documentTitle,
  caseId,
  student,
  preceptorName,
  children,
  pageNumber = '1 of 1'
}) => {
  // Extract branding defaults if branding not fully loaded
  const showStudentSig = branding?.show_student_signature ?? true;
  const showPreceptorSig = branding?.show_preceptor_signature ?? true;
  const watermarkEnabled = branding?.watermark_enabled ?? true;
  const watermarkLine1 = branding?.watermark_text_line1 || 'PHARMDVERSE';
  const watermarkLine2 = branding?.watermark_text_line2 || 'Clinical Documentation System';
  const opacityPct = (branding?.watermark_opacity ?? 10) / 100;
  const isDiagonal = branding?.watermark_position === 'Diagonal';

  const footerLeft = branding?.footer_left_text || 'PharmDVerse';
  const footerCenter = branding?.footer_center_text || 'Confidential Clinical Documentation';
  const showPageNum = branding?.show_page_number ?? true;
  const showDateTime = branding?.show_generated_datetime ?? true;

  const fontFamily = branding?.font_family || 'Times New Roman';
  const primaryColor = branding?.primary_color || '#0f172a';
  const borderCol = branding?.border_color || '#0f172a';
  const tableHeaderBg = branding?.table_header_color || '#f1f5f9';
  const textColor = branding?.text_color || '#0f172a';

  const currentDateTimeStr = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div
      className="bg-white p-6 sm:p-10 max-w-3xl mx-auto border-2 shadow-xl space-y-6 text-xs relative overflow-hidden"
      style={{
        fontFamily: fontFamily,
        borderColor: borderCol,
        color: textColor,
        marginTop: branding?.margin_top || '0',
        marginBottom: branding?.margin_bottom || '0'
      }}
    >
      {/* WATERMARK OVERLAY */}
      {watermarkEnabled && (
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col items-center justify-center select-none z-0 ${
            isDiagonal ? '-rotate-35' : ''
          }`}
          style={{ opacity: opacityPct }}
        >
          <span className="text-4xl sm:text-5xl font-black uppercase tracking-widest font-mono text-slate-800">
            {watermarkLine1}
          </span>
          <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-700 mt-1">
            {watermarkLine2}
          </span>
        </div>
      )}

      {/* DOCUMENT CONTENT LAYER */}
      <div className="relative z-10 space-y-6">
        
        {/* COMMON BRANDING HEADER */}
        <PharmDVerseDocumentHeader
          college={college}
          branding={branding}
          documentTitle={documentTitle}
          caseId={caseId}
        />

        {/* CLINICAL DOCUMENT BODY CHILDREN */}
        {children}

        {/* SIGNATURES SECTION */}
        {(showStudentSig || showPreceptorSig) && (
          <div className="pt-8 flex justify-between items-center text-xs font-bold font-serif border-t" style={{ borderColor: borderCol }}>
            {showStudentSig ? (
              <div className="pt-1 w-48 text-center border-t" style={{ borderColor: borderCol }}>
                Student Signature
                <span className="block text-[10px] font-mono font-normal text-slate-600">
                  {student?.full_name} ({student?.roll_number})
                </span>
              </div>
            ) : <div className="w-48" />}

            {showPreceptorSig ? (
              <div className="pt-1 w-48 text-center border-t" style={{ borderColor: borderCol }}>
                Preceptor Signature
                <span className="block text-[10px] font-mono font-normal text-slate-600">
                  {preceptorName || 'Assigned Faculty Preceptor'}
                </span>
              </div>
            ) : <div className="w-48" />}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-4 border-t text-[10px] font-mono text-slate-500" style={{ borderColor: borderCol }}>
          <span>{footerLeft} {showDateTime ? `• ${currentDateTimeStr}` : ''}</span>
          <span>{footerCenter}</span>
          <span>{showPageNum ? `Page ${pageNumber}` : ''}</span>
        </div>

      </div>

    </div>
  );
};
