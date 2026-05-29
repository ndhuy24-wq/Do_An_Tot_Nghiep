window.HuiLegion = window.HuiLegion || {};

(function repairApiModule(namespace) {
  function adminHeaders() {
    const token = localStorage.getItem("hui_legion_access_token") || "";
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ""
    };
  }

  async function readJsonOrThrow(response, defaultMessage) {
    const raw = await response.text().catch(() => "");
    let data = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (e) {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || defaultMessage);
    }

    return data;
  }

  async function createServiceRequest(payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/service-requests`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(payload)
    });

    return readJsonOrThrow(response, "Gửi yêu cầu dịch vụ thất bại");
  }

  async function fetchMyServiceRequests(email) {
    const normalizedEmail = (email || "").trim().toLowerCase();

    const response = await fetch(
      `${namespace.getApiBaseUrl()}/service-requests?email=${encodeURIComponent(normalizedEmail)}`
    );

    return readJsonOrThrow(response, "Không tải được yêu cầu dịch vụ");
  }

  async function fetchServiceRequestDetail(id) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/service-requests/${id}`);
    return readJsonOrThrow(response, "Không tải được chi tiết yêu cầu");
  }

  async function fetchAdminServiceRequests(status = "") {
    const url = status
      ? `${namespace.getApiBaseUrl()}/service-requests?status=${encodeURIComponent(status)}`
      : `${namespace.getApiBaseUrl()}/service-requests`;

    const response = await fetch(url, { headers: adminHeaders() });
    return readJsonOrThrow(response, "Không tải được danh sách yêu cầu dịch vụ");
  }

  async function updateServiceRequest(id, payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/service-requests/${id}`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify(payload)
    });

    return readJsonOrThrow(response, "Cập nhật yêu cầu dịch vụ thất bại");
  }

  function formatServiceType(type) {
    switch (type) {
      case "repair":
        return "Sửa chữa";
      case "upgrade":
        return "Nâng cấp";
      case "maintenance":
      case "cleaning":
        return "Bảo trì / vệ sinh";
      case "warranty":
        return "Bảo hành";
      default:
        return type || "";
    }
  }

  function formatServiceStatus(status) {
    switch (status) {
      case "received":
        return "Đã tiếp nhận";
      case "quoted":
        return "Đã báo giá";
      case "processing":
      case "checking":
        return "Đang xử lý";
      case "done":
      case "completed":
        return "Hoàn thành";
      case "cancel":
        return "Đã hủy";
      default:
        return status || "";
    }
  }

  namespace.repairApi = {
    createServiceRequest,
    fetchMyServiceRequests,
    fetchServiceRequestDetail,
    fetchAdminServiceRequests,
    updateServiceRequest,
    formatServiceType,
    formatServiceStatus
  };
})(window.HuiLegion);