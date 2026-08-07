import { useState, useEffect, useRef } from 'react';

export function useWorkspaceHistory(initialTab = 'dashboard') {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const tabHistory = useRef([initialTab]);

  const pushTab = (newTab) => {
    if (newTab === activeTab) return;
    tabHistory.current.push(newTab);
    window.history.pushState({ tab: newTab }, '');
    setActiveTab(newTab);
  };

  useEffect(() => {
    // Replace initial state with root tab
    window.history.replaceState({ tab: initialTab }, '');

    const handlePopState = (e) => {
      if (tabHistory.current.length > 1) {
        tabHistory.current.pop();
        const prevTab = tabHistory.current[tabHistory.current.length - 1];
        setActiveTab(prevTab);
      } else {
        window.history.pushState({ tab: initialTab }, '');
        setShowLeaveModal(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initialTab]);

  return {
    activeTab,
    setActiveTab,
    pushTab,
    showLeaveModal,
    setShowLeaveModal
  };
}
