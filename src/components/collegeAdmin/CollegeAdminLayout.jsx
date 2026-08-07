import React, { useState, useEffect } from 'react';
import { LayoutDashboard, User, GraduationCap, Building2, LogOut, Sun, Moon, Menu, X, ShieldCheck, UserCheck, ClipboardList, FileText, FileCheck2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { fetchCollegeByIdFromSupabase } from '../../services/supabaseService';

import { CollegeAdminDashboardView } from './CollegeAdminDashboardView';
import { AddPreceptorView } from './AddPreceptorView';
import { PreceptorListView } from './PreceptorListView';
import { AddStudentView } from './AddStudentView';
import { StudentListView } from './StudentListView';
import { AssignStudentsView } from './AssignStudentsView';
import { AssignmentListView } from './AssignmentListView';
import { DocumentBrandingView } from './DocumentBrandingView';
import { CollegeAdminProfileView } from './CollegeAdminProfileView';
import { ClinicalCaseManagementView } from './ClinicalCaseManagementView';
import { LeaveWorkspaceModal } from '../modals/LeaveWorkspaceModal';
import { useWorkspaceHistory } from '../../hooks/useWorkspaceHistory';

export const CollegeAdminLayout = ({ college: initialCollege, onLogout }) => {
  const { isDark, toggleTheme } = useTheme();
  const { activeTab, setActiveTab, pushTab, showLeaveModal, setShowLeaveModal } = useWorkspaceHistory('dashboard');
  const [collegeAdminCaseFilter, setCollegeAdminCaseFilter] = useState('All');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [college, setCollege] = useState(initialCollege);

  useEffect(() => {
    setCollege(initialCollege);
  }, [initialCollege]);

  // LIVE SYNCHRONIZATION LISTENER FOR COLLEGE UPDATES
  useEffect(() => {
    const handleCollegeUpdated = (e) => {
      if (e.detail) {
        setCollege(e.detail);
      }
    };
    window.addEventListener('pharmdverse_college_updated', handleCollegeUpdated);
    return () => window.removeEventListener('pharmdverse_college_updated', handleCollegeUpdated);
  }, []);

  // ALSO FETCH FRESH COLLEGE RECORD DIRECTLY FROM SUPABASE ON MOUNT
  useEffect(() => {
    const loadFreshCollege = async () => {
      if (initialCollege?.id) {
        const res = await fetchCollegeByIdFromSupabase(initialCollege.id);
        if (res.success && res.college) {
          setCollege(res.college);
        }
      }
    };
    loadFreshCollege();
  }, [initialCollege?.id]);

  const handleNavigate = (tab, filter = 'All') => {
    setCollegeAdminCaseFilter(filter);
    pushTab(tab);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProfileUpdated = (updatedCollege) => {
    if (updatedCollege) {
      setCollege(updatedCollege);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 font-sans flex transition-colors duration-300">
      
      {/* 1. SIDEBAR (DESKTOP & MOBILE DRAWER) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          
          {/* SIDEBAR BRANDING HEADER */}
          <div className="h-16 px-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {college?.college_logo_url || college?.logoUrl ? (
                <img
                  src={college.college_logo_url || college.logoUrl}
                  alt={college.college_name || college.name}
                  className="w-8 h-8 rounded-xl object-contain bg-white border border-slate-200 dark:border-slate-700 p-0.5 shadow-xs"
                />
              ) : (
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${college?.logoBg || 'from-emerald-600 to-teal-700'} flex items-center justify-center text-white font-extrabold text-xs shadow-xs`}>
                  {college?.initials || 'CLG'}
                </div>
              )}
              <div>
                <strong className="block text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-[130px]">
                  {college?.college_name || college?.name || 'College Admin'}
                </strong>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {college?.college_code || college?.code || 'ADMIN'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto text-xs font-semibold">
            
            {/* Dashboard */}
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`w-full h-11 px-3.5 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* Preceptor Management */}
            <button
              onClick={() => handleNavigate('preceptors-list')}
              className={`w-full h-11 px-3.5 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === 'preceptors-list' || activeTab === 'add-preceptor'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Preceptor Management</span>
            </button>

            {/* Student Management */}
            <button
              onClick={() => handleNavigate('students-list')}
              className={`w-full h-11 px-3.5 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === 'students-list' || activeTab === 'add-student'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Student Management</span>
            </button>

            {/* Assignment Management */}
            <button
              onClick={() => handleNavigate('assignments-list')}
              className={`w-full h-11 px-3.5 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === 'assignments-list' || activeTab === 'assign-students'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Assignment Management</span>
            </button>

            {/* Clinical Case Management */}
            <button
              onClick={() => handleNavigate('clinical-cases')}
              className={`w-full h-11 px-3.5 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === 'clinical-cases'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span>Clinical Case Management</span>
            </button>

            {/* Document Branding */}
            <button
              onClick={() => handleNavigate('document-branding')}
              className={`w-full h-11 px-3.5 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === 'document-branding'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>📄 Document Branding</span>
            </button>

            {/* My Profile */}
            <button
              onClick={() => handleNavigate('profile')}
              className={`w-full h-11 px-3.5 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === 'profile'
                  ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>My Profile</span>
            </button>

          </nav>

          {/* SIDEBAR FOOTER (LOGOUT & LIGHT/DARK TOGGLE) */}
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400">{isDark ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full h-10 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* TOPBAR */}
        <header className="h-16 px-4 sm:px-8 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {college?.college_name || college?.name} <span className="text-slate-400 font-normal text-xs hidden sm:inline">| College Admin Portal</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Workspace</span>
            </span>
          </div>
        </header>

        {/* VIEW ROUTER */}
        <main className="flex-1 p-4 sm:p-8">
          {activeTab === 'dashboard' && (
            <CollegeAdminDashboardView college={college} onNavigate={handleNavigate} />
          )}

          {activeTab === 'add-preceptor' && (
            <AddPreceptorView
              college={college}
              onCancel={() => handleNavigate('preceptors-list')}
              onSuccess={() => handleNavigate('preceptors-list')}
            />
          )}

          {activeTab === 'preceptors-list' && (
            <PreceptorListView
              college={college}
              onAddNew={() => handleNavigate('add-preceptor')}
            />
          )}

          {activeTab === 'add-student' && (
            <AddStudentView
              college={college}
              onCancel={() => handleNavigate('students-list')}
              onSuccess={() => handleNavigate('students-list')}
            />
          )}

          {activeTab === 'students-list' && (
            <StudentListView
              college={college}
              onAddNew={() => handleNavigate('add-student')}
            />
          )}

          {activeTab === 'assign-students' && (
            <AssignStudentsView
              college={college}
              onCancel={() => handleNavigate('assignments-list')}
              onSuccess={() => handleNavigate('assignments-list')}
            />
          )}

          {activeTab === 'assignments-list' && (
            <AssignmentListView
              college={college}
              onAddNew={() => handleNavigate('assign-students')}
            />
          )}

          {activeTab === 'clinical-cases' && (
            <ClinicalCaseManagementView college={college} initialFilter={collegeAdminCaseFilter} />
          )}

          {activeTab === 'document-branding' && (
            <DocumentBrandingView college={college} />
          )}

          {activeTab === 'profile' && (
            <CollegeAdminProfileView
              college={college}
              onProfileUpdated={handleProfileUpdated}
            />
          )}
        </main>

        {/* FOOTER */}
        <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 PharmDVerse Cloud. College Admin Module for {college?.college_name || college?.name}. All rights reserved.</p>
        </footer>

      </div>

      <LeaveWorkspaceModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirmLeave={onLogout}
        leaveButtonText="Go to College Landing Page"
      />

    </div>
  );
};
