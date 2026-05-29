(function productsPageModule(namespace) {
  function tryGetLoginUser() {
    const user = namespace.session?.getCurrentUser?.();
    return user?.email ? user : null;
  }

  function createProductBoxHtml(product) {
    const discountHtml = product.discount ? `<span class="discount">${product.discount}</span>` : "";
    const oldPriceHtml = product.oldPrice && Number(product.oldPrice) > 0
      ? `<span>${namespace.utils.formatOptionalMoney(product.oldPrice)}</span>`
      : "";

    return `
      <div class="box" data-id="${product.id}">
        ${discountHtml}
        <div class="image">
          <img
            src="${product.imageUrl || ""}"
            style="height: 400px; width: 400px;"
            alt="${product.name || ""}"
          >
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

  function setupProductEvents(root) {
    root.querySelectorAll(".box").forEach((box) => {
      const buttonAdd = box.querySelector(".add-cart-btn");
      const productId = Number(box.dataset.id);

      buttonAdd?.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const user = tryGetLoginUser();
        if (!user) {
          alert("Vui lòng đăng nhập để thêm vào giỏ hàng.");
          window.location.href = "login.html";
          return;
        }

        try {
          const cartDto = await namespace.cartApi.addItem(user.email, productId, 1);
          alert(`Đã thêm vào giỏ hàng! (Tổng: ${cartDto.totalItems ?? "?"})`);
        } catch (error) {
          alert("Lỗi: " + (error.message || "Thêm vào giỏ thất bại"));
        }
      });
    });
  }

  async function loadAndRenderProducts(root = document) {
    const productsSection =
      root.querySelector?.(".products .box-container") ||
      root.querySelector?.("#products .box-container") ||
      root.querySelector?.(".box-container");

    if (!productsSection) return;

    productsSection.innerHTML = '<div style="text-align:center;padding:20px;">Đang tải sản phẩm...</div>';

    try {
      const products = await namespace.productsApi.listProducts();

      if (!Array.isArray(products) || products.length === 0) {
        productsSection.innerHTML = '<div style="text-align:center;padding:20px;">Chưa có sản phẩm nào được thêm.</div>';
        return;
      }

      productsSection.innerHTML = products.map(createProductBoxHtml).join("");
      setupProductEvents(productsSection);
    } catch (error) {
      productsSection.innerHTML = `<div style="text-align:center;padding:20px;color:red;">Lỗi tải dữ liệu: ${error.message}</div>`;
    }
  }

  namespace.pages = namespace.pages || {};
  namespace.pages.products = { loadAndRenderProducts, setupProductEvents };
  window.loadAndRenderProducts = loadAndRenderProducts;

  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".products .box-container")) {
      loadAndRenderProducts(document);
    }
  });
})(window.HuiLegion);
