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

  // ================== CHECKOUT ==================
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

  // ================== HỦY ĐƠN ==================
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

  // ================== LẤY DANH SÁCH ==================
  async function fetchMyOrders(email) {
    const response = await fetch(
      `${namespace.getApiBaseUrl()}/orders?email=${encodeURIComponent(namespace.utils.normalizeEmail(email))}`
    );
    return readJsonOrThrow(response, "Không tải được đơn hàng");
  }

  async function fetchAllOrders() {
    const response = await fetch(`${namespace.getApiBaseUrl()}/orders`);
    return readJsonOrThrow(response, "Không tải được danh sách đơn hàng");
  }

  async function fetchOrderDetail(id) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/orders/${id}`);
    return readJsonOrThrow(response, "Không tải được chi tiết đơn");
  }

  // ================== UPDATE TRẠNG THÁI ĐƠN ==================
  async function updateOrderStatus(id, status) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    return readJsonOrThrow(response, "Cập nhật trạng thái thất bại");
  }


  async function updatePaymentStatus(id, paymentStatus) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/orders/${id}/payment-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus })
    });

    return readJsonOrThrow(response, "Cập nhật thanh toán thất bại");
  }

  // ================== FORMAT ==================
  function formatOrderStatus(status) {
    switch (status) {
      case "pending": return "Chờ xử lý";
      case "shipping": return "Đang giao";
      case "done": return "Hoàn thành";
      case "cancel": return "Đã hủy";
      default: return status || "";
    }
  }

  // ================== EXPORT ==================
  namespace.ordersApi = {
    checkout,
    fetchMyOrders,
    fetchAllOrders,
    fetchOrderDetail,
    updateOrderStatus,
    updatePaymentStatus, // ✅ thêm dòng này
    cancelOrder,
    formatOrderStatus
  };

})(window.HuiLegion);