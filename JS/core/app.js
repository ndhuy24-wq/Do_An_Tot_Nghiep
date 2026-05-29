window.APP_CONFIG = window.APP_CONFIG || {
  API_BASE_URL: "http://localhost:8080/api"
};

window.HuiLegion = window.HuiLegion || {};

(function bootstrapApp(namespace) {
  function getApiBaseUrl() {
    return (
      window.API_BASE_URL ||
      (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
      "http://localhost:8080/api"
    );
  }

  function formatMoney(value) {
    return (Number(value) || 0).toLocaleString("vi-VN") + "đ";
  }

  function formatOptionalMoney(value) {
    if (value === null || value === undefined || value === "") return "";
    return Number(value).toLocaleString("vi-VN") + "đ";
  }

  function normalizeEmail(email) {
    return String(email || "").toLowerCase().trim();
  }

  function safeJsonParse(raw, fallback = {}) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readImageAsBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve("");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result || "");
      reader.onerror = () => reject(new Error("Không đọc được file ảnh."));
      reader.readAsDataURL(file);
    });
  }

  function isAdminRole(role) {
    const normalized = String(role || "").toUpperCase();
    return normalized === "ADMIN" || normalized === "ROLE_ADMIN";
  }

  namespace.getApiBaseUrl = getApiBaseUrl;
  namespace.utils = {
    formatMoney,
    formatOptionalMoney,
    normalizeEmail,
    safeJsonParse,
    readImageAsBase64,
    isAdminRole
  };
})(window.HuiLegion);
