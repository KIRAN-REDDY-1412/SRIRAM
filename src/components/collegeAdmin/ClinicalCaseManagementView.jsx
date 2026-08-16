import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, Eye, Download, ChevronLeft, ChevronRight, Loader2, Stethoscope, HeartHandshake, ShieldAlert, FileSearch, AlertTriangle, CheckCircle2, Clock, RotateCcw, Building2, User, GraduationCap, Trash2 } from 'lucide-react';
import { fetchAllCollegeClinicalCasesFromSupabase, fetchCaseModuleStatusesMapFromSupabase, deleteClinicalCaseFromSupabase } from '../../services/supabaseService';
import { OfficialClinicalCasePDFModal } from '../modals/OfficialClinicalCasePDFModal';
import { ModalWrapper } from '../modals/ModalWrapper';
import { PreceptorReviewCaseView } from '../preceptor/PreceptorReviewCaseView';

export const ClinicalCaseManagementView = ({ college, initialFilter = 'All' }) => {
  const [cases, setCases] = useState([]);
  const [moduleStatuses, setModuleStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [caseToDelete, setCaseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter || 'All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [hospitalFilter, setHospitalFilter] = useState('All');

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter);
    }
  }, [initialFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [selectedCaseForView, setSelectedCaseForView] = useState(null);
  const [activeTabInViewModal, setActiveTabInViewModal] = useState('profile');
  const [selectedCaseForPDF, setSelectedCaseForPDF] = useState(null);

  const loadCollegeCases = async () => {
    if (!college?.id) return;
    setLoading(true);
    const res = await fetchAllCollegeClinicalCasesFromSupabase(college.id);
    if (res.success) {
      const fetchedCases = res.data || [];
      setCases(fetchedCases);

      const caseIds = fetchedCases.map(c => c.id);
      const statusesRes = await fetchCaseModuleStatusesMapFromSupabase(caseIds);
      if (statusesRes.success) {
        setModuleStatuses(statusesRes.statusesMap || {});
      }
    } else {
      setCases([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCollegeCases();
  }, [college?.id]);

  // Derived Statistics
  const getEffSt = (c) => c?.status || c?.overall_case_status || 'Draft';
  const totalCount = cases.length;
  const draftCount = cases.filter(c => getEffSt(c) === 'Draft').length;
  const submittedCount = cases.filter(c => getEffSt(c) === 'Submitted').length;
  const underReviewCount = cases.filter(c => getEffSt(c) === 'Under Review').length;
  const returnedCount = cases.filter(c => getEffSt(c) === 'Returned').length;
  const approvedCount = cases.filter(c => getEffSt(c) === 'Approved').length;

  const departmentsList = Array.from(new Set(cases.map(c => c.department).filter(Boolean)));
  const hospitalsList = Array.from(new Set(cases.map(c => c.hospital_name).filter(Boolean)));

  // Filtered Cases
  const filteredCases = cases.filter(c => {
    const student = c.students || {};
    const preceptor = c.preceptors || {};

    const matchesSearch =
      c.case_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preceptor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const caseSt = getEffSt(c);
    if (caseSt === 'Draft') return false;
    const matchesStatus = statusFilter === 'All' || caseSt === statusFilter;
    const matchesDept = departmentFilter === 'All' || c.department === departmentFilter;
    const matchesHosp = hospitalFilter === 'All' || c.hospital_name === hospitalFilter;

    return matchesSearch && matchesStatus && matchesDept && matchesHosp;
  });

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage) || 1;
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderModuleDot = (statusStr) => {
    if (statusStr === 'Completed' || statusStr === 'Approved' || statusStr === 'Submitted' || statusStr === 'Reviewed') {
      return <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Completed" />;
    }
    if (statusStr === 'Returned') {
      return <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Returned" />;
    }
    if (statusStr === 'Draft') {
      return <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Draft" />;
    }
    return <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" title="Not Started" />;
  };

  if (selectedCaseForView) {
    return (
      <PreceptorReviewCaseView
        clinicalCase={selectedCaseForView}
        student={selectedCaseForView.students}
        preceptor={selectedCaseForView.preceptors}
        readOnly={true}
        onBack={() => setSelectedCaseForView(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* HEADER */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Clinical Case Management</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor and manage all Clinical Cases submitted within <strong className="text-slate-800 dark:text-slate-200">{college?.college_name || 'the college'}</strong>.
        </p>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Approved Cases</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{approvedCount}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Officially certified clinical records</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center shadow-xs animate-pulse">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Case ID, student name, roll..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end text-xs">

          {departmentsList.length > 0 && (
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
            >
              <option value="All">All Departments</option>
              {departmentsList.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* TABLE DIRECTORY */}
      {loading ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">Loading College Clinical Cases...</p>
        </div>
      ) : paginatedCases.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <ClipboardList className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No clinical cases found.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            No clinical cases matched your search filters.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Case ID</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Roll Number</th>
                  <th className="py-3.5 px-4">Final Diagnosis</th>
                  <th className="py-3.5 px-4">Submission Date</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedCases.map((c) => {
                  const student = c.students || {};
                  const isApproved = c.status === 'Approved' || c.overall_case_status === 'Approved';

                  return (
                    <tr key={c.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {c.case_id || `#${c.id?.substring(0, 8)}`}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {student.full_name || c.student_name || '—'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {student.roll_number || c.roll_number || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-semibold max-w-[220px] truncate" title={c.final_diagnosis || moduleStatuses[c.id]?.finalDiagnosis || '—'}>
                        {c.final_diagnosis || moduleStatuses[c.id]?.finalDiagnosis || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : (c.created_at ? new Date(c.created_at).toLocaleDateString() : '—')}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isApproved
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                            : c.status === 'Returned' || c.overall_case_status === 'Returned'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                            : c.status === 'Submitted' || c.overall_case_status === 'Submitted'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                        }`}>
                          {c.overall_case_status || c.status || 'Draft'}
                        </span>
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCaseForView(c)}
                            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                            title="View Clinical Case Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Case</span>
                          </button>

                          {isApproved && (
                            <button
                              onClick={() => setSelectedCaseForPDF(c)}
                              className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all"
                              title="Download Approved Official PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setCaseToDelete(c)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:hover:bg-rose-900 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all"
                            title="Permanently Delete Clinical Case"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-800 dark:text-slate-200">{paginatedCases.length}</strong> of <strong className="text-slate-800 dark:text-slate-200">{filteredCases.length}</strong> cases
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800 dark:text-slate-200 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}



      {/* OFFICIAL PDF DOWNLOAD MODAL */}
      {selectedCaseForPDF && (
        <OfficialClinicalCasePDFModal
          isOpen={Boolean(selectedCaseForPDF)}
          onClose={() => setSelectedCaseForPDF(null)}
          clinicalCase={selectedCaseForPDF}
          student={selectedCaseForPDF.students}
          preceptor={selectedCaseForPDF.preceptors}
          college={college}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {caseToDelete && (
        <ModalWrapper
          isOpen={Boolean(caseToDelete)}
          onClose={() => setCaseToDelete(null)}
          title={`Delete Clinical Case ${caseToDelete.case_id}`}
          subtitle="Permanent Database Deletion"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-sm mb-0.5">Warning: Irreversible Action</strong>
                Are you sure you want to permanently delete Clinical Case <strong>{caseToDelete.case_id}</strong>? This will permanently erase all patient profiles, counselling records, interventions, drug queries, and ADR reports from the database.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCaseToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  const res = await deleteClinicalCaseFromSupabase(caseToDelete.id);
                  setDeleting(false);
                  if (res.success) {
                    setCaseToDelete(null);
                    loadCollegeCases();
                  } else {
                    alert(res.error || 'Failed to delete clinical case.');
                  }
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{deleting ? 'Deleting...' : 'Delete Case'}</span>
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};
