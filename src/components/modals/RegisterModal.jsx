import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useColleges } from '../../context/CollegeContext';
import { Building2, MapPin, Mail, User, Phone, CheckCircle2, AlertCircle, ArrowRight, X, Sparkles } from 'lucide-react';

export const RegisterModal = ({ isOpen, onClose }) => {
  const { submitRegistration } = useColleges();

  const [formData, setFormData] = useState({
    collegeName: '',
    city: '',
    state: '',
    contactName: '',
    mobileNumber: '',
    email: ''
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));

    // Real-time validation update
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (duplicateError) setDuplicateError('');
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Helper function to determine input status state: 'error' | 'success' | 'default'
  const getInputStatus = (fieldName) => {
    if (errors[fieldName]) return 'error';
    if (touched[fieldName] && formData[fieldName].trim().length > 0) {
      if (fieldName === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(formData[fieldName].trim()) ? 'success' : 'error';
      }
      if (fieldName === 'mobileNumber') {
        const mobileClean = formData[fieldName].replace(/\D/g, '');
        return mobileClean.length >= 10 ? 'success' : 'error';
      }
      return 'success';
    }
    return 'default';
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'College name is mandatory.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is mandatory.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is mandatory.';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact person name is mandatory.';
    }

    const mobileClean = formData.mobileNumber.replace(/\D/g, '');
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is mandatory.';
    } else if (mobileClean.length < 10) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is mandatory.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email format (name@college.edu).';
    }

    setErrors(newErrors);
    setTouched({
      collegeName: true,
      city: true,
      state: true,
      contactName: true,
      mobileNumber: true,
      email: true
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const result = submitRegistration(formData);
      setIsSubmitting(false);

      if (result.success) {
        setSubmitted(true);
      } else {
        setDuplicateError(result.error);
      }
    }, 450);
  };

  const handleClose = () => {
    setSubmitted(false);
    setErrors({});
    setTouched({});
    setDuplicateError('');
    setFormData({
      collegeName: '',
      city: '',
      state: '',
      contactName: '',
      mobileNumber: '',
      email: ''
    });
    onClose();
  };

  // Helper CSS for input border based on validation state
  const getInputBorderClass = (status) => {
    if (status === 'error') {
      return 'border-rose-500 ring-2 ring-rose-500/15 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-white';
    }
    if (status === 'success') {
      return 'border-[#10B981] ring-2 ring-[#10B981]/15 bg-emerald-50/20 dark:bg-emerald-950/20 text-slate-900 dark:text-white';
    }
    return 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-600/15';
  };

  // Custom Header matching Stripe/Vercel/Linear design
  const headerComponent = (
    <div className="flex items-start justify-between px-7 sm:px-8 pt-7 pb-5 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-b from-slate-50/80 to-transparent dark:from-slate-900/50">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 shrink-0 transform -rotate-1">
          <Building2 className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Register Your College
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Join PharmDVerse and submit your college registration for approval.
          </p>
        </div>
      </div>

      <button
        onClick={handleClose}
        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        aria-label="Close dialog"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="max-w-[720px] w-[90vw] md:w-[720px]"
      rounded="rounded-3xl"
      customHeader={headerComponent}
    >
      {submitted ? (
        /* SUCCESS SCREEN */
        <div className="py-10 px-4 text-center animate-fadeIn space-y-5">
          
          {/* Animated Green Checkmark Badge */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 transform transition-transform hover:scale-105">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Registration Submitted Successfully!
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed font-normal">
              Thank you for registering with PharmDVerse.<br />
              Your request has been sent to the Super Admin for review.<br />
              You will receive an email once your college is approved.
            </p>
          </div>

          {/* Close Button */}
          <div className="pt-4">
            <button
              onClick={handleClose}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-bold text-xs rounded-[14px] shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        /* REGISTRATION FORM */
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {duplicateError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold">{duplicateError}</span>
            </div>
          )}

          {/* SECTION 1: COLLEGE DETAILS */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-xs transform transition-all hover:border-slate-300 dark:hover:border-slate-700">
            
            <div className="flex items-center gap-2.5 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
              <span className="text-lg">🏛</span>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                College Details
              </h4>
            </div>

            {/* College Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                College Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('collegeName')}
                  placeholder="Enter college name"
                  className={`w-full h-[52px] pl-10 pr-4 text-xs rounded-[14px] border ${getInputBorderClass(getInputStatus('collegeName'))} placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-200`}
                />
              </div>
              {errors.collegeName && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.collegeName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  City *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={() => handleBlur('city')}
                    placeholder="Enter city"
                    className={`w-full h-[52px] pl-10 pr-4 text-xs rounded-[14px] border ${getInputBorderClass(getInputStatus('city'))} placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-200`}
                  />
                </div>
                {errors.city && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.city}</p>
                )}
              </div>

              {/* State Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  State *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    onBlur={() => handleBlur('state')}
                    placeholder="Enter state"
                    className={`w-full h-[52px] pl-10 pr-4 text-xs rounded-[14px] border ${getInputBorderClass(getInputStatus('state'))} placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-200`}
                  />
                </div>
                {errors.state && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.state}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT PERSON */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-xs transform transition-all hover:border-slate-300 dark:hover:border-slate-700">
            
            <div className="flex items-center gap-2.5 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
              <span className="text-lg">👤</span>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Contact Person
              </h4>
            </div>

            {/* Contact Person Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Contact Person Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('contactName')}
                  placeholder="Enter full name"
                  className={`w-full h-[52px] pl-10 pr-4 text-xs rounded-[14px] border ${getInputBorderClass(getInputStatus('contactName'))} placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-200`}
                />
              </div>
              {errors.contactName && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.contactName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mobile Number Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    onBlur={() => handleBlur('mobileNumber')}
                    placeholder="Enter 10-digit mobile number"
                    className={`w-full h-[52px] pl-10 pr-4 text-xs rounded-[14px] border ${getInputBorderClass(getInputStatus('mobileNumber'))} placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-200`}
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.mobileNumber}</p>
                )}
              </div>

              {/* Email Address Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="Enter official email address"
                    className={`w-full h-[52px] pl-10 pr-4 text-xs rounded-[14px] border ${getInputBorderClass(getInputStatus('email'))} placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-200`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-3">
            
            {/* Secondary Button: Cancel */}
            <button
              type="button"
              onClick={handleClose}
              className="h-[48px] px-6 rounded-[14px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-xs"
            >
              Cancel
            </button>

            {/* Primary Button: Submit Registration (Blue -> Emerald Gradient) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[48px] px-7 rounded-[14px] bg-gradient-to-r from-blue-600 via-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white text-xs font-extrabold flex items-center gap-2.5 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <span>Submit Registration</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>

        </form>
      )}
    </ModalWrapper>
  );
};
