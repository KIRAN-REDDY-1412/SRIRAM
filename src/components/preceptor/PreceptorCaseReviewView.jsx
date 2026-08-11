import React, { useState, useEffect } from 'react';
import { FolderKanban, Search, Filter, Eye, ChevronLeft, ChevronRight, Loader2, Download, Stethoscope, CheckCircle2, Clock, RotateCcw, Send, FileSearch, FileText } from 'lucide-react';
import { fetchAllPreceptorCasesFromSupabase, fetchCaseModuleStatusesMapFromSupabase, startReviewingCaseInSupabase } from '../../services/supabaseService';
import { PreceptorReviewCaseView } from './PreceptorReviewCaseView';
import { OfficialClinicalCasePDFModal } from '../modals/OfficialClinicalCasePDFModal';

export const PreceptorCaseReviewView = ({ preceptor, initialFilter = 'All' }) => {
  const [cases, setCases] = useState([]);
  const [moduleStatuses, setModuleStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCaseForPDF, setSelectedCaseForPDF] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter || 'All');

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter);
    }
  }, [initialFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected case for review
  const [selectedCaseForReview, setSelectedCaseForReview] = useState(null);

  const loadCases = async () => {
    if (!preceptor?.id) return;
    setLoading(true);
    const res = await fetchAllPreceptorCasesFromSupabase(preceptor.id);
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
    loadCases();
  }, [preceptor?.id]);

  if (selectedCaseForReview) {
    return (
      <PreceptorReviewCaseView
        clinicalCase={selectedCaseForReview}
        student={selectedCaseForReview.students}
        preceptor={preceptor}
        onBack={() => setSelectedCaseForReview(null)}
        onReviewComplete={() => {
          setSelectedCaseForReview(null);
          loadCases();
        }}
      />
    );
  }

  const handleOpenReview = async (caseItem) => {
    if (!caseItem) return;
    if (caseItem.status === 'Submitted') {
      const res = await startReviewingCaseInSupabase(caseItem.id, preceptor?.id);
      if (res.success && res.data) {
        caseItem = { ...caseItem, ...res.data, status: 'Under Review' };
      } else {
        caseItem = { ...caseItem, status: 'Under Review' };
      }
      setCases(prev => prev.map(c => c.id === caseItem.id ? { ...c, status: 'Under Review' } : c));
    }
    setSelectedCaseForReview(caseItem);
  };

  // Filtered Cases — EXCLUDE DRAFT CASES ENTIRELY FROM PRECEPTOR REVIEW QUEUE
  const filteredCases = cases.filter(c => {
    const caseStatus = c.status || 'Submitted';
    if (caseStatus === 'Draft') return false;

    const student = c.students || {};
    const matchesSearch =
      c.case_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'All' || statusFilter === 'All Cases') {
      matchesStatus = true;
    } else if (statusFilter === 'Pending Review') {
      matchesStatus = caseStatus === 'Submitted' || caseStatus === 'Under Review';
    } else {
      matchesStatus = caseStatus === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage) || 1;
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (statusStr) => {
    switch (statusStr) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Approved
          </span>
        );
      case 'Returned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <RotateCcw className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Returned
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <FileSearch className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Under Review
          </span>
        );
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Send className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Submitted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {statusStr || 'Draft'}
          </span>
        );
    }
  };

  const filterTabs = [
    { label: 'All Cases', value: 'All' },
    { label: 'Submitted', value: 'Submitted' },
    { label: 'Under Review', value: 'Under Review' },
    { label: 'Returned', value: 'Returned' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Pending Review', value: 'Pending Review' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* HEADER */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <span>Clinical Case Review</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review, evaluate, and approve clinical cases submitted by candidates under your supervision.
        </p>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search case ID, student name, roll number..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-full lg:w-auto overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE DATA */}
      {loading ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">Loading Clinical Cases...</p>
        </div>
      ) : paginatedCases.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <FolderKanban className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No clinical cases found.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'All'
              ? 'No clinical cases matched your filter criteria.'
              : 'None of your assigned students have submitted cases for review yet.'}
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
                  <th className="py-3.5 px-4">Hospital</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Admission Type</th>
                  <th className="py-3.5 px-4">Submission Date</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedCases.map((c) => {
                  const student = c.students || {};
                  const caseStatus = c.status || c.overall_case_status || 'Draft';
                  const isApproved = caseStatus === 'Approved';

                  return (
                    <tr key={c.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {c.case_id || `#${c.id?.substring(0, 8)}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {student.full_name || 'Student'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {student.roll_number || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {c.hospital_name || 'General Hospital'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {c.department || 'General Medicine'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {c.admission_type || 'IP'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : (c.created_at ? new Date(c.created_at).toLocaleDateString() : '—')}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(caseStatus)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReview(c)}
                            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                            title={isApproved ? "View Approved Case" : "Review Clinical Case"}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isApproved ? 'View Case' : caseStatus === 'Under Review' ? 'Continue Review' : caseStatus === 'Returned' ? 'View Case' : 'Review Case'}</span>
                          </button>

                          {isApproved && (
                            <button
                              onClick={() => setSelectedCaseForPDF(c)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1 transition-all"
                              title="Download Approved Official PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">PDF</span>
                            </button>
                          )}
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
              Showing <strong className="text-slate-800 dark:text-slate-200">{paginatedCases.length}</strong> of <strong className="text-slate-800 dark:text-slate-200">{filteredCases.length}</strong> clinical cases
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PDF MODAL */}
      {selectedCaseForPDF && (
        <OfficialClinicalCasePDFModal
          clinicalCase={selectedCaseForPDF}
          onClose={() => setSelectedCaseForPDF(null)}
        />
      )}
    </div>
  );
};
