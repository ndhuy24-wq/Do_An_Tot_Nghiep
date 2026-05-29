window.HuiLegion = window.HuiLegion || {};

(function cartApiModule(namespace) {
  async function readJsonOrThrow(response, defaultMessage) {
    const raw = await response.text().catch(() => "");
    const data = namespace.utils.safeJsonParse(raw, {});

    if (!response.ok) {
      throw new Error(data.message || `${defaultMessage} (HTTP ${response.status})`);
    }

    return data;
  }

  async function addItem(userEmail, productId, quantity) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/cart/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: namespace.utils.normalizeEmail(userEmail),
        productId,
        quantity
      })
    });

    return readJsonOrThrow(response, "Thêm vào giỏ thất bại.");
  }

  async function getCart(email) {
    const response = await fetch(
      `${namespace.getApiBaseUrl()}/cart?email=${encodeURIComponent(namespace.utils.normalizeEmail(email))}`
    );
    return readJsonOrThrow(response, "Không tải được giỏ hàng.");
  }

  async function updateQuantity(email, productId, quantity) {
    const response = await fetch(
      `${namespace.getApiBaseUrl()}/cart/items/${productId}?email=${encodeURIComponent(namespace.utils.normalizeEmail(email))}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity })
      }
    );

    return readJsonOrThrow(response, "Cập nhật số lượng thất bại.");
  }

  async function removeItem(email, productId) {
    const response = await fetch(
      `${namespace.getApiBaseUrl()}/cart/items/${productId}?email=${encodeURIComponent(namespace.utils.normalizeEmail(email))}`,
      { method: "DELETE" }
    );

    return readJsonOrThrow(response, "Xóa sản phẩm khỏi giỏ thất bại.");
  }

  async function clearCart(email) {
    const response = await fetch(
      `${namespace.getApiBaseUrl()}/cart?email=${encodeURIComponent(namespace.utils.normalizeEmail(email))}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error("Xóa giỏ hàng thất bại.");
    }
  }

  namespace.cartApi = {
    addItem,
    getCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
})(window.HuiLegion);
