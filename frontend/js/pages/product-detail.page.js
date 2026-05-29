(function productDetailPageModule(namespace) {
  function requireLoginUser() {
    const user = namespace.session?.getCurrentUser?.();
    if (!user?.email) {
      throw new Error("Vui lòng đăng nhập để mua hàng.");
    }
    return user;
  }

  function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function createRelatedProductBoxHtml(product) {
    const discountHtml = product.discount ? `<span class="discount">${product.discount}</span>` : "";
    const oldPriceHtml = product.oldPrice && Number(product.oldPrice) > 0
      ? `<span>${namespace.utils.formatOptionalMoney(product.oldPrice)}</span>`
      : "";

    return `
      <div class="box" data-id="${product.id}">
        ${discountHtml}
        <div class="image">
          <img src="${namespace.utils.resolveAssetUrl(product.imageUrl)}" alt="${product.name || ""}">
          <div class="icons">
            <a href="product_detail.html?id=${product.id}" class="detail-btn">Chi tiết sản phẩm</a>
            <a href="#" class="add-cart-btn">Thêm vào giỏ hàng</a>
            <a href="#" class="fas fa-share"></a>
          </div>
        </div>
        <div class="content">
          <h3 title="${product.name || ""}">${product.name || ""}</h3>
          <div class="price">
            ${namespace.utils.formatOptionalMoney(product.price)}
            ${oldPriceHtml}
          </div>
        </div>
      </div>
    `;
  }

  function renderSpecs(product) {
    const specTableEl = document.querySelector("#tab-spec .spec-table");
    if (!specTableEl) return;

    if (product.specs?.length) {
      specTableEl.innerHTML = product.specs.map((spec) => `
        <tr>
          <th>${spec.specKey}</th>
          <td>${spec.specValue}</td>
        </tr>
      `).join("");
      return;
    }

    specTableEl.innerHTML = '<tr><td colspan="2">Chưa có thông số cấu hình chi tiết.</td></tr>';
  }

  function setupTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.dataset.tab;
        tabButtons.forEach((item) => item.classList.remove("active"));
        tabContents.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(targetId)?.classList.add("active");
      });
    });
  }

  function setupQuantityControl() {
    const qtyInput = document.querySelector(".qty-control input");
    const qtyButtons = document.querySelectorAll(".qty-control .qty-btn");

    qtyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        let value = parseInt(qtyInput?.value, 10) || 1;
        if (button.textContent.trim() === "+") value += 1;
        if (button.textContent.trim() === "-" && value > 1) value -= 1;
        if (qtyInput) qtyInput.value = value;
      });
    });

    return qtyInput;
  }

  function renderProduct(product) {
    const titleEl = document.querySelector(".product-title");
    if (titleEl) titleEl.textContent = product.name || "";
    document.title = `${product.name || "Sản phẩm"} - Chi Tiết Sản Phẩm`;

    const mainImgEl = document.querySelector(".product-main-image img");
    if (mainImgEl) mainImgEl.src = namespace.utils.resolveAssetUrl(product.imageUrl);

    const discountBadge = document.querySelector(".discount-badge");
    if (discountBadge) {
      discountBadge.textContent = product.discount || "";
      discountBadge.style.display = product.discount ? "block" : "none";
    }

    const skuEl = document.querySelector(".product-sku");
    if (skuEl) skuEl.textContent = product.sku || product.productCode || "N/A";

    const priceNowEl = document.querySelector(".product-price-block .price-now");
    if (priceNowEl) priceNowEl.textContent = namespace.utils.formatOptionalMoney(product.price);

    const priceOldEl = document.querySelector(".product-price-block .price-old");
    if (priceOldEl) {
      priceOldEl.textContent = product.oldPrice ? namespace.utils.formatOptionalMoney(product.oldPrice) : "";
    }

    const savingEl = document.querySelector(".product-price-block .saving");
    if (savingEl && product.oldPrice && product.price) {
      const saving = product.oldPrice - product.price;
      savingEl.textContent = saving > 0 ? `Tiết kiệm ${namespace.utils.formatOptionalMoney(saving)}` : "";
    }

    const descriptionContainer = document.querySelector("#tab-des p");
    if (descriptionContainer) {
      descriptionContainer.textContent = product.description || "Sản phẩm này chưa có mô tả chi tiết.";
    }

    renderSpecs(product);
  }

  function setupRelatedProductEvents(root) {
    root.querySelectorAll(".box").forEach((box) => {
      const buttonAdd = box.querySelector(".add-cart-btn");
      const productId = Number(box.dataset.id);

      buttonAdd?.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        let user;
        try {
          user = requireLoginUser();
        } catch (error) {
          namespace.toast.error(error.message);
          window.location.href = "login.html";
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

  async function loadRelatedProducts(currentProductId) {
    const relatedContainer = document.querySelector(".related-products-list");
    const relatedSection = document.querySelector(".related-products-section");
    if (!relatedContainer || !relatedSection) return;

    try {
      const products = await namespace.productsApi.listProducts();
      const relatedProducts = (Array.isArray(products) ? products : [])
        .filter((item) => Number(item.id) !== Number(currentProductId))
        .slice(0, 4);

      if (!relatedProducts.length) {
        relatedContainer.innerHTML = '<div class="related-products-empty">Hiện chưa có sản phẩm gợi ý khác.</div>';
        return;
      }

      relatedContainer.innerHTML = relatedProducts.map(createRelatedProductBoxHtml).join("");
      setupRelatedProductEvents(relatedContainer);
    } catch (error) {
      relatedContainer.innerHTML = `<div class="related-products-empty">Không tải được sản phẩm gợi ý: ${error.message}</div>`;
    }
  }

  async function loadAndRenderProductDetail() {
    const productId = getProductIdFromUrl();
    if (!productId) {
      namespace.toast.error("Không tìm thấy mã sản phẩm trong URL.");
      return;
    }

    try {
      const product = await namespace.productsApi.getProductById(productId);
      renderProduct(product);
      setupTabs();
      const qtyInput = setupQuantityControl();
      await loadRelatedProducts(product.id);

      const addCartBtn = document.querySelector(".product-actions .btn.btn-primary");
      addCartBtn?.addEventListener("click", async (event) => {
        event.preventDefault();

        let user;
        try {
          user = requireLoginUser();
        } catch (error) {
          namespace.toast.error(error.message);
          window.location.href = "login.html";
          return;
        }

        const quantity = parseInt(qtyInput?.value, 10) || 1;

        try {
          const cartDto = await namespace.cartApi.addItem(user.email, product.id, quantity);
          namespace.toast.success(`Đã thêm ${quantity} sản phẩm (${product.name}) vào giỏ! (Tổng: ${cartDto.totalItems})`);
        } catch (error) {
          namespace.toast.error("Lỗi: " + (error.message || "Thêm vào giỏ thất bại"));
        }
      });
    } catch (error) {
      namespace.toast.error(error.message || "Không tải được chi tiết sản phẩm.");
    }
  }

  document.addEventListener("DOMContentLoaded", loadAndRenderProductDetail);
})(window.HuiLegion);