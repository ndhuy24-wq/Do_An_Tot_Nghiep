(function productsPageModule(namespace) {
  function tryGetLoginUser() {
    const user = namespace.session?.getCurrentUser?.();
    return user?.email ? user : null;
  }

  function qs(root, selector) {
    return (root || document).querySelector?.(selector) || document.querySelector(selector);
  }

  function createProductBoxHtml(product) {
    const discountVal = String(product.discount || "").replace("-", "").replace("%", "").trim();
    const discountText = (discountVal && discountVal !== "0") ? `-${discountVal}%` : "";
    const discountHtml = discountText ? `<span class="discount">${discountText}</span>` : "";
    const oldPriceHtml = product.oldPrice && Number(product.oldPrice) > 0
      ? `<span>${namespace.utils.formatOptionalMoney(product.oldPrice)}</span>`
      : "";
    const stockQuantity = Number(product.stockQuantity ?? 0);
    const stockHtml = stockQuantity > 0
      ? `<div class="product-stock" style="font-size:13px;color:#16a34a;font-weight:700;margin-top:6px;">Còn ${stockQuantity} sản phẩm</div>`
      : `<div class="product-stock" style="font-size:13px;color:#dc2626;font-weight:700;margin-top:6px;">Hết hàng</div>`;

    return `
      <div class="box" data-id="${product.id}">
        ${discountHtml}
        <div class="image">
          <img
            src="${namespace.utils.resolveAssetUrl(product.imageUrl)}"
            alt="${product.name || ""}"
          >
          <div class="icons">
            <a href="product_detail.html?id=${product.id}" class="detail-btn">Chi tiết sản phẩm</a>
            <a href="#" class="add-cart-btn ${stockQuantity <= 0 ? "is-disabled" : ""}">Thêm vào giỏ hàng</a>
            <a href="#" class="fas fa-share"></a>
          </div>
        </div>
        <div class="content">
          <h3 title="${product.name || ""}">${product.name || ""}</h3>
          <div class="price">
            ${namespace.utils.formatOptionalMoney(product.price)}
            ${oldPriceHtml}
          </div>
          ${stockHtml}
        </div>
      </div>
    `;
  }

  function setupProductEvents(root) {
    root.querySelectorAll(".box").forEach((box) => {
      const buttonAdd = box.querySelector(".add-cart-btn");
      const productId = Number(box.dataset.id);

      buttonAdd?.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (buttonAdd.classList.contains("is-disabled")) {
          namespace.toast.warning("Sản phẩm này đang hết hàng.");
          return;
        }

        const user = tryGetLoginUser();
        if (!user) {
          namespace.toast.warning("Vui lòng đăng nhập để thêm vào giỏ hàng.");
          setTimeout(() => { window.location.href = "login.html"; }, 700);
          return;
        }

        try {
          const cartDto = await namespace.cartApi.addItem(user.email, productId, 1);
          namespace.toast.success(`Đã thêm vào giỏ hàng! (Tổng: ${cartDto.totalItems ?? "?"})`);
        } catch (error) {
          namespace.toast.error("Lỗi: " + (error.message || "Thêm vào giỏ thất bại"));
        }
      });
    });
  }

  function getProductFilters(root = document) {
    return {
      keyword: qs(root, "#product-search-keyword")?.value?.trim() || "",
      minPrice: qs(root, "#product-search-min")?.value || "",
      maxPrice: qs(root, "#product-search-max")?.value || "",
      sort: qs(root, "#product-search-sort")?.value || ""
    };
  }

  async function loadAndRenderProducts(root = document) {
    const productsSection =
      root.querySelector?.(".products .box-container") ||
      root.querySelector?.("#products .box-container") ||
      root.querySelector?.(".box-container") ||
      document.querySelector(".products .box-container");

    if (!productsSection) return;

    productsSection.innerHTML = '<div style="text-align:center;padding:20px;">Đang tải sản phẩm...</div>';

    try {
      const products = await namespace.productsApi.listProducts(getProductFilters(root));

      if (!Array.isArray(products) || products.length === 0) {
        productsSection.innerHTML = '<div style="text-align:center;padding:20px;">Không tìm thấy sản phẩm phù hợp.</div>';
        return;
      }

      productsSection.innerHTML = products.map(createProductBoxHtml).join("");
      setupProductEvents(productsSection);
    } catch (error) {
      productsSection.innerHTML = `<div style="text-align:center;padding:20px;color:red;">Lỗi tải dữ liệu: ${error.message}</div>`;
    }
  }

  function bindProductFilters(root = document) {
    const filterRoot = root || document;
    const searchButton = qs(filterRoot, "#btn-product-search");
    if (searchButton?.dataset.bound === "1") return;
    if (searchButton) {
      searchButton.dataset.bound = "1";
      searchButton.addEventListener("click", () => loadAndRenderProducts(filterRoot));
    }

    ["#product-search-keyword", "#product-search-min", "#product-search-max"].forEach((selector) => {
      const input = qs(filterRoot, selector);
      if (!input || input.dataset.bound === "1") return;
      input.dataset.bound = "1";
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          loadAndRenderProducts(filterRoot);
        }
      });
      input.addEventListener("input", () => {
        clearTimeout(input._filterTimer);
        input._filterTimer = setTimeout(() => loadAndRenderProducts(filterRoot), 450);
      });
    });

    const sortSelect = qs(filterRoot, "#product-search-sort");
    if (sortSelect && sortSelect.dataset.bound !== "1") {
      sortSelect.dataset.bound = "1";
      sortSelect.addEventListener("change", () => loadAndRenderProducts(filterRoot));
    }
  }

  namespace.pages = namespace.pages || {};
  namespace.pages.products = { loadAndRenderProducts, setupProductEvents, bindProductFilters };
  window.loadAndRenderProducts = loadAndRenderProducts;
  window.bindProductFilters = bindProductFilters;

  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".products .box-container")) {
      bindProductFilters(document);
      loadAndRenderProducts(document);
    }
  });
})(window.HuiLegion);
