window.HuiLegion = window.HuiLegion || {};

(function ordersApiModule(namespace) {
  async function readJsonOrThrow(response, defaultMessage) {
    const raw = await response.text().catch(() => "");
    const data = namespace.utils.safeJsonParse(raw, {});

    if (!response.ok) {
      throw new Error(data.message || defaultMessage);
    }

    return data;
  }

function adminHeaders() {
    const token = localStorage.getItem("hui_legion_access_token") || "";
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ""
    };
  }

async function checkout(email, address, paymentMethod) {
  const response = await fetch(`${namespace.getApiBaseUrl()}/orders/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: namespace.utils.normalizeEmail(email),
      address,
      paymentMethod
    })
  });

  return readJsonOrThrow(response, "Tạo đơn hàng thất bại");
}

  async function cancelOrder(id, email) {
  const response = await fetch(
    `${namespace.getApiBaseUrl()}/orders/${id}/cancel?email=${encodeURIComponent(namespace.utils.normalizeEmail(email))}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    }
  );
  return readJsonOrThrow(response, "Hủy đơn hàng thất bại");
}

  async function fetchMyOrders(email) {
    const response = await fetch(
      `${namespace.getApiBaseUrl()}/orders?email=${encodeURIComponent(namespace.utils.normalizeEmail(email))}`
    );
    return readJsonOrThrow(response, "Không tải được đơn hàng");
  }

  async function fetchAllOrders() {
    const response = await fetch(`${namespace.getApiBaseUrl()}/orders`, { headers: adminHeaders() });
    return readJsonOrThrow(response, "Không tải được danh sách đơn hàng");
  }

  async function fetchOrderDetail(id) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/orders/${id}`);
    return readJsonOrThrow(response, "Không tải được chi tiết đơn");
  }

  async function updateOrderStatus(id, status) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/orders/${id}/status`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify({ status })
    });
    return readJsonOrThrow(response, "Cập nhật trạng thái thất bại");
  }
  async function updatePaymentStatus(id, paymentStatus) {
  const response = await fetch(`${namespace.getApiBaseUrl()}/orders/${id}/payment-status`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify({ paymentStatus })
  });

  return readJsonOrThrow(response, "Cập nhật trạng thái thanh toán thất bại");
}

  async function fetchOrderHistory(id) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/orders/${id}/history`);
    return readJsonOrThrow(response, "Không tải được lịch sử đơn hàng");
  }

  async function fetchInvoice(id) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/orders/${id}/invoice`);
    return readJsonOrThrow(response, "Không tải được hóa đơn");
  }

  function formatOrderStatus(status) {
    switch (status) {
      case "pending": return "Chờ xử lý";
      case "paid": return "Đã thanh toán";
      case "shipping": return "Đang giao";
      case "done": return "Hoàn thành";
      case "cancel": return "Đã hủy";
      default: return status || "";
    }
  }

  namespace.ordersApi = {
    checkout,
    fetchMyOrders,
    fetchAllOrders,
    fetchOrderDetail,
    updateOrderStatus,
    cancelOrder,
    updatePaymentStatus,
    fetchOrderHistory,
    fetchInvoice,
    formatOrderStatus
  };
})(window.HuiLegion);