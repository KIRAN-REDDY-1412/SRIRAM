import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, Eye, Download, ChevronLeft, ChevronRight, Loader2, Stethoscope, HeartHandshake, ShieldAlert, FileSearch, AlertTriangle, CheckCircle2, Clock, RotateCcw, Building2, User, GraduationCap } from 'lucide-react';
import { fetchCollegeClinicalCasesFromSupabase, fetchCaseModuleStatusesMapFromSupabase } from '../../services/supabaseService';
import { OfficialClinicalCasePDFModal } from '../modals/OfficialClinicalCasePDFModal';
import { ModalWrapper } from '../modals/ModalWrapper';
import { PatientProfileFormView } from '../patientProfile/PatientProfileFormView';
import { PatientCounsellingFormView } from '../patientCounselling/PatientCounsellingFormView';
import { PharmacistInterventionFormView } from '../pharmacistIntervention/PharmacistInterventionFormView';
import { DrugInformationFormView } from '../drugInformationRequest/DrugInformationFormView';
import { ADRDocumentationFormView } from '../adrDocumentation/ADRDocumentationFormView';

export const ClinicalCaseManagementView = ({ college }) => {
  const [cases, setCases] = useState([]);
  const [moduleStatuses, setModuleStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [hospitalFilter, setHospitalFilter] = useState('All');

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
    const res = await fetchCollegeClinicalCasesFromSupabase(college.id);
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
  const totalCount = cases.length;
  const draftCount = cases.filter(c => c.status === 'Draft' || c.overall_case_status === 'Draft').length;
  const submittedCount = cases.filter(c => c.status === 'Submitted' || c.overall_case_status === 'Submitted').length;
  const underReviewCount = cases.filter(c => c.status === 'Under Review' || c.overall_case_status === 'Under Review').length;
  const returnedCount = cases.filter(c => c.status === 'Returned' || c.overall_case_status === 'Returned').length;
  const approvedCount = cases.filter(c => c.status === 'Approved' || c.overall_case_status === 'Approved').length;

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

    const caseSt = c.overall_case_status || c.status || 'Draft';
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
    if (statusStr === 'Completed' || statusStr === 'Approved') {
      return <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Completed" />;
    }
    if (statusStr === 'Submitted' || statusStr === 'Under Review') {
      return <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Under Review" />;
    }
    if (statusStr === 'Returned') {
      return <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Returned" />;
    }
    if (statusStr === 'Draft') {
      return <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Draft" />;
    }
    return <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" title="Not Started / Not Added" />;
  };

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Cases</span>
          <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</h4>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-amber-500">Draft</span>
          <h4 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{draftCount}</h4>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-blue-500">Submitted</span>
          <h4 className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{submittedCount}</h4>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-cyan-500">Under Review</span>
          <h4 className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{underReviewCount}</h4>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-rose-500">Returned</span>
          <h4 className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{returnedCount}</h4>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-emerald-500">Approved</span>
          <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{approvedCount}</h4>
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
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved Only</option>
            <option value="Submitted">Submitted Only</option>
            <option value="Under Review">Under Review</option>
            <option value="Returned">Returned</option>
            <option value="Draft">Draft</option>
          </select>

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
                  <th className="py-3.5 px-5">Case ID</th>
                  <th className="py-3.5 px-5">Student Name</th>
                  <th className="py-3.5 px-5">Roll Number</th>
                  <th className="py-3.5 px-5">Assigned Preceptor</th>
                  <th className="py-3.5 px-5">Hospital</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Admission Date</th>
                  <th className="py-3.5 px-5">Overall Status</th>
                  <th className="py-3.5 px-5">Clinical Documentation</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedCases.map((c) => {
                  const student = c.students || {};
                  const preceptor = c.preceptors || {};
                  const isApproved = c.status === 'Approved' || c.overall_case_status === 'Approved';

                  return (
                    <tr key={c.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-5 font-mono font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        {c.case_id}
                      </td>

                      <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {student.full_name || '—'}
                      </td>

                      <td className="py-3.5 px-5 font-mono font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                        {student.roll_number || '—'}
                      </td>

                      <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {preceptor.full_name || c.assigned_preceptor_name || 'Unassigned'}
                      </td>

                      <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {c.hospital_name}
                      </td>

                      <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-white uppercase block tracking-wide">{c.department}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">Unit : {c.ward_unit}</span>
                      </td>

                      <td className="py-3.5 px-5 font-mono text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">
                        {c.date_of_admission}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
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
                            onClick={() => setSelectedCaseForView(c)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Clinical Case (Read Only)"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isApproved && (
                            <button
                              onClick={() => setSelectedCaseForPDF(c)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs transition-all"
                              title="Download Approved Official PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Approved PDF</span>
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

      {/* VIEW READ-ONLY CLINICAL CASE MODAL */}
      {selectedCaseForView && (
        <ModalWrapper
          isOpen={Boolean(selectedCaseForView)}
          onClose={() => setSelectedCaseForView(null)}
          title={`Clinical Case ${selectedCaseForView.case_id}`}
          subtitle={`Candidate: ${selectedCaseForView.students?.full_name || 'Student'} • Status: ${selectedCaseForView.overall_case_status || selectedCaseForView.status}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4 text-xs">
            {/* TABS */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
              {['profile', 'counselling', 'intervention', 'dir', 'adr'].map((tb) => (
                <button
                  key={tb}
                  onClick={() => setActiveTabInViewModal(tb)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold capitalize transition-all ${
                    activeTabInViewModal === tb
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tb === 'profile' ? 'Patient Profile' : tb === 'counselling' ? 'Patient Counselling' : tb === 'intervention' ? 'Intervention' : tb === 'dir' ? 'Drug Info' : 'ADR Log'}
                </button>
              ))}
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
              {activeTabInViewModal === 'profile' && (
                <PatientProfileFormView clinicalCase={selectedCaseForView} student={selectedCaseForView.students} isReadOnly={true} />
              )}
              {activeTabInViewModal === 'counselling' && (
                <PatientCounsellingFormView clinicalCase={selectedCaseForView} student={selectedCaseForView.students} isReadOnly={true} />
              )}
              {activeTabInViewModal === 'intervention' && (
                <PharmacistInterventionFormView clinicalCase={selectedCaseForView} student={selectedCaseForView.students} isReadOnly={true} />
              )}
              {activeTabInViewModal === 'dir' && (
                <DrugInformationFormView clinicalCase={selectedCaseForView} student={selectedCaseForView.students} isReadOnly={true} />
              )}
              {activeTabInViewModal === 'adr' && (
                <ADRDocumentationFormView clinicalCase={selectedCaseForView} student={selectedCaseForView.students} isReadOnly={true} />
              )}
            </div>
          </div>
        </ModalWrapper>
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
    </div>
  );
};
