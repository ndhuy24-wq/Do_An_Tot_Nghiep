(function adminProductsPageModule(namespace) {
  let currentImageValue = "";

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
      const product = await namespace.productsApi.getProductById(id);

      document.getElementById("product-id").value = product.id || "";
      document.getElementById("product-name").value = product.name || "";
      document.getElementById("product-sku").value = product.sku || product.productCode || "";
      document.getElementById("product-price").value = product.price ?? "";
      document.getElementById("product-old-price").value = product.oldPrice ?? "";
      document.getElementById("product-discount").value = typeof product.discount === "string"
        ? parseInt(product.discount.replace(/[^0-9]/g, ""), 10) || ""
        : product.discount ?? "";

      const descEl = document.getElementById("product-desc");
      if (descEl) descEl.value = product.description || "";

      currentImageValue = product.imageUrl || "";
      const previewImg = document.getElementById("product-img-preview");
      if (previewImg && currentImageValue) {
        previewImg.src = currentImageValue;
        previewImg.style.display = "block";
      }

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
      alert("Lỗi tải chi tiết: " + error.message);
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
          alert("Đã xóa sản phẩm!");
          await renderProductTable();
          resetProductForm();
        } catch (error) {
          alert("Lỗi: " + error.message);
        }
      });
    });
  }

  async function renderProductTable() {
    const tbody = document.getElementById("product-table-body");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7">Đang tải...</td></tr>';

    try {
      const products = await namespace.productsApi.listProducts();
      tbody.innerHTML = "";

      products.forEach((product, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>
            ${product.imageUrl
              ? `<img src="${product.imageUrl}" alt="product">`
              : '<div style="width:60px;height:45px;border-radius:6px;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;">No image</div>'}
          </td>
          <td title="${product.name || ""}">${product.name || ""}</td>
          <td>${product.sku || product.productCode || "N/A"}</td>
          <td>${namespace.utils.formatOptionalMoney(product.price)}</td>
          <td>${product.discount || ""}</td>
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
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="7" style="color:red;">Lỗi tải sản phẩm: ${error.message}</td></tr>`;
    }
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

    if (!name || !sku) {
      alert("Vui lòng nhập Tên sản phẩm và SKU.");
      return;
    }

    const payload = {
      name,
      sku,
      price,
      oldPrice,
      discount,
      imageUrl: currentImageValue || "",
      description,
      specs: collectSpecsData()
    };

    try {
      if (id) {
        await namespace.productsApi.updateProduct(id, payload);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await namespace.productsApi.createProduct(payload);
        alert("Thêm sản phẩm thành công!");
      }

      await renderProductTable();
      resetProductForm();
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");
    if (!productForm) return;

    attachSpecFormEvents();
    resetProductForm();
    renderProductTable();

    const fileInput = document.getElementById("product-img-file");
    const previewImg = document.getElementById("product-img-preview");
    fileInput?.addEventListener("change", async function handleImageChange() {
      const file = this.files?.[0];
      if (!file) return;

      try {
        const base64 = await namespace.utils.readImageAsBase64(file);
        currentImageValue = base64;
        if (previewImg) {
          previewImg.src = base64;
          previewImg.style.display = "block";
        }
      } catch (error) {
        alert(error.message || "Không đọc được ảnh.");
      }
    });

    productForm.addEventListener("submit", handleSubmitProduct);
    document.getElementById("btn-reset")?.addEventListener("click", resetProductForm);
  });
})(window.HuiLegion);
