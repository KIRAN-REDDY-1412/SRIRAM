import React, { useState } from 'react';
import { LayoutDashboard, User, UserCheck, GraduationCap, Building2, LogOut, Sun, Moon, Menu, X, ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

import { CollegeAdminDashboardView } from './CollegeAdminDashboardView';
import { AddPreceptorView } from './AddPreceptorView';
import { PreceptorListView } from './PreceptorListView';
import { AddStudentView } from './AddStudentView';
import { StudentListView } from './StudentListView';
import { CollegeAdminProfileView } from './CollegeAdminProfileView';

export const CollegeAdminLayout = ({ college, onLogout }) => {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'add-preceptor' | 'preceptors-list' | 'add-student' | 'students-list' | 'profile'
  
  // Accordion Sidebar Submenus
  const [preceptorSubOpen, setPreceptorSubOpen] = useState(true);
  const [studentSubOpen, setStudentSubOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              {college?.logoUrl ? (
                <img
                  src={college.logoUrl}
                  alt={college.name}
                  className="w-8 h-8 rounded-xl object-contain bg-white border border-slate-200 dark:border-slate-700 p-0.5 shadow-xs"
                />
              ) : (
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${college?.logoBg || 'from-emerald-600 to-teal-700'} flex items-center justify-center text-white font-extrabold text-xs shadow-xs`}>
                  {college?.initials || 'CLG'}
                </div>
              )}
              <div>
                <strong className="block text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-[130px]">
                  {college?.name || 'College Admin'}
                </strong>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {college?.code || 'ADMIN'}
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
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto text-xs font-semibold">
            
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

            {/* PRECEPTOR MANAGEMENT SUBMENU */}
            <div className="pt-2">
              <button
                onClick={() => setPreceptorSubOpen(!preceptorSubOpen)}
                className="w-full h-10 px-3.5 rounded-xl flex items-center justify-between text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Preceptor Management</span>
                </div>
                {preceptorSubOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {preceptorSubOpen && (
                <div className="mt-1 pl-4 space-y-1 border-l-2 border-indigo-100 dark:border-indigo-950/80 ml-4">
                  <button
                    onClick={() => handleNavigate('add-preceptor')}
                    className={`w-full h-9 px-3 rounded-lg flex items-center gap-2 transition-all ${
                      activeTab === 'add-preceptor'
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Add Preceptor</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('preceptors-list')}
                    className={`w-full h-9 px-3 rounded-lg flex items-center gap-2 transition-all ${
                      activeTab === 'preceptors-list'
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Preceptor List</span>
                  </button>
                </div>
              )}
            </div>

            {/* STUDENT MANAGEMENT SUBMENU */}
            <div className="pt-2">
              <button
                onClick={() => setStudentSubOpen(!studentSubOpen)}
                className="w-full h-10 px-3.5 rounded-xl flex items-center justify-between text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Student Management</span>
                </div>
                {studentSubOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {studentSubOpen && (
                <div className="mt-1 pl-4 space-y-1 border-l-2 border-emerald-100 dark:border-emerald-950/80 ml-4">
                  <button
                    onClick={() => handleNavigate('add-student')}
                    className={`w-full h-9 px-3 rounded-lg flex items-center gap-2 transition-all ${
                      activeTab === 'add-student'
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-900'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Add Student</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('students-list')}
                    className={`w-full h-9 px-3 rounded-lg flex items-center gap-2 transition-all ${
                      activeTab === 'students-list'
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-900'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Student List</span>
                  </button>
                </div>
              )}
            </div>

            {/* My Profile */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button
                onClick={() => handleNavigate('profile')}
                className={`w-full h-11 px-3.5 rounded-xl flex items-center gap-3 transition-all ${
                  activeTab === 'profile'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>My Profile</span>
              </button>
            </div>

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
                {college?.name} <span className="text-slate-400 font-normal text-xs hidden sm:inline">| College Admin Portal</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Gateway</span>
            </span>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-semibold transition-colors"
            >
              Exit Portal
            </button>
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

          {activeTab === 'profile' && (
            <CollegeAdminProfileView
              college={college}
              onProfileUpdated={() => handleNavigate('dashboard')}
            />
          )}
        </main>

        {/* FOOTER */}
        <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 PharmDVerse Cloud. College Admin Module for {college?.name}. All rights reserved.</p>
        </footer>

      </div>

    </div>
  );
};
