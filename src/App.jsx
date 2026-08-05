import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CollegeProvider } from './context/CollegeContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';

// Config & Hooks
import { APP_CONFIG } from './config/appConfig';
import { useDeveloperShortcut } from './hooks/useDeveloperShortcut';
import { getActiveAdminSession } from './services/authService';

// Full Page Components
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { CollegePortalView } from './components/portal/CollegePortalView';
import { CollegeAdminLayout } from './components/collegeAdmin/CollegeAdminLayout';

// Modals
import { PricingModal } from './components/modals/PricingModal';
import { ContactModal } from './components/modals/ContactModal';
import { RegisterModal } from './components/modals/RegisterModal';
import { AllCollegesModal } from './components/modals/AllCollegesModal';
import { DeveloperAccessModal } from './components/modals/DeveloperAccessModal';
import { SuperAdminModal } from './components/modals/SuperAdminModal';
import { CollegeAdminLoginModal } from './components/modals/CollegeAdminLoginModal';
import { InfoModal } from './components/modals/InfoModal';

export default function App() {
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'admin' | 'college_portal' | 'college_admin'
  const [pricingOpen, setPricingOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [allCollegesOpen, setAllCollegesOpen] = useState(false);
  const [devAccessOpen, setDevAccessOpen] = useState(false);
  const [superAdminLoginOpen, setSuperAdminLoginOpen] = useState(false);
  const [collegeAdminLoginOpen, setCollegeAdminLoginOpen] = useState(false);
  const [infoContentType, setInfoContentType] = useState(null);
  
  const [activePortalCollege, setActivePortalCollege] = useState(null);
  const [loggedCollegeAdmin, setLoggedCollegeAdmin] = useState(null);

  // Check active admin session on initial load
  useEffect(() => {
    const session = getActiveAdminSession();
    if (session) {
      setViewMode('admin');
    }
  }, []);

  // Hidden Developer Mode Keyboard Shortcut (Ctrl + Alt + D)
  useDeveloperShortcut({
    enabled: APP_CONFIG.DEVELOPER_MODE,
    onTrigger: () => {
      setDevAccessOpen(true);
    },
    isModalOpen: devAccessOpen || superAdminLoginOpen || viewMode === 'admin'
  });

  // Open Full-Page College Portal Landing Page
  const handleOpenPortal = (college) => {
    setActivePortalCollege(college);
    setViewMode('college_portal');
    setAllCollegesOpen(false);
  };

  const handleBackToLanding = () => {
    setViewMode('landing');
    setActivePortalCollege(null);
    setLoggedCollegeAdmin(null);
  };

  const handleCollegeAdminLoginSuccess = (college) => {
    setLoggedCollegeAdmin(college);
    setViewMode('college_admin');
    setCollegeAdminLoginOpen(false);
  };

  return (
    <ThemeProvider>
      <CollegeProvider>
        
        {/* 1. FULL PAGE SUPER ADMIN DASHBOARD VIEW */}
        {viewMode === 'admin' ? (
          <SuperAdminDashboard
            onExitToLanding={handleBackToLanding}
          />
        ) : viewMode === 'college_admin' && loggedCollegeAdmin ? (
          
          /* 2. FULL PAGE COLLEGE ADMIN MODULE VIEW */
          <CollegeAdminLayout
            college={loggedCollegeAdmin}
            onLogout={handleBackToLanding}
          />

        ) : viewMode === 'college_portal' && activePortalCollege ? (
          
          /* 3. FULL PAGE DEDICATED COLLEGE PORTAL LANDING PAGE */
          <CollegePortalView
            college={activePortalCollege}
            onBackToLanding={handleBackToLanding}
            onOpenAdminLogin={(col) => {
              setActivePortalCollege(col);
              setCollegeAdminLoginOpen(true);
            }}
          />

        ) : (
          /* 4. PUBLIC SAAS LANDING PAGE VIEW */
          <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-300 flex flex-col justify-between">
            
            {/* Sticky Glass Header */}
            <Header
              onOpenPricing={() => setPricingOpen(true)}
              onOpenContact={() => setContactOpen(true)}
            />

            {/* Main Landing Page Content */}
            <main className="flex-grow">
              
              {/* Hero Section */}
              <Hero
                onOpenPortal={handleOpenPortal}
                onOpenAllColleges={() => setAllCollegesOpen(true)}
                onOpenRegisterModal={() => setRegisterOpen(true)}
              />

            </main>

            {/* Clean Public Footer */}
            <Footer
              onOpenInfoModal={(type) => setInfoContentType(type)}
              onOpenSuperAdmin={() => setSuperAdminLoginOpen(true)}
            />

            {/* --- MODAL DIALOGS --- */}
            
            {/* Pricing Popup Modal */}
            <PricingModal
              isOpen={pricingOpen}
              onClose={() => setPricingOpen(false)}
              onSelectPlanToRegister={() => {
                setPricingOpen(false);
                setRegisterOpen(true);
              }}
            />

            {/* Contact Popup Modal */}
            <ContactModal
              isOpen={contactOpen}
              onClose={() => setContactOpen(false)}
            />

            {/* College Registration Modal */}
            <RegisterModal
              isOpen={registerOpen}
              onClose={() => setRegisterOpen(false)}
            />

            {/* All Subscribed Colleges Modal */}
            <AllCollegesModal
              isOpen={allCollegesOpen}
              onClose={() => setAllCollegesOpen(false)}
              onOpenPortal={handleOpenPortal}
            />

            {/* Developer Access Code Modal (Triggered via Ctrl + Alt + D) */}
            <DeveloperAccessModal
              isOpen={devAccessOpen}
              onClose={() => setDevAccessOpen(false)}
              onSuccess={() => setSuperAdminLoginOpen(true)}
            />

            {/* Super Admin Login Modal */}
            <SuperAdminModal
              isOpen={superAdminLoginOpen}
              onClose={() => setSuperAdminLoginOpen(false)}
              onLoginSuccess={() => setViewMode('admin')}
            />

            {/* College Admin Login Modal */}
            <CollegeAdminLoginModal
              isOpen={collegeAdminLoginOpen}
              onClose={() => setCollegeAdminLoginOpen(false)}
              initialCollege={activePortalCollege}
              onLoginSuccess={handleCollegeAdminLoginSuccess}
            />

            {/* Informational Modals */}
            <InfoModal
              isOpen={Boolean(infoContentType)}
              onClose={() => setInfoContentType(null)}
              contentType={infoContentType}
            />

          </div>
        )}

        {/* Global College Admin Login Modal when on College Portal page */}
        {viewMode === 'college_portal' && (
          <CollegeAdminLoginModal
            isOpen={collegeAdminLoginOpen}
            onClose={() => setCollegeAdminLoginOpen(false)}
            initialCollege={activePortalCollege}
            onLoginSuccess={handleCollegeAdminLoginSuccess}
          />
        )}

      </CollegeProvider>
    </ThemeProvider>
  );
}
