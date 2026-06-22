/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: admin.js - Xu ly logic phia client (Frontend JavaScript).
 */
// JS/admin.js
(() => {
  const API_BASE_URL =
    window.API_BASE_URL ||
    (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
    "http://localhost:8080/api";

  let currentImageValue = "";

  function formatVnd(num) {
    if (num === null || num === undefined) return "";
    return Number(num).toLocaleString("vi-VN") + "đ";
  }

  function readImageAsBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(file);
  }

  /* ================== SPECS ================== */
  function createSpecRow(key = "", value = "") {
    const container = document.getElementById("product-specs-container");
    if (!container) return;

    const div = document.createElement("div");
    div.className = "form-row spec-row";
    div.innerHTML = `
      <div class="form-group" style="flex: 0 0 35%;">
        <label>Thông số</label>
        <input type="text" class="spec-key" placeholder="VD: CPU" value="${key}">
      </div>
      <div class="form-group" style="flex: 1;">
        <label>Giá trị</label>
        <input type="text" class="spec-value" placeholder="VD: Core i7" value="${value}">
      </div>
      <button type="button" class="btn btn-secondary remove-spec-btn"
        style="width:40px;height:40px;margin-top:25px">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    container.appendChild(div);
  }

  function collectSpecsData() {
    const specs = [];
    document.querySelectorAll("#product-specs-container .spec-row").forEach((row) => {
      const key = row.querySelector(".spec-key")?.value?.trim();
      const value = row.querySelector(".spec-value")?.value?.trim();
      if (key && value) specs.push({ specKey: key, specValue: value });
    });
    return specs;
  }

  function attachSpecFormEvents() {
    document.getElementById("btn-add-spec")?.addEventListener("click", () => createSpecRow("", ""));

    document.getElementById("product-specs-container")?.addEventListener("click", (e) => {
      if (e.target.closest(".remove-spec-btn")) {
        e.target.closest(".spec-row")?.remove();
      }
    });
  }

  /* ================== API ================== */
  async function apiGetProducts() {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error("Không tải được danh sách sản phẩm");
    return res.json();
  }

  async function apiGetProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error("Không tải được chi tiết sản phẩm");
    return res.json();
  }

  async function apiCreateProduct(payload) {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Thêm sản phẩm thất bại");
    }
    return res.json();
  }

  async function apiUpdateProduct(id, payload) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Cập nhật sản phẩm thất bại");
    }
    return res.json();
  }

  async function apiDeleteProduct(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: "DELETE" });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Xóa thất bại (HTTP ${res.status}) ${errText}`);
  }
}


  /* ================== UI: TABLE ================== */
  async function renderProductTable() {
    const tbody = document.getElementById("product-table-body");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7">Đang tải...</td></tr>`;

    try {
      const products = await apiGetProducts();
      tbody.innerHTML = "";

      products.forEach((p, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>
            ${
              p.imageUrl
                ? `<img src="${p.imageUrl}" alt="product">`
                : `<div style="width:60px;height:45px;border-radius:6px;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;">No image</div>`
            }
          </td>
          <td title="${p.name || ""}">${p.name || ""}</td>
          <td>${p.sku || p.productCode || "N/A"}</td>
          <td>${formatVnd(p.price)}</td>
          <td>${p.discount || ""}</td>
          <td>
            <div class="table-actions">
              <button class="badge-action badge-edit" data-id="${p.id}">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="badge-action badge-delete" data-id="${p.id}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      attachProductRowEvents();
    } catch (e) {
      console.error(e);
      tbody.innerHTML = `<tr><td colspan="7" style="color:red;">Lỗi tải sản phẩm: ${e.message}</td></tr>`;
    }
  }

  function resetProductForm() {
    document.getElementById("product-id").value = "";
    document.getElementById("product-name").value = "";
    document.getElementById("product-sku").value = "";
    document.getElementById("product-price").value = "";
    document.getElementById("product-old-price").value = "";
    document.getElementById("product-discount").value = "";

    const descEl = document.getElementById("product-desc");
    if (descEl) descEl.value = "";

    currentImageValue = "";
    const fileInput = document.getElementById("product-img-file");
    if (fileInput) fileInput.value = "";

    const previewImg = document.getElementById("product-img-preview");
    if (previewImg) {
      previewImg.src = "";
      previewImg.style.display = "none";
    }

    const specsContainer = document.getElementById("product-specs-container");
    if (specsContainer) {
      specsContainer.innerHTML = "";
      createSpecRow("CPU", "Chưa có thông tin");
      createSpecRow("RAM", "Chưa có thông tin");
      createSpecRow("VGA", "Chưa có thông tin");
    }
  }

  async function fillProductForm(id) {
    try {
      const p = await apiGetProduct(id);

      document.getElementById("product-id").value = p.id;
      document.getElementById("product-name").value = p.name || "";
      document.getElementById("product-sku").value = p.sku || p.productCode || "";
      document.getElementById("product-price").value = p.price ?? "";
      document.getElementById("product-old-price").value = p.oldPrice ?? "";

      // discount có thể là "-22%" hoặc 22
      const discountVal =
        typeof p.discount === "string"
          ? parseInt(p.discount.replace(/[^0-9]/g, ""), 10) || ""
          : (p.discount ?? "");
      document.getElementById("product-discount").value = discountVal;

      const descEl = document.getElementById("product-desc");
      if (descEl) descEl.value = p.description || "";

      currentImageValue = p.imageUrl || "";
      const previewImg = document.getElementById("product-img-preview");
      if (previewImg && currentImageValue) {
        previewImg.src = currentImageValue;
        previewImg.style.display = "block";
      }

      const specsContainer = document.getElementById("product-specs-container");
      if (specsContainer) {
        specsContainer.innerHTML = "";
        if (p.specs && p.specs.length) {
          p.specs.forEach((s) => createSpecRow(s.specKey, s.specValue));
        } else {
          createSpecRow("CPU", "");
          createSpecRow("RAM", "");
          createSpecRow("VGA", "");
        }
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      alert("Lỗi tải chi tiết: " + e.message);
    }
  }

  function attachProductRowEvents() {
    document.querySelectorAll("#product-table-body .badge-edit").forEach((btn) => {
      btn.addEventListener("click", () => fillProductForm(btn.dataset.id));
    });

    document.querySelectorAll("#product-table-body .badge-delete").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm(`Bạn có chắc muốn xóa sản phẩm ID ${id}?`)) return;
        try {
          await apiDeleteProduct(id);
          alert("Đã xóa sản phẩm!");
          await renderProductTable();
          resetProductForm();
        } catch (e) {
          alert("Lỗi: " + e.message);
        }
      });
    });
  }

  async function handleSubmitProduct(e) {
    e.preventDefault();

    const id = document.getElementById("product-id").value;

    const name = document.getElementById("product-name").value.trim();
    const sku = document.getElementById("product-sku").value.trim();
    const price = parseInt(document.getElementById("product-price").value, 10) || 0;
    const oldPrice = parseInt(document.getElementById("product-old-price").value, 10) || 0;
    const discount = parseInt(document.getElementById("product-discount").value, 10) || 0;
    const desc = document.getElementById("product-desc")?.value?.trim() || "";

    if (!name || !sku) {
      alert("Vui lòng nhập Tên sản phẩm và SKU.");
      return;
    }

    const specs = collectSpecsData();

    const payload = {
      name,
      sku,
      price,
      oldPrice,
      discount,
      imageUrl: currentImageValue || "",
      description: desc,
      specs,
    };

    try {
      if (id) {
        await apiUpdateProduct(id, payload);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await apiCreateProduct(payload);
        alert("Thêm sản phẩm thành công!");
      }

      await renderProductTable();
      resetProductForm();
    } catch (e) {
      console.error(e);
      alert("Lỗi: " + e.message);
    }
  }

  function initProductsPage() {
    const productForm = document.getElementById("product-form");
    if (!productForm) return;

    attachSpecFormEvents();
    resetProductForm();
    renderProductTable();

    // file image preview
    const fileInput = document.getElementById("product-img-file");
    const previewImg = document.getElementById("product-img-preview");
    if (fileInput && previewImg) {
      fileInput.addEventListener("change", function () {
        const file = this.files?.[0];
        if (!file) return;
        readImageAsBase64(file, (base64) => {
          currentImageValue = base64;
          previewImg.src = base64;
          previewImg.style.display = "block";
        });
      });
    }

    productForm.addEventListener("submit", handleSubmitProduct);
    document.getElementById("btn-reset")?.addEventListener("click", resetProductForm);
  }

  document.addEventListener("DOMContentLoaded", initProductsPage);
})();
