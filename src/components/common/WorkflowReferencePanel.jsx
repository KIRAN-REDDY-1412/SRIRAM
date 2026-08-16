import React, { useState, Component } from 'react';
import { Eye, Maximize2, X, Info } from 'lucide-react';

class PanelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('[WorkflowReferencePanel Error Caught]:', err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl">
          Workflow Diagram Reference
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Role-Based Workflow Reference Panel & Modal Component.
 * Displays top-right workflow guidance for Student, Preceptor, and College Admin roles.
 */
export const WorkflowReferencePanel = ({ role = 'student' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getRoleConfig = () => {
    switch (role) {
      case 'preceptor':
        return {
          title: 'Preceptor Review Workflow',
          badge: 'Preceptor Guide',
          themeBorder: 'border-emerald-200 dark:border-emerald-900',
          themeBg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
          badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          cropPosition: '0% 48.5%',
          containerHeight: 'h-24 sm:h-28'
        };
      case 'college_admin':
        return {
          title: 'College Admin Workflow',
          badge: 'Admin Guide',
          themeBorder: 'border-purple-200 dark:border-purple-900',
          themeBg: 'bg-purple-50/80 dark:bg-purple-950/40',
          badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/80 dark:text-purple-300 border-purple-300 dark:border-purple-700',
          btnBg: 'bg-purple-600 hover:bg-purple-700 text-white',
          cropPosition: '0% 98.5%',
          containerHeight: 'h-24 sm:h-28'
        };
      case 'student':
      default:
        return {
          title: 'Student Workflow Guide',
          badge: 'Student Guide',
          themeBorder: 'border-blue-200 dark:border-blue-900',
          themeBg: 'bg-blue-50/80 dark:bg-blue-950/40',
          badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-300 border-blue-300 dark:border-blue-700',
          btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
          cropPosition: '0% 0%',
          containerHeight: 'h-24 sm:h-28'
        };
    }
  };

  const config = getRoleConfig();
  const imageSrc = '/workflows/workflow_full.png';

  return (
    <PanelErrorBoundary>
      {/* TOP RIGHT WORKFLOW REFERENCE PANEL */}
      <div className={`p-3 rounded-2xl border ${config.themeBorder} ${config.themeBg} shadow-xs flex flex-col justify-between space-y-2 w-full max-w-sm sm:max-w-md ml-auto shrink-0 relative overflow-hidden transition-all duration-200 hover:shadow-md`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${config.badgeBg} shrink-0`}>
              {config.badge}
            </span>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
              {config.title}
            </h4>
          </div>

          <button
            onClick={() => setIsExpanded(true)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer ${config.btnBg}`}
            title="Expand Full Workflow Diagram"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden xs:inline">Expand</span>
          </button>
        </div>

        {/* CROPPED REFERENCE IMAGE CONTAINER */}
        <div
          onClick={() => setIsExpanded(true)}
          className={`w-full ${config.containerHeight} rounded-xl overflow-hidden border border-slate-300/70 dark:border-slate-700 relative bg-white dark:bg-slate-900 cursor-pointer group shadow-inner`}
        >
          <img
            src={imageSrc}
            alt={config.title}
            onError={() => setImgError(true)}
            className="w-full h-[320%] max-w-none object-cover transition-transform duration-300 group-hover:scale-102"
            style={{
              objectPosition: config.cropPosition
            }}
          />
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Eye className="w-3 h-3" /> Click to View Full Workflow
            </span>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL FOR CLEAR READING */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* MODAL HEADER */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${config.badgeBg}`}>
                  {config.badge}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {config.title} (System Reference)
                </h3>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL IMAGE VIEWPORT */}
            <div className="p-4 sm:p-6 overflow-auto flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-950/80 min-h-[300px]">
              <img
                src={imageSrc}
                alt="Full Clinical Workflow System Guide"
                onError={() => setImgError(true)}
                className="max-w-full h-auto rounded-xl border border-slate-300 dark:border-slate-800 shadow-lg object-contain"
              />
            </div>

            {/* MODAL FOOTER */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Reference diagram for PharmDVerse operational workflow.</span>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </PanelErrorBoundary>
  );
};
