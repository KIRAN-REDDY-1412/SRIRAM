/**
 * Super Admin Authentication Service
 * Isolated for easy replacement with backend API (Express + JWT + Supabase)
 */

export const DEV_ADMIN_CREDENTIALS = {
  email: "tsriramireddy1999@gmail.com",
  password: "9440251915"
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
};
