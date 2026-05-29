window.HuiLegion = window.HuiLegion || {};

(function repairApiModule(namespace) {
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
      headers: { "Content-Type": "application/json" },
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

    const response = await fetch(url);
    return readJsonOrThrow(response, "Không tải được danh sách yêu cầu dịch vụ");
  }

  async function updateServiceRequest(id, payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/service-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
        return "Bảo trì";
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
        return "Đang xử lý";
      case "done":
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