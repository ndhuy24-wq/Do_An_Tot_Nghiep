window.HuiLegion = window.HuiLegion || {};

(function dashboardApiModule(namespace) {
  async function readJsonOrThrow(response, defaultMessage) {
    const raw = await response.text().catch(() => "");
    const data = namespace.utils.safeJsonParse(raw, {});
    if (!response.ok) throw new Error(data.message || defaultMessage);
    return data;
  }

  function adminHeaders() {
    const token = localStorage.getItem("hui_legion_access_token") || "";
    return token ? { "Authorization": `Bearer ${token}` } : {};
  }

  async function fetchRevenueStats() {
    const response = await fetch(`${namespace.getApiBaseUrl()}/orders/statistics`, { headers: adminHeaders() });
    return readJsonOrThrow(response, "Không tải được thống kê doanh thu");
  }

  namespace.dashboardApi = { fetchRevenueStats };
})(window.HuiLegion);
