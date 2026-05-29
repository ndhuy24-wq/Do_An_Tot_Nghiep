window.HuiLegion = window.HuiLegion || {};

(function userApiModule(namespace) {
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return readJsonOrThrow(response, "Cập nhật thất bại");
  }

  async function fetchAllUsers() {
    const response = await fetch(`${namespace.getApiBaseUrl()}/admin/users`);
    return readJsonOrThrow(response, "Không tải được danh sách tài khoản");
  }

  async function updateUserByAdmin(id, payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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