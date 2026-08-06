import React, { useState, useEffect } from 'react';
import { PharmDVerseDocumentHeader } from './PharmDVerseDocumentHeader';

export const PharmDVerseBrandedDocumentContainer = ({
  college,
  branding: initialBranding,
  documentTitle,
  caseId,
  student,
  preceptorName,
  children,
  pageNumber = '1 of 1',
  showSignatures = false,
  isLastPage = false
}) => {
  const [branding, setBranding] = useState(initialBranding);

  useEffect(() => {
    setBranding(initialBranding);
  }, [initialBranding]);

  // LIVE SYNCHRONIZATION VIA CUSTOM EVENT
  useEffect(() => {
    const handleBrandingUpdated = (e) => {
      if (e.detail) {
        setBranding(e.detail);
      }
    };

    window.addEventListener('pharmdverse_branding_updated', handleBrandingUpdated);
    return () => window.removeEventListener('pharmdverse_branding_updated', handleBrandingUpdated);
  }, []);

  // Extract all 26 branding values
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

  const paperSize = branding?.paper_size || 'A4';
  const orientation = branding?.orientation || 'Portrait';
  const isLandscape = orientation.toLowerCase() === 'landscape';

  const marginTop = branding?.margin_top || '15mm';
  const marginBottom = branding?.margin_bottom || '15mm';
  const marginLeft = branding?.margin_left || '15mm';
  const marginRight = branding?.margin_right || '15mm';

  const fontFamily = branding?.font_family || 'Times New Roman';
  const titleFontSize = branding?.title_font_size || '18pt';
  const headingFontSize = branding?.heading_font_size || '14pt';
  const bodyFontSize = branding?.body_font_size || '12pt';

  const primaryColor = branding?.primary_color || '#0f172a';
  const secondaryColor = branding?.secondary_color || '#0284c7';
  const tableHeaderBg = branding?.table_header_color || '#f1f5f9';
  const borderCol = branding?.border_color || '#0f172a';
  const textColor = branding?.text_color || '#0f172a';

  const zebraStriping = Boolean(branding?.zebra_striping);
  const repeatTableHeader = branding?.repeat_header ?? branding?.repeat_table_header ?? true;

  // Determine if this is the first page of the document
  const isFirstPage = pageNumber ? pageNumber.toString().trim().startsWith('1') : true;
  // If repeatTableHeader is OFF (false), only display the College Document Header on Page 1
  const shouldShowDocumentHeader = Boolean(repeatTableHeader || isFirstPage);

  const currentDateTimeStr = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const shouldDisplaySignatures = showSignatures || isLastPage;

  return (
    <div
      className={`bg-white shadow-xl relative overflow-hidden print:shadow-none print:m-0 print:w-full print:max-w-none print:break-after-page page-break ${
        isLandscape ? 'max-w-5xl mx-auto' : 'max-w-3xl mx-auto'
      } ${
        zebraStriping ? '[&_tbody_tr:nth-child(even)]:bg-slate-100/70' : '[&_tbody_tr]:bg-white'
      } ${
        repeatTableHeader ? '[&_thead]:table-header-group' : '[&_thead]:table-row-group'
      }`}
      style={{
        fontFamily: fontFamily,
        borderColor: borderCol,
        color: textColor,
        fontSize: bodyFontSize,
        paddingTop: marginTop,
        paddingBottom: marginBottom,
        paddingLeft: marginLeft,
        paddingRight: marginRight,
        pageBreakAfter: 'always',
        breakAfter: 'page'
      }}
    >
      {/* INJECT DYNAMIC PRINT MEDIA PAGE STYLES FOR EXACT PRINT & PDF DOWNLOAD SYNCHRONIZATION */}
      <style>{`
        @media print {
          @page {
            size: ${paperSize} ${orientation.toLowerCase()};
            margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft};
          }
          body {
            font-family: ${fontFamily} !important;
            color: ${textColor} !important;
          }
          thead {
            display: ${repeatTableHeader ? 'table-header-group' : 'table-row-group'} !important;
          }
          table {
            border-color: ${borderCol} !important;
          }
          th {
            background-color: ${tableHeaderBg} !important;
            color: ${primaryColor} !important;
            border-color: ${borderCol} !important;
          }
          td {
            border-color: ${borderCol} !important;
          }
        }

        .branded-title {
          font-size: ${titleFontSize};
          color: ${primaryColor};
        }
        .branded-heading {
          font-size: ${headingFontSize};
          color: ${primaryColor};
        }
        .branded-subheading {
          color: ${secondaryColor};
        }
        .branded-border {
          border-color: ${borderCol};
        }
        .branded-header-bg {
          background-color: ${tableHeaderBg};
        }
      `}</style>

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
        
        {/* COMMON BRANDING HEADER - DISPLAYED ON ALL PAGES IF REPEAT HEADER IS ON, OR ONLY ON PAGE 1 IF OFF */}
        {shouldShowDocumentHeader && (
          <PharmDVerseDocumentHeader
            college={college}
            branding={branding}
            documentTitle={documentTitle}
            caseId={caseId}
          />
        )}

        {/* CLINICAL DOCUMENT BODY CHILDREN */}
        {children}

        {/* SIGNATURES SECTION */}
        {shouldDisplaySignatures && (showStudentSig || showPreceptorSig) && (
          <div className="pt-8 flex justify-between items-center text-xs font-bold font-serif border-t" style={{ borderColor: borderCol }}>
            {showStudentSig ? (
              <div className="pt-1 w-48 text-center border-t" style={{ borderColor: borderCol }}>
                Student Signature
                <span className="block text-[10px] font-mono font-normal" style={{ color: secondaryColor }}>
                  {student?.full_name} ({student?.roll_number})
                </span>
                <span className="block text-[9px] font-mono text-slate-400">Date: {currentDateTimeStr}</span>
              </div>
            ) : <div className="w-48" />}

            {showPreceptorSig ? (
              <div className="pt-1 w-48 text-center border-t" style={{ borderColor: borderCol }}>
                Preceptor Signature
                <span className="block text-[10px] font-mono font-normal" style={{ color: secondaryColor }}>
                  {preceptorName || 'Assigned Faculty Preceptor'}
                </span>
                <span className="block text-[9px] font-mono text-slate-400">Date: {currentDateTimeStr}</span>
              </div>
            ) : <div className="w-48" />}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-4 border-t text-[10px] font-mono" style={{ borderColor: borderCol, color: secondaryColor }}>
          <span>{footerLeft} {showDateTime ? `• ${currentDateTimeStr}` : ''}</span>
          <span>{footerCenter}</span>
          <span>{showPageNum ? `Page ${pageNumber}` : ''}</span>
        </div>

      </div>

    </div>
  );
};
