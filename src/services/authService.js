/**
 * Super Admin & Portal Authentication Session Service
 */

export const DEV_ADMIN_CREDENTIALS = {
  email: "tsriramireddy1999@gmail.com",
  password: "9440251915"
};

const PORTAL_SESSION_KEY = 'pharmdverse_active_portal_session';

/**
 * Save active portal session to localStorage
 */
export const saveActiveSession = (sessionData) => {
  try {
    const payload = {
      ...sessionData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PORTAL_SESSION_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save portal session', err);
  }
};

/**
 * Get active portal session from localStorage
 */
export const getActiveSession = () => {
  try {
    const raw = localStorage.getItem(PORTAL_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse portal session', err);
    return null;
  }
};

/**
 * Clear active portal session
 */
export const clearActiveSession = () => {
  try {
    localStorage.removeItem(PORTAL_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear portal session', err);
  }
};

/**
 * Authenticate Super Admin user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const authenticateSuperAdmin = async (email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trimmedEmail = (email || '').trim().toLowerCase();
      const trimmedPassword = (password || '').trim();

      if (trimmedEmail === DEV_ADMIN_CREDENTIALS.email.toLowerCase() && trimmedPassword === DEV_ADMIN_CREDENTIALS.password) {
        const userSession = {
          email: DEV_ADMIN_CREDENTIALS.email,
          role: "super_admin",
          authenticatedAt: new Date().toISOString()
        };
        localStorage.setItem('pharmdverse_super_admin_session', JSON.stringify(userSession));
        saveActiveSession({ viewMode: 'admin', userRole: 'super_admin' });
        resolve({ success: true, user: userSession });
      } else {
        resolve({ success: false, error: "Invalid email or password." });
      }
    }, 550);
  });
};

/**
 * Get active Super Admin session from storage
 */
export const getActiveAdminSession = () => {
  const saved = localStorage.getItem('pharmdverse_super_admin_session');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return null;
};

/**
 * Logout Super Admin session
 */
export const logoutSuperAdmin = () => {
  localStorage.removeItem('pharmdverse_super_admin_session');
  clearActiveSession();
};
