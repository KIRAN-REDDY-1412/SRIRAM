import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, Plus, Edit3, Trash2, Eye, Send, ChevronLeft, ChevronRight, Loader2, Save, X, AlertTriangle, Stethoscope, HeartHandshake, ShieldAlert, FileSearch } from 'lucide-react';
import { fetchStudentCasesFromSupabase, updateClinicalCaseInSupabase, deleteClinicalCaseFromSupabase } from '../../services/supabaseService';
import { ModalWrapper } from '../modals/ModalWrapper';

export const MyClinicalCasesView = ({ student, onAddNew, onOpenPatientProfile, onOpenPatientCounselling, onOpenPharmacistIntervention, onOpenDrugInformationRequest, onOpenADRDocumentation }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // View / Edit / Delete Modals
  const [selectedCase, setSelectedCase] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    hospitalName: '',
    department: '',
    wardUnit: '',
    ipOpType: 'IP',
    dateOfAdmission: '',
    dateOfCollection: '',
    status: 'Draft'
  });

  const loadStudentCases = async () => {
    if (!student) return;
    setLoading(true);
    const res = await fetchStudentCasesFromSupabase(student.id);
    if (res.success) {
      setCases(res.data || []);
    } else {
      setCases([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStudentCases();
  }, [student]);

  // Filtered Cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.case_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ward_unit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ip_op_type?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage) || 1;
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenEditModal = (caseRecord) => {
    setSelectedCase(caseRecord);
    setEditFormData({
      hospitalName: caseRecord.hospital_name,
      department: caseRecord.department,
      wardUnit: caseRecord.ward_unit,
      ipOpType: caseRecord.ip_op_type,
      dateOfAdmission: caseRecord.date_of_admission,
      dateOfCollection: caseRecord.date_of_collection,
      status: caseRecord.status
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    setActionLoading(true);
    const res = await updateClinicalCaseInSupabase(selectedCase.id, editFormData);
    setActionLoading(false);

    if (res.success) {
      setIsEditModalOpen(false);
      await loadStudentCases();
    } else {
      alert(res.error || 'Failed to update case.');
    }
  };

  const handleSubmitCase = async (caseRecord) => {
    if (!window.confirm(`Are you sure you want to SUBMIT case ${caseRecord.case_id} for preceptor review?`)) return;

    setActionLoading(true);
    const res = await updateClinicalCaseInSupabase(caseRecord.id, {
      hospitalName: caseRecord.hospital_name,
      department: caseRecord.department,
      wardUnit: caseRecord.ward_unit,
      ipOpType: caseRecord.ip_op_type,
      dateOfAdmission: caseRecord.date_of_admission,
      dateOfCollection: caseRecord.date_of_collection,
      status: 'Submitted'
    });
    setActionLoading(false);

    if (res.success) {
      await loadStudentCases();
    } else {
      alert(res.error || 'Failed to submit case.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!caseToDelete) return;
    setActionLoading(true);
    await deleteClinicalCaseFromSupabase(caseToDelete.id);
    setActionLoading(false);
    setCaseToDelete(null);
    await loadStudentCases();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>My Clinical Patient Cases</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pharm.D logbook patient cases created by <strong className="text-slate-800 dark:text-slate-200">{student?.full_name}</strong>.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Case</span>
        </button>
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
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['All', 'Draft', 'Submitted'].map((st) => (
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
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">Loading Clinical Cases...</p>
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
              : 'You have not added any clinical cases yet. Click "Add New Case" above.'}
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
                  <th className="py-3.5 px-5">Admission / Collection</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedCases.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-3.5 px-5 font-mono font-extrabold text-slate-900 dark:text-white">
                      {c.case_id}
                    </td>

                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                      {c.hospital_name}
                    </td>

                    <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">{c.department}</span>
                      <span className="text-[10px] text-slate-400 block">Unit: {c.ward_unit}</span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        c.ip_op_type === 'IP' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {c.ip_op_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-slate-600 dark:text-slate-400">
                      <div>Adm: {c.date_of_admission}</div>
                      <div className="text-[10px] text-slate-400">Coll: {c.date_of_collection}</div>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.status === 'Submitted'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {/* Open Patient Profile */}
                        <button
                          onClick={() => onOpenPatientProfile(c)}
                          className="px-1.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 transition-colors"
                          title="Open Patient Profile Form"
                        >
                          <Stethoscope className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Profile</span>
                        </button>

                        {/* Open Patient Counselling */}
                        <button
                          onClick={() => onOpenPatientCounselling(c)}
                          className="px-1.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-[10px] font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1 transition-colors"
                          title="Open Patient Counselling Form"
                        >
                          <HeartHandshake className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          <span>Counselling</span>
                        </button>

                        {/* Open Pharmacist Intervention */}
                        <button
                          onClick={() => onOpenPharmacistIntervention(c)}
                          className="px-1.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 transition-colors"
                          title="Open Pharmacist Intervention Form"
                        >
                          <ShieldAlert className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>Intervention</span>
                        </button>

                        {/* Open Drug Information Request */}
                        <button
                          onClick={() => onOpenDrugInformationRequest(c)}
                          className="px-1.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200 dark:border-cyan-800 flex items-center gap-1 transition-colors"
                          title="Open Drug Information Request Form"
                        >
                          <FileSearch className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          <span>Drug Info</span>
                        </button>

                        {/* Open ADR Documentation */}
                        <button
                          onClick={() => onOpenADRDocumentation(c)}
                          className="px-1.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1 transition-colors"
                          title="Open ADR Documentation System"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>ADR Log</span>
                        </button>

                        {/* Open Details Modal */}
                        <button
                          onClick={() => {
                            setSelectedCase(c);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Open Quick View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit (only if Draft) */}
                        {c.status === 'Draft' && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(c)}
                              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                              title="Edit Case"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleSubmitCase(c)}
                              className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                              title="Submit Case to Preceptor"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setCaseToDelete(c)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                              title="Delete Draft"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
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

      {/* VIEW CASE MODAL */}
      {isViewModalOpen && selectedCase && (
        <ModalWrapper
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Clinical Case ${selectedCase.case_id}`}
          subtitle={`Hospital: ${selectedCase.hospital_name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Case ID:</span>
                <strong className="font-mono text-slate-900 dark:text-white font-extrabold">{selectedCase.case_id}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Hospital:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCase.hospital_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCase.department} ({selectedCase.ward_unit})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedCase.ip_op_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Date of Admission:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedCase.date_of_admission}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Date of Collection:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedCase.date_of_collection}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedCase.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  onOpenPatientProfile(selectedCase);
                }}
                className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  onOpenPatientCounselling(selectedCase);
                }}
                className="px-2.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Counselling</span>
              </button>

              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  onOpenPharmacistIntervention(selectedCase);
                }}
                className="px-2.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Intervention</span>
              </button>

              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  onOpenDrugInformationRequest(selectedCase);
                }}
                className="px-2.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>Drug Info</span>
              </button>

              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  onOpenADRDocumentation(selectedCase);
                }}
                className="col-span-2 px-2.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>ADR Documentation Wizard</span>
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* EDIT CASE MODAL */}
      {isEditModalOpen && selectedCase && (
        <ModalWrapper
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Case ${selectedCase.case_id}`}
          subtitle="Update hospital and clinical ward details"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hospital Name *</label>
              <input
                type="text"
                required
                value={editFormData.hospitalName}
                onChange={(e) => setEditFormData({ ...editFormData, hospitalName: e.target.value })}
                className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department *</label>
              <input
                type="text"
                required
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ward / Unit *</label>
              <input
                type="text"
                required
                value={editFormData.wardUnit}
                onChange={(e) => setEditFormData({ ...editFormData, wardUnit: e.target.value })}
                className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">IP/OP Category</label>
                <select
                  value={editFormData.ipOpType}
                  onChange={(e) => setEditFormData({ ...editFormData, ipOpType: e.target.value })}
                  className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                >
                  <option value="IP">IP</option>
                  <option value="OP">OP</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-amber-600 dark:text-amber-400"
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Admission</label>
                <input
                  type="date"
                  required
                  value={editFormData.dateOfAdmission}
                  onChange={(e) => setEditFormData({ ...editFormData, dateOfAdmission: e.target.value })}
                  className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Collection</label>
                <input
                  type="date"
                  required
                  value={editFormData.dateOfCollection}
                  onChange={(e) => setEditFormData({ ...editFormData, dateOfCollection: e.target.value })}
                  className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Case'}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* DELETE DRAFT CONFIRMATION MODAL */}
      {caseToDelete && (
        <ModalWrapper
          isOpen={Boolean(caseToDelete)}
          onClose={() => setCaseToDelete(null)}
          title="Delete Draft Case"
          subtitle={`Delete ${caseToDelete.case_id}?`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this draft case entry? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCaseToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

    </div>
  );
};
