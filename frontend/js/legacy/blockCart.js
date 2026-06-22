/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: blockCart.js - Xu ly logic phia client (Frontend JavaScript).
 */
// js/blockCart.js
(() => {
  // CART BACKEND (DB) - KHÔNG localStorage
  // Yêu cầu: userStore.js có getCurrentUser()

  const API_BASE_URL =
    window.API_BASE_URL ||
    (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
    "http://localhost:8080/api";

  function normalizeEmail(email) {
    return (email || "").toLowerCase().trim();
  }

  function requireLoginUser() {
    if (typeof getCurrentUser !== "function") {
      throw new Error("Thiếu getCurrentUser() (userStore.js)");
    }
    const user = getCurrentUser();
    if (!user || !user.email) throw new Error("Vui lòng đăng nhập để sử dụng giỏ hàng.");
    user.email = normalizeEmail(user.email);
    return user;
  }

  async function apiGetCart(email) {
    const res = await fetch(`${API_BASE_URL}/cart?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error("Không tải được giỏ hàng.");
    return res.json();
  }

  async function apiUpdateQty(email, productId, quantity) {
    const res = await fetch(
      `${API_BASE_URL}/cart/items/${productId}?email=${encodeURIComponent(email)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity })
      }
    );
    if (!res.ok) throw new Error("Cập nhật số lượng thất bại.");
    return res.json();
  }

  async function apiRemoveItem(email, productId) {
    const res = await fetch(
      `${API_BASE_URL}/cart/items/${productId}?email=${encodeURIComponent(email)}`,
      { method: "DELETE" }
    );
    if (!res.ok) throw new Error("Xóa sản phẩm khỏi giỏ thất bại.");
    return res.json();
  }

  async function apiClearCart(email) {
    const res = await fetch(`${API_BASE_URL}/cart?email=${encodeURIComponent(email)}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Xóa giỏ hàng thất bại.");
  }

  function setupCartGuard(doc = document) {
    const cartIcon = doc.querySelector(".icons .fa-cart-shopping");
    if (!cartIcon) return;

    const newCartIcon = cartIcon.cloneNode(true);
    cartIcon.parentNode.replaceChild(newCartIcon, cartIcon);

    let user = null;
    try {
      user = requireLoginUser();
    } catch {
      user = null;
    }

    if (!user) {
      newCartIcon.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        alert("Vui lòng đăng nhập để xem giỏ hàng.");
        window.location.href = "login.html";
      });
    } else {
      newCartIcon.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "cart.html";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => setupCartGuard());

  document.addEventListener("DOMContentLoaded", () => {
    const listEl = document.getElementById("cart-items");
    if (!listEl) return;

    const subtotalEl = document.getElementById("cart-subtotal");
    const totalEl = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");

    // ✅ input địa chỉ giao hàng trong HTML của bạn
    const addressInput = document.querySelector(".payment-info input");

    function formatPrice(num) {
      return (Number(num) || 0).toLocaleString("vi-VN") + "đ";
    }

    let email = "";
    let currentCart = null;

    try {
      email = requireLoginUser().email; // đã normalize
    } catch (e) {
      alert(e.message);
      window.location.href = "login.html";
      return;
    }

    function renderFromCartDto(cartDto) {
      currentCart = cartDto;
      listEl.innerHTML = "";

      const items = cartDto?.items || [];
      if (!items.length) {
        listEl.innerHTML = `<li class="cart-item empty">Giỏ hàng của bạn đang trống.</li>`;
        if (subtotalEl) subtotalEl.textContent = formatPrice(0);
        if (totalEl) totalEl.textContent = formatPrice(0);
        return;
      }

      items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
          <div class="cart-item-left">
            <img src="${item.imageUrl || ""}" alt="">
            <div class="info">
              <h3>${item.name || ""}</h3>
              <p class="price">${formatPrice(item.price)}</p>
            </div>
          </div>
          <div class="cart-item-right">
            <div class="qty">
              <button class="qty-btn qty-minus" data-id="${item.productId}">-</button>
              <input type="number" class="qty-input" data-id="${item.productId}" min="1" value="${item.quantity}">
              <button class="qty-btn qty-plus" data-id="${item.productId}">+</button>
            </div>
            <div class="item-total">${formatPrice(item.lineTotal)}</div>
            <button class="remove-btn" data-id="${item.productId}">Xóa</button>
          </div>
        `;
        listEl.appendChild(li);
      });

      if (subtotalEl) subtotalEl.textContent = formatPrice(cartDto.totalPrice);
      if (totalEl) totalEl.textContent = formatPrice(cartDto.totalPrice);
    }

    async function loadAndRender() {
      const cartDto = await apiGetCart(email);
      renderFromCartDto(cartDto);
    }

    listEl.addEventListener("click", async (e) => {
      const target = e.target;
      const id = Number(target?.dataset?.id);
      if (!id) return;

      if (target.classList.contains("remove-btn")) {
        const cartDto = await apiRemoveItem(email, id);
        renderFromCartDto(cartDto);
        return;
      }

      if (target.classList.contains("qty-minus") || target.classList.contains("qty-plus")) {
        const input = listEl.querySelector(`.qty-input[data-id="${id}"]`);
        if (!input) return;

        let val = parseInt(input.value, 10) || 1;
        if (target.classList.contains("qty-minus") && val > 1) val--;
        if (target.classList.contains("qty-plus")) val++;

        input.value = val;

        const cartDto = await apiUpdateQty(email, id, val);
        renderFromCartDto(cartDto);
      }
    });

    listEl.addEventListener("change", async (e) => {
      const input = e.target;
      if (!input.classList.contains("qty-input")) return;

      const id = Number(input.dataset.id);
      let val = parseInt(input.value, 10) || 1;
      if (val < 1) val = 1;
      input.value = val;

      const cartDto = await apiUpdateQty(email, id, val);
      renderFromCartDto(cartDto);
    });

    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", async () => {
        if (!currentCart?.items?.length) {
          alert("Giỏ hàng đang trống!");
          return;
        }

        // ✅ BẮT BUỘC NHẬP ĐỊA CHỈ TỪ INPUT
        const address = (addressInput?.value || "").trim();
        if (!address) {
          alert("Vui lòng nhập Địa chỉ giao hàng trước khi thanh toán.");
          addressInput?.focus?.();
          return;
        }

        // ✅ LƯU ĐỊA CHỈ VÀO PROFILE (PUT /api/user/{email}/profile)
        try {
          await apiSaveAddressToProfile(email, address);
        } catch (err) {
          alert(err.message || "Không lưu được địa chỉ. Vui lòng thử lại.");
          return;
        }

        if (!confirm("Xác nhận thanh toán? (Demo: sẽ xóa giỏ hàng)")) return;

        await apiClearCart(email);
        alert("Thanh toán thành công (demo) - Giỏ hàng đã được làm trống!");
        await loadAndRender();
      });
    }

    loadAndRender().catch(err => alert(err.message || "Không tải được giỏ hàng"));
  });
})();
