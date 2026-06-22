/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: user.api.js - Xu ly logic phia client (Frontend JavaScript).
 */
window.HuiLegion = window.HuiLegion || {};

(function userApiModule(namespace) {
  function adminHeaders() {
    const token = localStorage.getItem("hui_legion_access_token") || "";
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ""
    };
  }

  async function readJsonOrThrow(response, defaultMessage) {
    const raw = await response.text().catch(() => "");
    const data = namespace.utils.safeJsonParse(raw, {});

    if (!response.ok) {
      throw new Error(data.message || defaultMessage);
    }

    return data;
  }

  async function fetchProfile(email) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/user/${encodeURIComponent(email)}`);
    return readJsonOrThrow(response, "Không tải được profile");
  }

  async function updateProfile(email, payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/user/${encodeURIComponent(email)}/profile`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify(payload)
    });

    return readJsonOrThrow(response, "Cập nhật thất bại");
  }

  async function fetchAllUsers() {
    const response = await fetch(`${namespace.getApiBaseUrl()}/admin/users`, { headers: adminHeaders() });
    return readJsonOrThrow(response, "Không tải được danh sách tài khoản");
  }

  async function updateUserByAdmin(id, payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/admin/users/${id}`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify(payload)
    });

    return readJsonOrThrow(response, "Cập nhật tài khoản thất bại");
  }

  namespace.userApi = {
    fetchProfile,
    updateProfile,
    fetchAllUsers,
    updateUserByAdmin
  };
})(window.HuiLegion);