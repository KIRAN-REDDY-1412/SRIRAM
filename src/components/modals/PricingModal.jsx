import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { pricingPlans } from '../../data/pricingData';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const PricingModal = ({ isOpen, onClose, onSelectPlanToRegister }) => {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="PharmDVerse Institutional Pricing"
      subtitle="Transparent annual licensing tailored for pharmacy colleges and institutions"
      maxWidth="max-w-5xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-2">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col justify-between p-6 rounded-2xl border ${
              plan.isPopular
                ? 'border-emerald-500/80 dark:border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-lg ring-1 ring-emerald-500/30'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
            } transition-all duration-200 hover:shadow-xl`}
          >
            {plan.isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-semibold uppercase tracking-wider rounded-full shadow-md">
                {plan.badge}
              </span>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                {!plan.isPopular && (
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                    {plan.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 min-h-[32px]">
                {plan.tagline}
              </p>

              {/* Price & Student Limit */}
              <div className="py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-5 border border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{plan.period}</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {plan.studentLimit}
                </div>
              </div>

              {/* Feature List */}
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 mb-6">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                onClose();
                onSelectPlanToRegister(plan.name);
              }}
              className={`w-full py-3 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                plan.isPopular
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
              }`}
            >
              <span>{plan.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p className="text-sky-800 dark:text-sky-300">
          Need a custom deployment for multi-state university networks or hospital attachments?
        </p>
        <button
          onClick={() => {
            onClose();
            onSelectPlanToRegister('Enterprise Custom');
          }}
          className="whitespace-nowrap px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
        >
          Contact Enterprise Sales
        </button>
      </div>
    </ModalWrapper>
  );
};
