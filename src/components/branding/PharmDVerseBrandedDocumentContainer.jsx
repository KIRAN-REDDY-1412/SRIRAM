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
  const opacityPct = Math.max((branding?.watermark_opacity ?? 18) / 100, 0.16);
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

  const rawFontFamily = branding?.font_family || 'Times New Roman';
  const getFontStack = (font) => {
    switch (font) {
      case 'Calibri':
        return 'Calibri, Aptos, Segoe UI, sans-serif';
      case 'Arial':
        return 'Arial, Helvetica, sans-serif';
      case 'Georgia':
        return 'Georgia, Cambria, serif';
      case 'Inter':
        return 'Inter, system-ui, -apple-system, sans-serif';
      case 'Roboto':
        return 'Roboto, system-ui, sans-serif';
      case 'Times New Roman':
      default:
        return '"Times New Roman", Times, serif';
    }
  };
  const fontFamily = getFontStack(rawFontFamily);
  const titleFontSize = branding?.title_font_size || '18pt';
  const headingFontSize = branding?.heading_font_size || '14pt';
  const bodyFontSize = branding?.body_font_size || '12pt';

  const primaryColor = branding?.primary_color || '#0f172a';
  const secondaryColor = branding?.secondary_color || '#0284c7';
  const tableHeaderBg = branding?.table_header_color || '#f1f5f9';
  const borderCol = branding?.border_color || '#0f172a';
  const textColor = branding?.text_color || '#0f172a';

  const zebraStriping = Boolean(branding?.zebra_striping);
  const repeatTableHeader = branding?.repeat_table_header ?? true;
  const repeatHeader = branding?.repeat_header ?? true;
  const repeatFooter = branding?.repeat_footer ?? true;

  // Determine if this is the first page of the document
  const isFirstPage = pageNumber ? pageNumber.toString().trim().startsWith('1') : true;

  // If repeatHeader is ON (true), display on all pages. If OFF (false), display ONLY on Page 1.
  const shouldShowDocumentHeader = Boolean(repeatHeader || isFirstPage);

  // If repeatFooter is ON (true), display on all pages. If OFF (false), display ONLY on the last page.
  const shouldShowDocumentFooter = Boolean(repeatFooter || isLastPage);

  // If repeatTableHeader is ON (true), repeat table headers on every page. If OFF (false), display ONLY on Page 1.
  const shouldShowTableHeader = Boolean(repeatTableHeader || isFirstPage);

  const currentDateTimeStr = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const shouldDisplaySignatures = showSignatures || isLastPage;

  return (
    <div
      className={`pharmdverse-document-page bg-white shadow-xl relative overflow-visible print:shadow-none print:m-0 print:w-full print:max-w-none print:break-after-page page-break transition-all duration-300 flex flex-col justify-between ${
        isLandscape 
          ? 'w-full max-w-5xl mx-auto min-h-[210mm] aspect-[297/210]' 
          : 'w-full max-w-3xl mx-auto min-h-[297mm]'
      } ${
        zebraStriping ? '[&_tbody_tr:nth-child(even)]:bg-slate-100/70' : '[&_tbody_tr]:bg-white'
      } ${
        shouldShowTableHeader ? '[&_thead]:table-header-group' : '[&_thead]:hidden'
      }`}
      style={{
        backgroundColor: '#ffffff',
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
          html, body {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            background: #ffffff !important;
            font-family: ${fontFamily} !important;
            color: ${textColor} !important;
          }
          div, section, main {
            max-height: none !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #official-clinical-case-pdf-container,
          #official-clinical-case-pdf-container *,
          .pharmdverse-document-page,
          .pharmdverse-document-page * {
            visibility: visible !important;
          }
          #official-clinical-case-pdf-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .pharmdverse-document-page {
            box-shadow: none !important;
            margin: 0 auto !important;
            height: auto !important;
            min-height: 270mm !important;
            max-height: none !important;
            overflow: visible !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          thead {
            display: ${shouldShowTableHeader ? 'table-header-group' : 'none'} !important;
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

        .branded-body,
        .branded-body div,
        .branded-body span,
        .branded-body p,
        .branded-body td,
        .branded-body th,
        .branded-body li,
        .branded-body strong,
        .branded-body label,
        .branded-body a {
          font-size: ${bodyFontSize} !important;
        }

        .branded-title,
        .branded-title * {
          font-size: ${titleFontSize} !important;
          color: ${primaryColor} !important;
        }

        .branded-heading,
        .branded-heading * {
          font-size: ${headingFontSize} !important;
          color: ${primaryColor} !important;
        }

        .branded-subheading,
        .branded-subheading * {
          color: ${secondaryColor} !important;
        }

        .branded-border {
          border-color: ${borderCol};
        }
        .branded-header-bg {
          background-color: ${tableHeaderBg};
        }
      `}</style>

      {/* WATERMARK OVERLAY - XEROX SUITABLE CONTRAST */}
      {watermarkEnabled && (
        <div
          className={`absolute inset-0 pointer-events-none flex flex-col items-center justify-center select-none z-0 ${
            isDiagonal ? '-rotate-35' : ''
          }`}
          style={{ opacity: opacityPct }}
        >
          <span className="text-4xl sm:text-5xl font-black uppercase tracking-widest font-mono text-slate-600">
            {watermarkLine1}
          </span>
          <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-500 mt-1">
            {watermarkLine2}
          </span>
        </div>
      )}

      {/* DOCUMENT CONTENT LAYER */}
      <div className="relative z-10 flex-1 flex flex-col justify-between space-y-6">
        
        <div className="space-y-6 flex-1">
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
          <div className="branded-body space-y-6">
            {children}
          </div>
        </div>

        {/* BOTTOM CONTAINER FOR SIGNATURES & FOOTER */}
        <div className="space-y-4 pt-4 mt-auto break-inside-avoid print:break-inside-avoid">
          
          {/* SIGNATURES SECTION - FIXED AT BOTTOM MARGIN OF FINAL PAGE */}
          {shouldDisplaySignatures && (showStudentSig || showPreceptorSig) && (
            <div className="pt-8 flex justify-between items-center text-xs font-bold font-serif border-t break-inside-avoid print:break-inside-avoid" style={{ borderColor: borderCol }}>
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
          {shouldShowDocumentFooter && (
            <div className="flex justify-between items-center pt-3 border-t text-[10px] font-mono" style={{ borderColor: borderCol, color: secondaryColor }}>
              <span>{footerLeft} {showDateTime ? `• ${currentDateTimeStr}` : ''}</span>
              <span>{footerCenter}</span>
              <span>{showPageNum ? `Page ${pageNumber}` : ''}</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
