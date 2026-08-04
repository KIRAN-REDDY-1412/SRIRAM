// Backend API Ready Colleges Data Interface

export const activeCollegesData = [];

/**
 * Async API fetch handler ready for future backend integration (Express / Supabase / REST)
 */
export const fetchActiveColleges = async (limit = null) => {
  // Ready for future fetch('/api/colleges/active') integration
  return new Promise((resolve) => {
    setTimeout(() => {
      if (limit) {
        resolve(activeCollegesData.slice(0, limit));
      } else {
        resolve(activeCollegesData);
      }
    }, 50);
  });
};
