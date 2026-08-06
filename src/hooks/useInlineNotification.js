import { useState, useCallback, useRef } from 'react';

export const useInlineNotification = (defaultDuration = 4000) => {
  const [notification, setNotification] = useState(null);
  const timerRef = useRef(null);

  const showNotification = useCallback(({ type = 'info', message, duration = defaultDuration }) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setNotification({
      type,
      message,
      id: Date.now()
    });

    timerRef.current = setTimeout(() => {
      setNotification(null);
    }, duration);
  }, [defaultDuration]);

  const clearNotification = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    clearNotification
  };
};
