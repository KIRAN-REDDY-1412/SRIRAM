import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { ShieldCheck, CheckCircle2, BookOpen, FileText, HelpCircle, Info, Sparkles } from 'lucide-react';

export const InfoModal = ({ isOpen, onClose, contentType }) => {
  if (!contentType) return null;

  const contentMap = {
    about: {
      title: "About PharmDVerse",
      subtitle: "The Premier Clinical ERP Built Exclusively for PharmD & Pharmacy Colleges",
      icon: Info,
      body: (
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            <strong>PharmDVerse</strong> was engineered from the ground up to solve the unique challenges faced by PharmD colleges, clinical preceptors, and pharmacy students across India and internationally.
          </p>
          <p>
            Traditional paper logbooks, unverified clinical case sheets, and fragmented hospital preceptor communication result in compliance risks and administrative burdens. PharmDVerse digitizes case collection, ward round documentation, ADR monitoring, drug interaction analysis, and preceptor sign-offs into one seamless cloud platform.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white mb-1">Our Mission</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Transforming pharmacy case collection into evidence-based clinical excellence.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white mb-1">AI-Ready Architecture</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Integrated clinical decision support and automatic drug-interaction checking.</p>
            </div>
          </div>
        </div>
      )
    },
    features: {
      title: "PharmDVerse Platform Features",
      subtitle: "End-to-end ERP capabilities designed for clinical pharmacy education",
      icon: Sparkles,
      body: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          {[
            { title: "Digital Clinical Case Repository", desc: "Collect and structure PharmD case presentations, SOAP notes, ward round logs, and patient profiles securely." },
            { title: "Hospital & Preceptor Portal", desc: "Doctors and clinical preceptors can review, annotate, and approve student cases remotely with digital signatures." },
            { title: "ADR Reporting & Pharmacovigilance Module", desc: "Standardized Adverse Drug Reaction reporting templates aligned with national pharmacovigilance guidelines." },
            { title: "NAAC & NIRF Accreditation Reports", desc: "Automated institutional audit reports, attendance tracking, and clinical case publication metrics with 1-click export." },
            { title: "Multi-College Administration", desc: "Manage multiple hospital attachments, clinical rotations, and student batches across departments." }
          ].map((feat, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white block font-semibold">{feat.title}</strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{feat.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    help: {
      title: "PharmDVerse Help Center",
      subtitle: "Support resources, system guides, and institutional onboarding help",
      icon: HelpCircle,
      body: (
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50">
            <h5 className="font-bold text-slate-900 dark:text-white mb-1">Need Immediate Onboarding Assistance?</h5>
            <p className="text-slate-600 dark:text-slate-300">
              Our dedicated technical support engineers are available Monday through Saturday (9 AM - 7 PM IST) to assist with preceptor account setup, CSV student imports, and sub-domain configuration.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-slate-900 dark:text-white">Popular Help Articles:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
              <li>How to configure multi-hospital clinical rotations for PharmD 5th & 6th Year students</li>
              <li>Setting up preceptor OTP authentication for case sign-offs</li>
              <li>Exporting NAAC Criterion 1 & 3 reports in Excel format</li>
            </ul>
          </div>
        </div>
      )
    },
    privacy: {
      title: "Privacy Policy",
      subtitle: "Institutional Data Encryption & Privacy Standards (Updated 2026)",
      icon: ShieldCheck,
      body: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            PharmDVerse is committed to protecting student records, patient case data, and institutional intellectual property. All patient health information (PHI) within case presentations must be anonymized prior to submission.
          </p>
          <p>
            We enforce AES-256 bit encryption at rest and TLS 1.3 encryption in transit. Institutional data is hosted on dedicated cloud servers compliant with ISO 27001 data protection standards.
          </p>
        </div>
      )
    },
    terms: {
      title: "Terms & Conditions",
      subtitle: "Institutional Service Level Agreement & Usage Guidelines",
      icon: FileText,
      body: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            By subscribing to PharmDVerse, institutions receive an exclusive non-transferable license to access the PharmDVerse ERP cloud infrastructure for the duration of their active annual contract.
          </p>
          <p>
            Subscribed colleges are provided a 99.9% uptime SLA, daily automated off-site backups, and dedicated administrative support.
          </p>
        </div>
      )
    }
  };

  const current = contentMap[contentType] || contentMap.about;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={current.title}
      subtitle={current.subtitle}
      maxWidth="max-w-xl"
    >
      {current.body}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-medium"
        >
          Close Window
        </button>
      </div>
    </ModalWrapper>
  );
};
