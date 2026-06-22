/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: cart.page.js - Xu ly logic phia client (Frontend JavaScript).
 */
(function cartPageModule(namespace) {
  function requireLoginUser() {
    const user = namespace.session?.getCurrentUser?.();
    if (!user?.email) {
      throw new Error("Vui lòng đăng nhập để sử dụng giỏ hàng.");
    }
    user.email = namespace.utils.normalizeEmail(user.email);
    return user;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const listEl = document.getElementById("cart-items");
    if (!listEl) return;

    const subtotalEl = document.getElementById("cart-subtotal");
    const totalEl = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");
    const addressInput = document.querySelector(".payment-info input");

    const paymentExtra = document.getElementById("payment-extra");
    const paymentQrImage = document.getElementById("payment-qr-image");
    const paymentQrText = document.getElementById("payment-qr-text");

    let email = "";
    let currentCart = null;

    try {
      email = requireLoginUser().email;
    } catch (error) {
      namespace.toast.error(error.message);
      window.location.href = "login.html";
      return;
    }

    // ===== QR PAYMENT SWITCH =====
    document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        const value = radio.value;

        switch (value) {
          case "BANK_TRANSFER":
            paymentExtra.style.display = "block";
            paymentQrImage.src = "../images/qr-bank.jpg";
            paymentQrText.textContent = "Quét QR ngân hàng để chuyển khoản";
            break;

          case "VNPAY":
            paymentExtra.style.display = "block";
            paymentQrImage.src = "../images/qr-vnpay.png";
            paymentQrText.textContent = "Quét QR VNPay để thanh toán";
            break;

          case "MOMO":
            paymentExtra.style.display = "block";
             paymentQrImage.src = "../images/qr-momo.png";
            paymentQrText.textContent = "Quét QR MoMo để thanh toán";
            break;

          default:
            paymentExtra.style.display = "none";
            break;
        }
      });
    });

    function renderFromCartDto(cartDto) {
      currentCart = cartDto;
      listEl.innerHTML = "";

      const items = cartDto?.items || [];

      if (!items.length) {
        listEl.innerHTML =
          '<li class="cart-item empty">Giỏ hàng của bạn đang trống.</li>';

        if (subtotalEl) subtotalEl.textContent = namespace.utils.formatMoney(0);
        if (totalEl) totalEl.textContent = namespace.utils.formatMoney(0);
        return;
      }

      items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "cart-item";

        li.innerHTML = `
          <div class="cart-item-left">
            <img src="${namespace.utils.resolveAssetUrl(item.imageUrl)}" alt="">
            <div class="info">
              <h3>${item.name || ""}</h3>
            </div>
          </div>

          <div class="cart-item-right">
            <div class="qty">
              <button class="qty-btn qty-minus" data-id="${item.productId}">-</button>
              <input type="number" class="qty-input" data-id="${item.productId}" min="1" value="${item.quantity}">
              <button class="qty-btn qty-plus" data-id="${item.productId}">+</button>
            </div>

            <div class="item-total">
              ${namespace.utils.formatMoney(item.lineTotal)}
            </div>

            <button class="remove-btn" data-id="${item.productId}">Xóa</button>
          </div>
        `;

        listEl.appendChild(li);
      });

      if (subtotalEl)
        subtotalEl.textContent = namespace.utils.formatMoney(cartDto.totalPrice);

      if (totalEl)
        totalEl.textContent = namespace.utils.formatMoney(cartDto.totalPrice);
    }

    async function loadAndRender() {
      const cartDto = await namespace.cartApi.getCart(email);
      renderFromCartDto(cartDto);
    }

    listEl.addEventListener("click", async (event) => {
      const target = event.target;
      const productId = Number(target?.dataset?.id);

      if (!productId) return;

      try {
        if (target.classList.contains("remove-btn")) {
          const cartDto = await namespace.cartApi.removeItem(email, productId);
          renderFromCartDto(cartDto);
          return;
        }

        if (
          target.classList.contains("qty-minus") ||
          target.classList.contains("qty-plus")
        ) {
          const input = listEl.querySelector(
            `.qty-input[data-id="${productId}"]`
          );

          if (!input) return;

          let value = parseInt(input.value, 10) || 1;

          if (target.classList.contains("qty-minus") && value > 1) value -= 1;
          if (target.classList.contains("qty-plus")) value += 1;

          input.value = value;

          const cartDto = await namespace.cartApi.updateQuantity(
            email,
            productId,
            value
          );

          renderFromCartDto(cartDto);
        }
      } catch (error) {
        namespace.toast.error(error.message || "Không xử lý được giỏ hàng");
      }
    });

    listEl.addEventListener("change", async (event) => {
      const input = event.target;

      if (!input.classList.contains("qty-input")) return;

      const productId = Number(input.dataset.id);

      let value = parseInt(input.value, 10) || 1;

      if (value < 1) value = 1;

      input.value = value;

      try {
        const cartDto = await namespace.cartApi.updateQuantity(
          email,
          productId,
          value
        );

        renderFromCartDto(cartDto);
      } catch (error) {
        namespace.toast.error(error.message || "Không cập nhật được số lượng");
      }
    });

    checkoutBtn?.addEventListener("click", async () => {
      if (!currentCart?.items?.length) {
        namespace.toast.warning("Giỏ hàng đang trống!");
        return;
      }

      const address = addressInput?.value?.trim() || "";

      if (!address) {
        namespace.toast.warning("Vui lòng nhập Địa chỉ giao hàng trước khi thanh toán.");
        addressInput?.focus?.();
        return;
      }

      const paymentMethod =
        document.querySelector('input[name="paymentMethod"]:checked')?.value ||
        "COD";

      if (!confirm(`Xác nhận đặt hàng bằng phương thức ${paymentMethod}?`))
        return;

      try {
        if (paymentMethod === "VNPAY" && namespace.paymentsApi?.createVnPayPayment) {
          const payment = await namespace.paymentsApi.createVnPayPayment(
            currentCart.totalPrice || 0,
            `Thanh toan don hang HUI LEGION - ${email}`,
            `${window.location.origin}${window.location.pathname}`
          );

          namespace.toast.info("Đang chuyển sang cổng thanh toán VNPay...");
          setTimeout(() => { window.location.href = payment.paymentUrl; }, 900);
          return;
        }

        const order = await namespace.ordersApi.checkout(
          email,
          address,
          paymentMethod
        );

        namespace.toast.success(
          `Đặt hàng thành công! Mã đơn: ${order.code || `HD${order.id}`} - Phương thức: ${paymentMethod}`
        );

        await loadAndRender();
      } catch (error) {
        namespace.toast.error(error.message || "Thanh toán thất bại");
      }
    });

    try {
      await loadAndRender();
    } catch (error) {
      namespace.toast.error(error.message || "Không tải được giỏ hàng");
    }
  });
})(window.HuiLegion);