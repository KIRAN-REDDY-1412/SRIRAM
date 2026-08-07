import React, { useState, useEffect } from 'react';
import { LayoutDashboard, GraduationCap, User, LogOut, Sun, Moon, Menu, X, Stethoscope, ShieldCheck, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

import { PreceptorDashboardView } from './PreceptorDashboardView';
import { PreceptorAssignedStudentsView } from './PreceptorAssignedStudentsView';
import { PreceptorProfileView } from './PreceptorProfileView';
import { NotificationsView } from '../common/NotificationsView';
import { ChangePasswordSection } from '../common/ChangePasswordSection';
import { fetchUnreadNotificationsCountFromSupabase } from '../../services/supabaseService';

export const PreceptorLayout = ({ preceptor, onLogout }) => {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [forcePasswordReset, setForcePasswordReset] = useState(preceptor?.force_password_reset || false);

  const loadUnreadCount = async () => {
    if (!preceptor?.id) return;
    const res = await fetchUnreadNotificationsCountFromSupabase(preceptor.id);
    if (res.success) {
      setUnreadCount(res.count || 0);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [preceptor?.id, activeTab]);

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadUnreadCount();
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
              {preceptor?.profile_photo_url ? (
                <img
                  src={preceptor.profile_photo_url}
                  alt={preceptor.full_name}
                  className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                  {preceptor?.full_name ? preceptor.full_name.substring(0, 2).toUpperCase() : 'PR'}
                </div>
              )}
              <div>
                <strong className="block text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-[130px]">
                  {preceptor?.full_name || 'Preceptor'}
                </strong>
                <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">
                  {preceptor?.department || 'Clinical Evaluator'}
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
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* Assigned Students */}
            <button
              onClick={() => handleNavigate('assigned-students')}
              className={`w-full h-11 px-3.5 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === 'assigned-students'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Assigned Students</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => handleNavigate('notifications')}
              className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-between transition-all ${
                activeTab === 'notifications'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 shrink-0" />
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="h-5 px-1.5 min-w-[20px] rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm leading-none shrink-0 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* My Profile */}
            <button
              onClick={() => handleNavigate('profile')}
              className={`w-full h-11 px-3.5 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === 'profile'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
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
              <Stethoscope className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {preceptor?.colleges?.college_name || 'Pharmacy College'} <span className="text-slate-400 font-normal text-xs hidden sm:inline">| Preceptor Portal</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Preceptor Gateway</span>
            </span>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-semibold transition-colors"
            >
              Exit Portal
            </button>
          </div>
        </header>

        {/* FORCE PASSWORD RESET SCREEN */}
        {forcePasswordReset ? (
          <main className="flex-1 p-4 sm:p-8 flex items-center justify-center">
            <div className="w-full max-w-md space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-1">Password Reset Required</strong>
                  Your college administrator has reset your password. You must set a new secure password before you can access the portal.
                </div>
              </div>
              <ChangePasswordSection
                user={preceptor}
                userType="Preceptor"
                isForceReset={true}
                onSuccess={() => setForcePasswordReset(false)}
              />
            </div>
          </main>
        ) : (
        <main className="flex-1 p-4 sm:p-8">
          {activeTab === 'dashboard' && (
            <PreceptorDashboardView preceptor={preceptor} onNavigate={handleNavigate} />
          )}

          {activeTab === 'assigned-students' && (
            <PreceptorAssignedStudentsView preceptor={preceptor} />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              userId={preceptor.id}
              userRole="Preceptor"
              onNavigate={(route, caseId) => {
                handleNavigate(route);
              }}
              onBack={() => handleNavigate('dashboard')}
            />
          )}

          {activeTab === 'profile' && (
            <PreceptorProfileView preceptor={preceptor} />
          )}
        </main>
        )}

        {/* FOOTER */}
        <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 PharmDVerse Cloud. Preceptor Module for {preceptor?.full_name}. All rights reserved.</p>
        </footer>

      </div>

    </div>
  );
};
