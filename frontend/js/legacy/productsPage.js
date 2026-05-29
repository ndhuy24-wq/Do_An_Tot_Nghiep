// JS/productsPage.js
(() => {
  // ✅ Không khai báo API_BASE_URL const toàn cục; dùng hàm để tránh lỗi trùng tên giữa các file
  function getApiBaseUrl() {
    return (
      window.API_BASE_URL ||
      (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
      "http://localhost:8080/api"
    );
  }

  console.log("[productsPage] loaded at", window.location.pathname);
  console.log("[productsPage] API =", getApiBaseUrl());

  function formatPrice(num) {
    if (num === null || num === undefined) return "";
    return Number(num).toLocaleString("vi-VN") + "đ";
  }

  // ✅ an toàn: có userStore thì lấy, không thì null
  function tryGetLoginUser() {
    if (typeof getCurrentUser !== "function") return null;
    const user = getCurrentUser();
    if (!user || !user.email) return null;
    return user;
  }

  // ✅ chuẩn hóa email để tránh duplicate cart do khác hoa/thường/khoảng trắng
  function normalizeEmail(email) {
    return (email || "").toLowerCase().trim();
  }

  // POST /api/cart/items
  async function apiCartAddItem(userEmail, productId, quantity) {
    const API = getApiBaseUrl();
    const email = normalizeEmail(userEmail);

    const res = await fetch(`${API}/cart/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: email, productId, quantity })
    });

    const raw = await res.text().catch(() => "");

    if (!res.ok) {
      let msg = "Thêm vào giỏ thất bại.";
      try {
        const err = JSON.parse(raw);
        msg = err.message || msg;
      } catch {}
      throw new Error(`${msg} (HTTP ${res.status})`);
    }

    return raw ? JSON.parse(raw) : {};
  }

  function createProductBoxHtml(product) {
    const discountHtml = product.discount
      ? `<span class="discount">${product.discount}</span>`
      : "";

    const oldPriceText =
      product.oldPrice && Number(product.oldPrice) > 0
        ? formatPrice(product.oldPrice)
        : "";

    const oldPriceHtml = oldPriceText ? `<span> ${oldPriceText} </span>` : "";

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
            ${formatPrice(product.price)}
            ${oldPriceHtml}
          </div>
        </div>
      </div>
    `;
  }

  function setupProductEvents(root) {
    root.querySelectorAll(".box").forEach((box) => {
      const btnAdd = box.querySelector(".add-cart-btn");
      const productId = parseInt(box.dataset.id, 10);

      btnAdd?.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const user = tryGetLoginUser();
        if (!user) {
          alert("Vui lòng đăng nhập để thêm vào giỏ hàng.");
          window.location.href = "login.html";
          return;
        }

        try {
          // ✅ normalize email trước khi gửi
          const cartDto = await apiCartAddItem(user.email, productId, 1);
          alert(`Đã thêm vào giỏ hàng! (Tổng: ${cartDto.totalItems ?? "?"})`);
        } catch (error) {
          console.error("[productsPage] Add to cart error:", error);
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

    if (!productsSection) {
      console.error("[productsPage] Không tìm thấy container render sản phẩm (.products .box-container)");
      return;
    }

    productsSection.innerHTML =
      '<div style="text-align:center;padding:20px;">Đang tải sản phẩm...</div>';

    try {
      const API = getApiBaseUrl();
      const url = `${API}/products`;
      console.log("[productsPage] Fetch:", url);

      const res = await fetch(url);
      const raw = await res.text();
      console.log("[productsPage] Raw response:", raw);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const products = JSON.parse(raw);
      if (!Array.isArray(products)) throw new Error("API không trả về mảng sản phẩm");

      if (products.length === 0) {
        productsSection.innerHTML =
          '<div style="text-align:center;padding:20px;">Chưa có sản phẩm nào được thêm.</div>';
        return;
      }

      productsSection.innerHTML = products.map(createProductBoxHtml).join("");
      setupProductEvents(productsSection);
    } catch (error) {
      console.error("[productsPage] Error:", error);
      productsSection.innerHTML =
        `<div style="text-align:center;padding:20px;color:red;">Lỗi tải dữ liệu: ${error.message}</div>`;
    }
  }

  window.loadAndRenderProducts = loadAndRenderProducts;
  window.setupProductEvents = setupProductEvents;

  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".products .box-container")) {
      loadAndRenderProducts(document);
    } else {
      console.log("[productsPage] Trang này không có products section, chờ main.html gọi loadAndRenderProducts(root).");
    }
  });
})();
