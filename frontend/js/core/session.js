/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: session.js - Xu ly logic phia client (Frontend JavaScript).
 */
window.HuiLegion = window.HuiLegion || {};

(function sessionModule(namespace) {
  const CURRENT_USER_KEY = "hui_legion_current_user";

  function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user || null));
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch (error) {
      return null;
    }
  }

  function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("hui_legion_access_token");
    localStorage.removeItem("hui_legion_refresh_token");
  }

  namespace.session = {
    setCurrentUser,
    getCurrentUser,
    clearCurrentUser,
    CURRENT_USER_KEY
  };

  window.setCurrentUser = setCurrentUser;
  window.getCurrentUser = getCurrentUser;
  window.clearCurrentUser = clearCurrentUser;
})(window.HuiLegion);
