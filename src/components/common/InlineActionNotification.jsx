import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const InlineActionNotification = ({ notification, onClose, position = 'bottom-right' }) => {
  if (!notification || !notification.message) return null;

  const { type = 'info', message } = notification;

  let bgClasses = 'bg-slate-900 text-white border-slate-700 dark:bg-slate-800 dark:border-slate-700';
  let Icon = Info;
  let iconColor = 'text-indigo-400';

  if (type === 'success') {
    bgClasses = 'bg-emerald-50 text-emerald-950 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800 shadow-emerald-500/10';
    Icon = CheckCircle2;
    iconColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (type === 'warning') {
    bgClasses = 'bg-amber-50 text-amber-950 border-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800 shadow-amber-500/10';
    Icon = AlertTriangle;
    iconColor = 'text-amber-600 dark:text-amber-400';
  } else if (type === 'error') {
    bgClasses = 'bg-rose-50 text-rose-950 border-rose-200 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-800 shadow-rose-500/10';
    Icon = XCircle;
    iconColor = 'text-rose-600 dark:text-rose-400';
  } else if (type === 'info') {
    bgClasses = 'bg-indigo-50 text-indigo-950 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-100 dark:border-indigo-800 shadow-indigo-500/10';
    Icon = Info;
    iconColor = 'text-indigo-600 dark:text-indigo-400';
  }

  let positionClasses = 'top-full mt-2 right-0';
  if (position === 'bottom-left') positionClasses = 'top-full mt-2 left-0';
  if (position === 'bottom-center') positionClasses = 'top-full mt-2 left-1/2 -translate-x-1/2';
  if (position === 'top-right') positionClasses = 'bottom-full mb-2 right-0';
  if (position === 'top-left') positionClasses = 'bottom-full mb-2 left-0';
  if (position === 'top-center') positionClasses = 'bottom-full mb-2 left-1/2 -translate-x-1/2';
  if (position === 'inline') positionClasses = 'relative mt-2';

  return (
    <div className={`absolute z-50 min-w-[240px] max-w-[340px] p-3 rounded-2xl border shadow-xl flex items-start gap-2.5 text-xs font-semibold backdrop-blur-md animate-fadeIn transition-all transform origin-top ${bgClasses} ${positionClasses}`}>
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 leading-snug break-words pr-1">{message}</div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
