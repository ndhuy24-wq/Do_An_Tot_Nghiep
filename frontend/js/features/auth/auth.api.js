/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: auth.api.js - Xu ly logic phia client (Frontend JavaScript).
 */
window.HuiLegion = window.HuiLegion || {};

(function authApiModule(namespace) {
  async function handleAuthResponse(response, defaultMessage) {
    const raw = await response.text().catch(() => "");
    const data = namespace.utils.safeJsonParse(raw, {});

    if (!response.ok) {
      throw new Error(data.message || defaultMessage);
    }

    return data;
  }

  function saveTokens(data) {
    if (data?.accessToken) localStorage.setItem("hui_legion_access_token", data.accessToken);
    if (data?.refreshToken) localStorage.setItem("hui_legion_refresh_token", data.refreshToken);
  }

  async function login(payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await handleAuthResponse(response, "Đăng nhập thất bại.");
    saveTokens(data);
    return data.user || data;
  }

  async function register(payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await handleAuthResponse(response, "Đăng ký thất bại, vui lòng thử lại.");
    saveTokens(data);
    return data.user || data;
  }

  async function forgotPassword(email) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/auth/forgot-password`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email })
    });
    return handleAuthResponse(response, "Không thể tạo yêu cầu quên mật khẩu.");
  }

  async function resetPassword(token, newPassword) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/auth/reset-password`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, newPassword })
    });
    return handleAuthResponse(response, "Đặt lại mật khẩu thất bại.");
  }

  async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("hui_legion_refresh_token");
    if (!refreshToken) throw new Error("Không có refresh token.");

    const response = await fetch(`${namespace.getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });

    const data = await handleAuthResponse(response, "Refresh token thất bại.");
    if (data.accessToken) localStorage.setItem("hui_legion_access_token", data.accessToken);
    return data.accessToken;
  }

  namespace.authApi = { login, register, forgotPassword, resetPassword, refreshAccessToken };
})(window.HuiLegion);
