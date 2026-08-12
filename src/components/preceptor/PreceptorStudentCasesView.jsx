import React, { useState, useEffect } from 'react';
import { ArrowLeft, ClipboardList, Search, Filter, Eye, ChevronLeft, ChevronRight, Loader2, Stethoscope, HeartHandshake, ShieldAlert, FileSearch, AlertTriangle, User, GraduationCap, Building2, Download } from 'lucide-react';
import { fetchStudentCasesForPreceptorFromSupabase, fetchCaseModuleStatusesMapFromSupabase } from '../../services/supabaseService';
import { PreceptorReviewCaseView } from './PreceptorReviewCaseView';
import { OfficialClinicalCasePDFModal } from '../modals/OfficialClinicalCasePDFModal';

export const PreceptorStudentCasesView = ({ student, preceptor, initialFilter = 'All', onBack }) => {
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
    if (!student) return;
    setLoading(true);
    const res = await fetchStudentCasesForPreceptorFromSupabase(student.id);
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
  }, [student]);

  if (selectedCaseForReview) {
    return (
      <PreceptorReviewCaseView
        clinicalCase={selectedCaseForReview}
        student={student}
        preceptor={preceptor}
        onBack={() => setSelectedCaseForReview(null)}
        onReviewComplete={() => {
          setSelectedCaseForReview(null);
          loadCases();
        }}
      />
    );
  }

  // Filtered Cases
  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.case_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ward_unit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ip_op_type?.toLowerCase().includes(searchQuery.toLowerCase());

    const caseSt = c.status || c.overall_case_status || 'Draft';
    const matchesStatus = statusFilter === 'All' || caseSt === statusFilter;
    return matchesSearch && matchesStatus;
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
            title="Back to Assigned Students"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Student Clinical Cases</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clinical cases created by <strong className="text-slate-800 dark:text-slate-200">{student?.full_name}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* TOP STUDENT DETAILS CARD */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 border border-slate-800">
        <div className="flex items-center gap-4 pb-3 border-b border-slate-800">
          {student?.profile_photo_url ? (
            <img
              src={student.profile_photo_url}
              alt={student.full_name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500 shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-cyan-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
              {student?.full_name ? student.full_name.substring(0, 2).toUpperCase() : 'ST'}
            </div>
          )}

          <div>
            <h3 className="text-base font-extrabold text-white">{student?.full_name}</h3>
            <p className="text-xs text-cyan-300 font-mono font-bold">Roll Number: {student?.roll_number}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Course & Year</span>
            <strong className="font-bold text-white">{student?.course} • {student?.year}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Batch</span>
            <strong className="font-mono text-cyan-300 font-bold">Batch {student?.batch}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Assigned Hospital</span>
            <strong className="font-bold text-slate-200">{student?.colleges?.college_name || 'Teaching Hospital'}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Cases Created</span>
            <strong className="font-mono text-emerald-400 font-bold">{cases.length} Clinical Cases</strong>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Case ID, hospital, department..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['All', 'Submitted', 'Under Review', 'Returned', 'Approved'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE DIRECTORY */}
      {loading ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">Loading Student Clinical Cases...</p>
        </div>
      ) : paginatedCases.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <ClipboardList className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No clinical cases found.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'All'
              ? 'No cases matched your search query.'
              : 'This student has not created any clinical cases yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Case ID</th>
                  <th className="py-3.5 px-5">Hospital</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">IP/OP</th>
                  <th className="py-3.5 px-5">Admission Date</th>
                  <th className="py-3.5 px-5">Overall Status</th>
                  <th className="py-3.5 px-5">Clinical Documentation</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedCases.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-3.5 px-5 font-mono font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                      {c.case_id}
                    </td>

                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {c.hospital_name}
                    </td>

                    <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white uppercase block tracking-wide">{c.department}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">Unit : {c.ward_unit}</span>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        c.ip_op_type === 'IP' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {c.ip_op_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">
                      {c.date_of_admission}
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.status === 'Approved' || c.overall_case_status === 'Approved'
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

                    {/* CLINICAL DOCUMENTATION MODULE BUTTONS COLUMN */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5" title={`Profile – ${moduleStatuses[c.id]?.profileStatus || 'Not Started'}`}>
                          {renderModuleDot(moduleStatuses[c.id]?.profileStatus)}
                          <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Profile</span>
                        </span>

                        <span className="px-2 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] font-extrabold border border-teal-200 dark:border-teal-800 flex items-center gap-1.5" title={`Counselling – ${moduleStatuses[c.id]?.counsellingStatus || 'Not Started'}`}>
                          {renderModuleDot(moduleStatuses[c.id]?.counsellingStatus)}
                          <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                          <span>Counselling</span>
                        </span>

                        <span className="px-2 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5" title={`Intervention – ${moduleStatuses[c.id]?.interventionStatus || 'Not Added'}`}>
                          {renderModuleDot(moduleStatuses[c.id]?.interventionStatus)}
                          <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Intervention</span>
                        </span>

                        <span className="px-2 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-[10px] font-extrabold border border-cyan-200 dark:border-cyan-800 flex items-center gap-1.5" title={`Drug Information Request – ${moduleStatuses[c.id]?.dirStatus || 'Not Started'}`}>
                          {renderModuleDot(moduleStatuses[c.id]?.dirStatus)}
                          <FileSearch className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Drug Info</span>
                        </span>

                        <span className="px-2 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold border border-amber-200 dark:border-amber-800 flex items-center gap-1.5" title={`ADR Documentation – ${moduleStatuses[c.id]?.adrStatus || 'Not Started'}`}>
                          {renderModuleDot(moduleStatuses[c.id]?.adrStatus)}
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>ADR Log</span>
                        </span>
                      </div>
                    </td>

                    {/* ACTIONS COLUMN */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCaseForReview(c)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                          title="Review Complete Clinical Case"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{c.status === 'Approved' || c.overall_case_status === 'Approved' ? 'View Case' : 'Review Case'}</span>
                        </button>

                        {(c.status === 'Approved' || c.overall_case_status === 'Approved') && (
                          <button
                            onClick={() => setSelectedCaseForPDF(c)}
                            className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all"
                            title="Download Approved Official PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* OFFICIAL APPROVED PDF MODAL */}
      {selectedCaseForPDF && (
        <OfficialClinicalCasePDFModal
          isOpen={Boolean(selectedCaseForPDF)}
          onClose={() => setSelectedCaseForPDF(null)}
          clinicalCase={selectedCaseForPDF}
          student={student}
          preceptor={preceptor}
          college={student?.colleges}
        />
      )}
    </div>
  );
};
