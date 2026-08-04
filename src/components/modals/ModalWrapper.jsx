import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const ModalWrapper = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  maxWidth = "max-w-2xl",
  customHeader = null,
  rounded = "rounded-3xl",
  hideDefaultHeader = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Glassmorphism Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xl transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Card Shell */}
      <div className={`relative w-full ${maxWidth} bg-white dark:bg-[#0f172a] ${rounded} shadow-2xl border border-slate-200/80 dark:border-slate-800/80 z-10 overflow-hidden transform transition-all animate-scaleUp my-auto max-h-[92vh] flex flex-col`}>
        
        {/* Custom or Default Header */}
        {!hideDefaultHeader && (
          customHeader ? (
            customHeader
          ) : (
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h3>
                {subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(92vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};
