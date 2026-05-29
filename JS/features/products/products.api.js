window.HuiLegion = window.HuiLegion || {};

(function productsApiModule(namespace) {
  async function readJsonOrThrow(response, defaultMessage) {
    const raw = await response.text().catch(() => "");
    const data = namespace.utils.safeJsonParse(raw, {});

    if (!response.ok) {
      throw new Error(data.message || `${defaultMessage} (HTTP ${response.status})`);
    }

    return data;
  }

  async function listProducts() {
    const response = await fetch(`${namespace.getApiBaseUrl()}/products`);
    return readJsonOrThrow(response, "Không tải được danh sách sản phẩm");
  }

  async function getProductById(id) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/products/${id}`);
    return readJsonOrThrow(response, "Không tải được chi tiết sản phẩm");
  }

  async function createProduct(payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return readJsonOrThrow(response, "Thêm sản phẩm thất bại");
  }

  async function updateProduct(id, payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return readJsonOrThrow(response, "Cập nhật sản phẩm thất bại");
  }

  async function deleteProduct(id) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/products/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const raw = await response.text().catch(() => "");
      throw new Error(raw || `Xóa thất bại (HTTP ${response.status})`);
    }
  }

  namespace.productsApi = {
    listProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
  };
})(window.HuiLegion);
