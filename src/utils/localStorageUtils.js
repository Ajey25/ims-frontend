// utils/localStorageUtils.js

/**
 * Sets the admin login status in localStorage
 * @param {boolean} status - The login status to set
 */
export const setAdminLoginStatus = (status) => {
  localStorage.setItem("adminLoggedIn", status ? "true" : "false");
};

/**
 * Checks if the admin is currently logged in with a valid session
 * @returns {boolean} - Whether the admin is logged in
 */
export const getAdminLoginStatus = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return token !== null && user !== null && isSessionValid();
};

/**
 * Clears the admin login status
 */
export const clearAdminLoginStatus = () => {
  localStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("loginTime");
};

/**
 * Checks if the current session is valid (within 3 hours of login)
 * @returns {boolean} - Whether the session is valid
 */
export const isSessionValid = () => {
  const loginTime = localStorage.getItem("loginTime");
  if (!loginTime) return false;
  return Date.now() - parseInt(loginTime, 10) < SESSION_DURATION;
};

/**
 * Gets the remaining session time in milliseconds
 * @returns {number} - Remaining session time in milliseconds
 */ // 30 seconds in milliseconds
export const SESSION_DURATION = 3 * 60 * 60 * 1000;
export const getSessionTimeRemaining = () => {
  const loginTime = localStorage.getItem("loginTime");
  if (!loginTime) return 0;
  const elapsed = Date.now() - parseInt(loginTime, 10);
  return Math.max(0, SESSION_DURATION - elapsed);
};
