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

  async function login(payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return handleAuthResponse(response, "Đăng nhập thất bại.");
  }

  async function register(payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return handleAuthResponse(response, "Đăng ký thất bại, vui lòng thử lại.");
  }

  namespace.authApi = { login, register };
})(window.HuiLegion);
