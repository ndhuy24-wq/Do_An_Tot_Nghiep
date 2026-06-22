/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: admin-products.page.js - Xu ly logic phia client (Frontend JavaScript).
 */
(function adminProductsPageModule(namespace) {
  let currentImageValue = "";
  let currentImageUrls = [];
  let allProducts = [];
  let currentPage = 1;
  const pageSize = 8;

  function createSpecRow(key = "", value = "") {
    const container = document.getElementById("product-specs-container");
    if (!container) return;

    const row = document.createElement("div");
    row.className = "form-row spec-row";
    row.innerHTML = `
      <div class="form-group" style="flex: 0 0 35%;">
        <label>Thông số</label>
        <input type="text" class="spec-key" placeholder="VD: CPU" value="${key}">
      </div>
      <div class="form-group" style="flex: 1;">
        <label>Giá trị</label>
        <input type="text" class="spec-value" placeholder="VD: Core i7" value="${value}">
      </div>
      <button type="button" class="btn btn-secondary remove-spec-btn" style="width:40px;height:40px;margin-top:25px">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    container.appendChild(row);
  }

  function collectSpecsData() {
    const specs = [];
    document.querySelectorAll("#product-specs-container .spec-row").forEach((row) => {
      const key = row.querySelector(".spec-key")?.value?.trim();
      const value = row.querySelector(".spec-value")?.value?.trim();
      if (key && value) {
        specs.push({ specKey: key, specValue: value });
      }
    });
    return specs;
  }

  function attachSpecFormEvents() {
    document.getElementById("btn-add-spec")?.addEventListener("click", () => createSpecRow());

    document.getElementById("product-specs-container")?.addEventListener("click", (event) => {
      if (event.target.closest(".remove-spec-btn")) {
        event.target.closest(".spec-row")?.remove();
      }
    });
  }

  function resetProductForm() {
    document.getElementById("product-id").value = "";
    document.getElementById("product-name").value = "";
    document.getElementById("product-sku").value = "";
    document.getElementById("product-price").value = "";
    document.getElementById("product-old-price").value = "";
    document.getElementById("product-discount").value = "";
    const stockEl = document.getElementById("product-stock");
    if (stockEl) stockEl.value = "";

    const descEl = document.getElementById("product-desc");
    if (descEl) descEl.value = "";

    currentImageValue = "";
    currentImageUrls = [];
    const fileInput = document.getElementById("product-img-file");
    if (fileInput) fileInput.value = "";

    const previewImg = document.getElementById("product-img-preview");
    if (previewImg) {
      previewImg.src = "";
      previewImg.style.display = "none";
    }
    const listPreview = document.getElementById("product-img-list-preview");
    if (listPreview) listPreview.innerHTML = "";

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
      const product = await namespace.productsApi.getProductById(id);

      document.getElementById("product-id").value = product.id || "";
      document.getElementById("product-name").value = product.name || "";
      document.getElementById("product-sku").value = product.sku || product.productCode || "";
      document.getElementById("product-price").value = product.price ?? "";
      document.getElementById("product-old-price").value = product.oldPrice ?? "";
      document.getElementById("product-discount").value = typeof product.discount === "string"
        ? parseInt(product.discount.replace(/[^0-9]/g, ""), 10) || ""
        : product.discount ?? "";
      const stockEl = document.getElementById("product-stock");
      if (stockEl) stockEl.value = product.stockQuantity ?? "";

      const descEl = document.getElementById("product-desc");
      if (descEl) descEl.value = product.description || "";

      currentImageUrls = Array.isArray(product.imageUrls) && product.imageUrls.length ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : []);
      currentImageValue = currentImageUrls[0] || product.imageUrl || "";
      const previewImg = document.getElementById("product-img-preview");
      if (previewImg && currentImageValue) {
        previewImg.src = namespace.utils.resolveAssetUrl(currentImageValue);
        previewImg.style.display = "block";
      }
      renderImageListPreview();

      const specsContainer = document.getElementById("product-specs-container");
      if (specsContainer) {
        specsContainer.innerHTML = "";
        if (product.specs?.length) {
          product.specs.forEach((spec) => createSpecRow(spec.specKey, spec.specValue));
        } else {
          createSpecRow("CPU", "");
          createSpecRow("RAM", "");
          createSpecRow("VGA", "");
        }
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      namespace.toast.error("Lỗi tải chi tiết: " + error.message);
    }
  }

  function attachProductRowEvents() {
    document.querySelectorAll("#product-table-body .badge-edit").forEach((button) => {
      button.addEventListener("click", () => fillProductForm(button.dataset.id));
    });

    document.querySelectorAll("#product-table-body .badge-delete").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        if (!confirm(`Bạn có chắc muốn xóa sản phẩm ID ${id}?`)) return;

        try {
          await namespace.productsApi.deleteProduct(id);
          namespace.toast.success("Đã xóa sản phẩm!");
          await renderProductTable();
          resetProductForm();
        } catch (error) {
          namespace.toast.error("Lỗi: " + error.message);
        }
      });
    });
  }

  function renderProductPagination(totalItems) {
    const el = document.getElementById("product-pagination");
    if (!el) return;

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    el.innerHTML = `
      <button class="btn btn-secondary" id="product-prev-page" ${currentPage <= 1 ? "disabled" : ""}>Trước</button>
      <span class="pagination-info">Trang ${currentPage}/${totalPages}</span>
      <button class="btn btn-secondary" id="product-next-page" ${currentPage >= totalPages ? "disabled" : ""}>Sau</button>
    `;

    document.getElementById("product-prev-page")?.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderProductTable(false);
      }
    });

    document.getElementById("product-next-page")?.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderProductTable(false);
      }
    });
  }

  function getAdminFilteredProducts() {
    const keyword = document.getElementById("admin-product-keyword")?.value?.trim()?.toLowerCase() || "";
    const minPriceRaw = document.getElementById("admin-product-min")?.value || "";
    const maxPriceRaw = document.getElementById("admin-product-max")?.value || "";
    const stockFilter = document.getElementById("admin-product-stock")?.value || "";
    const minPrice = minPriceRaw === "" ? null : Number(minPriceRaw);
    const maxPrice = maxPriceRaw === "" ? null : Number(maxPriceRaw);

    return allProducts.filter((product) => {
      const text = `${product.name || ""} ${product.sku || ""} ${product.productCode || ""} ${product.description || ""}`.toLowerCase();
      const price = Number(product.price || 0);
      const stock = Number(product.stockQuantity || 0);

      const matchesKeyword = !keyword || text.includes(keyword);
      const matchesMin = minPrice === null || price >= minPrice;
      const matchesMax = maxPrice === null || price <= maxPrice;
      const matchesStock = !stockFilter ||
        (stockFilter === "in_stock" && stock > 0) ||
        (stockFilter === "out_stock" && stock <= 0);

      return matchesKeyword && matchesMin && matchesMax && matchesStock;
    });
  }

  async function renderProductTable(shouldReload = true) {
    const tbody = document.getElementById("product-table-body");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8">Đang tải...</td></tr>';

    try {
      if (shouldReload) {
        allProducts = await namespace.productsApi.listProducts();
      }

      const filteredProducts = getAdminFilteredProducts();
      const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      const start = (currentPage - 1) * pageSize;
      const products = filteredProducts.slice(start, start + pageSize);
      tbody.innerHTML = "";

      products.forEach((product, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${start + index + 1}</td>
          <td>
            ${product.imageUrl
              ? `<img src="${namespace.utils.resolveAssetUrl(product.imageUrl)}" alt="product">`
              : '<div style="width:60px;height:45px;border-radius:6px;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;">No image</div>'}
          </td>
          <td title="${product.name || ""}">${product.name || ""}</td>
          <td>${product.sku || product.productCode || "N/A"}</td>
          <td>${namespace.utils.formatOptionalMoney(product.price)}</td>
          <td>${product.discount || ""}</td>
          <td>${product.stockQuantity ?? 0}</td>
          <td>
            <div class="table-actions">
              <button class="badge-action badge-edit" data-id="${product.id}">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="badge-action badge-delete" data-id="${product.id}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      attachProductRowEvents();
      renderProductPagination(filteredProducts.length);
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="8" style="color:red;">Lỗi tải sản phẩm: ${error.message}</td></tr>`;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function downloadCsv(filename, rows) {
    const csv = rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportProductsExcel() {
    const rows = [["STT", "Tên sản phẩm", "SKU", "Giá", "Giá cũ", "Giảm giá", "Mô tả"]];
    allProducts.forEach((product, index) => rows.push([
      index + 1, product.name || "", product.sku || "", product.price || 0, product.oldPrice || 0, product.discount || 0, product.description || ""
    ]));
    downloadCsv("danh-sach-san-pham.csv", rows);
    namespace.toast.success("Đã xuất file Excel/CSV sản phẩm");
  }

  function exportProductsPdf() {
    const rows = allProducts.map((product, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(product.name || "")}</td>
        <td>${escapeHtml(product.sku || "")}</td>
        <td>${namespace.utils.formatMoney(product.price || 0)}</td>
        <td>${escapeHtml(String(product.discount || ""))}</td>
      </tr>
    `).join("");

    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Danh sách sản phẩm</title>
      <style>body{font-family:Arial;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}</style>
      </head><body>
      <h1>Danh sách sản phẩm - HUI LEGION</h1>
      <table>
        <thead><tr><th>STT</th><th>Tên sản phẩm</th><th>SKU</th><th>Giá</th><th>Giảm giá</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }

  function renderImageListPreview() {
    const listPreview = document.getElementById("product-img-list-preview");
    if (!listPreview) return;
    listPreview.innerHTML = currentImageUrls.map((url) => `
      <img src="${namespace.utils.resolveAssetUrl(url)}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;border:1px solid #eee;">
    `).join("");
  }

  async function handleSubmitProduct(event) {
    event.preventDefault();

    const id = document.getElementById("product-id").value;
    const name = document.getElementById("product-name").value.trim();
    const sku = document.getElementById("product-sku").value.trim();
    const price = parseInt(document.getElementById("product-price").value, 10) || 0;
    const oldPrice = parseInt(document.getElementById("product-old-price").value, 10) || 0;
    const discount = parseInt(document.getElementById("product-discount").value, 10) || 0;
    const description = document.getElementById("product-desc")?.value?.trim() || "";
    const stockQuantity = parseInt(document.getElementById("product-stock")?.value, 10) || 0;

    if (!name || !sku) {
      namespace.toast.warning("Vui lòng nhập Tên sản phẩm và SKU.");
      return;
    }

    const payload = {
      name,
      sku,
      price,
      oldPrice,
      discount,
      imageUrl: currentImageValue || "",
      imageUrls: currentImageUrls.length ? currentImageUrls : (currentImageValue ? [currentImageValue] : []),
      stockQuantity,
      description,
      specs: collectSpecsData()
    };

    try {
      if (id) {
        await namespace.productsApi.updateProduct(id, payload);
        namespace.toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await namespace.productsApi.createProduct(payload);
        namespace.toast.success("Thêm sản phẩm thành công!");
      }

      await renderProductTable();
      resetProductForm();
    } catch (error) {
      namespace.toast.error("Lỗi: " + error.message);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");
    if (!productForm) return;

    attachSpecFormEvents();
    resetProductForm();
    renderProductTable();

    document.getElementById("btn-admin-product-filter")?.addEventListener("click", () => {
      currentPage = 1;
      renderProductTable(false);
    });
    ["admin-product-keyword", "admin-product-min", "admin-product-max"].forEach((id) => {
      document.getElementById(id)?.addEventListener("input", () => {
        currentPage = 1;
        renderProductTable(false);
      });
    });
    document.getElementById("admin-product-stock")?.addEventListener("change", () => {
      currentPage = 1;
      renderProductTable(false);
    });

    document.getElementById("btn-export-products-excel")?.addEventListener("click", exportProductsExcel);
    document.getElementById("btn-export-products-pdf")?.addEventListener("click", exportProductsPdf);

    const fileInput = document.getElementById("product-img-file");
    const previewImg = document.getElementById("product-img-preview");
    fileInput?.addEventListener("change", async function handleImageChange() {
      const files = Array.from(this.files || []);
      if (!files.length) return;

      try {
        let imageUrls = [];
        try {
          const uploaded = files.length > 1
            ? await namespace.productsApi.uploadImages(files)
            : await namespace.productsApi.uploadImage(files[0]);
          imageUrls = uploaded.imageUrls || (uploaded.imageUrl ? [uploaded.imageUrl] : []);
        } catch (uploadError) {
          imageUrls = [];
          for (const file of files) {
            imageUrls.push(await namespace.utils.readImageAsBase64(file));
          }
        }

        currentImageUrls = imageUrls;
        currentImageValue = imageUrls[0] || "";
        if (previewImg && currentImageValue) {
          previewImg.src = namespace.utils.resolveAssetUrl(currentImageValue);
          previewImg.style.display = "block";
        }
        renderImageListPreview();
      } catch (error) {
        namespace.toast.error(error.message || "Không đọc được ảnh.");
      }
    });

    productForm.addEventListener("submit", handleSubmitProduct);
    document.getElementById("btn-reset")?.addEventListener("click", resetProductForm);
  });
})(window.HuiLegion);
