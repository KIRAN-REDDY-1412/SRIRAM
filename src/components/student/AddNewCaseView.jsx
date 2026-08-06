import React, { useState, useEffect } from 'react';
import { FilePlus2, User, GraduationCap, Building2, Stethoscope, Calendar, Save, X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { fetchStudentAssignedPreceptorFromSupabase, generateUniqueCaseIdInSupabase, insertClinicalCaseToSupabase } from '../../services/supabaseService';

export const AddNewCaseView = ({ student, onCancel, onSuccess }) => {
  const [caseId, setCaseId] = useState('');
  const [assignedPreceptor, setAssignedPreceptor] = useState(null);

  // Form Input States
  const [hospitalName, setHospitalName] = useState('');
  const [department, setDepartment] = useState('');
  const [wardUnit, setWardUnit] = useState('');
  const [ipOpType, setIpOpType] = useState('IP');
  const [dateOfAdmission, setDateOfAdmission] = useState(new Date().toISOString().split('T')[0]);
  const [dateOfCollection, setDateOfCollection] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Draft');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const initializeForm = async () => {
      if (!student) return;
      setLoading(true);

      const collegeCode = student.colleges?.college_code || 'AMRMCP';

      const [genIdRes, precRes] = await Promise.all([
        generateUniqueCaseIdInSupabase(collegeCode),
        fetchStudentAssignedPreceptorFromSupabase(student.id)
      ]);

      if (genIdRes.success) setCaseId(genIdRes.caseId);
      if (precRes.success && precRes.data) setAssignedPreceptor(precRes.data);

      setLoading(false);
    };

    initializeForm();
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!hospitalName.trim() || !department.trim() || !wardUnit.trim() || !dateOfAdmission) {
      setFormError('Please fill in all required clinical case details.');
      return;
    }

    setSaving(true);
    const res = await insertClinicalCaseToSupabase({
      caseId,
      collegeId: student.college_id,
      studentId: student.id,
      preceptorId: assignedPreceptor ? assignedPreceptor.id : null,
      hospitalName: hospitalName.trim(),
      department: department.trim(),
      wardUnit: wardUnit.trim(),
      ipOpType,
      dateOfAdmission,
      dateOfCollection: dateOfAdmission,
      academicYear: student.academic_year || '2026–2027',
      status
    });
    setSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        if (onSuccess) onSuccess();
      }, 1200);
    } else {
      setFormError(res.error || 'Failed to save clinical case record.');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-500">Generating Unique Case ID & Loading Credentials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FilePlus2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Add New Clinical Patient Case</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Initiate a new Pharm.D clinical case logbook entry for hospital ward rounds.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Clinical Case created successfully! Redirecting to My Cases...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* AUTO-GENERATED CASE ID & READ-ONLY STUDENT DETAILS */}
        <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Auto-Generated Case Identifier</span>
              <h3 className="text-xl font-black font-mono tracking-tight text-white">{caseId}</h3>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Draft Case Entry
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-medium block">Student Name</span>
              <strong className="font-bold text-white">{student?.full_name}</strong>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-400 font-medium block">Roll Number</span>
              <strong className="font-mono font-bold text-emerald-300">{student?.roll_number}</strong>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-400 font-medium block">College</span>
              <strong className="font-bold text-white truncate block">{student?.colleges?.college_name || 'Pharmacy College'}</strong>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-400 font-medium block">Assigned Preceptor</span>
              <strong className="font-bold text-cyan-300">{assignedPreceptor ? assignedPreceptor.full_name : 'Unassigned'}</strong>
            </div>
          </div>
        </div>

        {/* CLINICAL CASE ENTRY FIELDS */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Hospital & Clinical Ward Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Hospital Name *
              </label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="Enter hospital name (e.g. Govt General Hospital)"
                className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Department *
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Enter department (e.g. General Medicine, Cardiology)"
                className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ward / Unit *
              </label>
              <input
                type="text"
                required
                value={wardUnit}
                onChange={(e) => setWardUnit(e.target.value)}
                placeholder="Enter ward / unit (e.g. Male Medical Ward 3, ICU-2)"
                className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                IP / OP Category *
              </label>
              <select
                value={ipOpType}
                onChange={(e) => setIpOpType(e.target.value)}
                className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none font-bold"
              >
                <option value="IP">In-Patient (IP)</option>
                <option value="OP">Out-Patient (OP)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date of Admission *
              </label>
              <input
                type="date"
                required
                value={dateOfAdmission}
                onChange={(e) => setDateOfAdmission(e.target.value)}
                className="w-full h-[46px] px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="h-[48px] px-6 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="h-[48px] px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Case Record...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Draft Case</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
