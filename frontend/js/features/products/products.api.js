window.HuiLegion = window.HuiLegion || {};

(function productsApiModule(namespace) {
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
      throw new Error(data.message || `${defaultMessage} (HTTP ${response.status})`);
    }

    return data;
  }

  async function listProducts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.keyword) params.set("keyword", filters.keyword);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.sort) params.set("sort", filters.sort);
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${namespace.getApiBaseUrl()}/products${query}`);
    return readJsonOrThrow(response, "Không tải được danh sách sản phẩm");
  }

  async function getProductById(id) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/products/${id}`);
    return readJsonOrThrow(response, "Không tải được chi tiết sản phẩm");
  }

  function authHeaders() {
    const token = localStorage.getItem("hui_legion_access_token") || "";
    return token ? { "Authorization": `Bearer ${token}` } : {};
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${namespace.getApiBaseUrl()}/products/upload-image`, {
      method: "POST",
      headers: authHeaders(),
      body: formData
    });
    return readJsonOrThrow(response, "Upload ảnh thất bại");
  }

  async function uploadImages(files) {
    const formData = new FormData();
    Array.from(files || []).forEach((file) => formData.append("files", file));
    const response = await fetch(`${namespace.getApiBaseUrl()}/products/upload-images`, {
      method: "POST",
      headers: authHeaders(),
      body: formData
    });
    return readJsonOrThrow(response, "Upload nhiều ảnh thất bại");
  }

  async function createProduct(payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/products`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(payload)
    });

    return readJsonOrThrow(response, "Thêm sản phẩm thất bại");
  }

  async function updateProduct(id, payload) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/products/${id}`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify(payload)
    });

    return readJsonOrThrow(response, "Cập nhật sản phẩm thất bại");
  }

  async function deleteProduct(id) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/products/${id}`, {
      method: "DELETE",
      headers: adminHeaders()
    });

    if (!response.ok) {
      const raw = await response.text().catch(() => "");
      throw new Error(raw || `Xóa thất bại (HTTP ${response.status})`);
    }
  }

  namespace.productsApi = {
    listProducts,
    getProductById,
    uploadImage,
    uploadImages,
    createProduct,
    updateProduct,
    deleteProduct
  };
})(window.HuiLegion);
