import { useEffect } from 'react';

/**
 * Custom hook to detect hidden developer keyboard shortcut:
 * Ctrl + Alt + D (and Ctrl + Alt + S)
 */
export const useDeveloperShortcut = ({ enabled = true, onTrigger, isModalOpen = false }) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Do nothing if any modal is already open
      if (isModalOpen) return;

      // Ignore if user is typing inside an input, textarea, select, or editable field
      const activeEl = document.activeElement;
      if (
        activeEl && (
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable
        )
      ) {
        return;
      }

      // Check if Ctrl + Alt + D or Ctrl + Alt + S is pressed
      const isDKey = e.key === 'd' || e.key === 'D';
      const isSKey = e.key === 's' || e.key === 'S';

      if (e.ctrlKey && e.altKey && (isDKey || isSKey)) {
        e.preventDefault();
        e.stopPropagation();
        onTrigger();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onTrigger, isModalOpen]);
};
