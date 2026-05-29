(function myOrdersPageModule(namespace) {

  function requireLoginUser() {
    const user = namespace.session?.getCurrentUser?.();

    if (!user?.email) {
      namespace.toast.warning("Vui lòng đăng nhập");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 800);

      return null;
    }

    return user;
  }

  function formatPaymentMethod(method) {
    switch ((method || "").toUpperCase()) {
      case "COD":
        return "COD";
      case "BANK_TRANSFER":
        return "Chuyển khoản";
      case "VNPAY":
        return "VNPay";
      case "MOMO":
        return "MoMo";
      default:
        return method || "Không rõ";
    }
  }

  function formatPaymentStatus(status) {
    switch ((status || "").toUpperCase()) {
      case "PAID":
        return "Đã thanh toán";
      case "UNPAID":
        return "Chưa thanh toán";
      default:
        return status || "Không rõ";
    }
  }

  function printMyOrderInvoice(order) {
    const items = (order.items || []).map((item, index) => `
      <tr><td>${index + 1}</td><td>${item.name || "Sản phẩm"}</td><td>${item.quantity || 0}</td><td>${namespace.utils.formatMoney(item.price || 0)}</td><td>${namespace.utils.formatMoney(item.lineTotal || 0)}</td></tr>
    `).join("");
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Hóa đơn ${order.code || `HD${order.id}`}</title>
      <style>body{font-family:Arial;padding:28px;color:#111}h1{color:#dc2626}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f3f4f6}.total{text-align:right;font-size:22px;font-weight:800;margin-top:20px}</style>
      </head><body><h1>HUI LEGION - HÓA ĐƠN</h1>
      <p><b>Mã đơn:</b> ${order.code || `HD${order.id}`}</p><p><b>Ngày đặt:</b> ${order.createdAt || ""}</p><p><b>Địa chỉ:</b> ${order.shippingAddress || ""}</p>
      <table><thead><tr><th>STT</th><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>${items}</tbody></table>
      <div class="total">Tổng: ${namespace.utils.formatMoney(order.total || 0)}</div></body></html>
    `);
    win.document.close(); win.focus(); win.print();
  }

  function openMyOrderModal(order) {
    const modal = document.getElementById("my-order-detail-modal");
    const content = document.getElementById("my-order-detail-content");

    if (!modal || !content) {
      namespace.toast.error("Không tìm thấy modal chi tiết đơn hàng.");
      return;
    }

    content.innerHTML = `
      <div class="order-detail-grid">

        <div class="order-detail-box">
          <div class="order-detail-label">Mã đơn</div>
          <div class="order-detail-value">${order.code || `HD${order.id}`}</div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Ngày đặt</div>
          <div class="order-detail-value">${order.createdAt || "Không rõ"}</div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Trạng thái</div>
          <div class="order-detail-value">
            ${namespace.ordersApi.formatOrderStatus(order.status)}
          </div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Thanh toán</div>
          <div class="order-detail-value">
            ${formatPaymentStatus(order.paymentStatus)}
          </div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Phương thức thanh toán</div>
          <div class="order-detail-value">
            ${formatPaymentMethod(order.paymentMethod)}
          </div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Tổng tiền</div>
          <div class="order-detail-value">
            ${namespace.utils.formatMoney(order.total || 0)}
          </div>
        </div>

        <div class="order-detail-box order-detail-full">
          <div class="order-detail-label">Địa chỉ nhận hàng</div>
          <div class="order-detail-value">
            ${order.shippingAddress || "Chưa có"}
          </div>
        </div>

      </div>

      <div class="order-items">
        <h3>Sản phẩm trong đơn</h3>

        ${(order.items || []).map((item) => `
          <div class="order-item">
            <div>
              <strong>${item.name || "Sản phẩm"}</strong>
              <div>Số lượng: x${item.quantity || 0}</div>
            </div>

            <div>
              ${namespace.utils.formatMoney(item.lineTotal || 0)}
            </div>
          </div>
        `).join("")}

        <div style="margin-top:20px;text-align:right;font-size:22px;font-weight:800;color:#dc2626;">
          Tổng: ${namespace.utils.formatMoney(order.total || 0)}
        </div>
        <div style="text-align:right;margin-top:18px;">
          <button type="button" class="btn-order-detail" id="btn-print-my-order">In hóa đơn</button>
        </div>
      </div>
    `;

    modal.classList.add("active");
    document.getElementById("btn-print-my-order")?.addEventListener("click", () => printMyOrderInvoice(order));
  }

  function bindModalEvents() {
    document
      .getElementById("close-my-order-modal")
      ?.addEventListener("click", () => {
        document
          .getElementById("my-order-detail-modal")
          ?.classList.remove("active");
      });

    document
      .getElementById("my-order-detail-modal")
      ?.addEventListener("click", (event) => {
        if (event.target.id === "my-order-detail-modal") {
          event.target.classList.remove("active");
        }
      });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        document
          .getElementById("my-order-detail-modal")
          ?.classList.remove("active");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.getElementById("orders-body");
    if (!tbody) return;

    bindModalEvents();

    const user = requireLoginUser();
    if (!user) return;

    const emptyEl = document.getElementById("orders-empty");
    const wrapperEl = document.getElementById("orders-wrapper");
    const logoutBtn = document.getElementById("btn-logout");

    try {
      const orders = await namespace.ordersApi.fetchMyOrders(user.email);

      if (!orders.length) {
        if (emptyEl) emptyEl.style.display = "block";
        if (wrapperEl) wrapperEl.style.display = "none";
      } else {
        tbody.innerHTML = "";

        orders.forEach((order) => {
          const tr = document.createElement("tr");

          tr.innerHTML = `
            <td>${order.code || `HD${order.id}`}</td>

            <td>${order.createdAt || ""}</td>

            <td>${namespace.utils.formatMoney(order.total || 0)}</td>

            <td>
              <span class="order-status status-${order.status}">
                ${namespace.ordersApi.formatOrderStatus(order.status)}
              </span>
            </td>

            <td>
              <button data-id="${order.id}" class="btn-order-detail">
                Xem
              </button>

              ${
                order.status === "pending"
                  ? `<button data-id="${order.id}" class="btn-order-cancel">Hủy</button>`
                  : ""
              }
            </td>
          `;

          tbody.appendChild(tr);
        });

        if (wrapperEl) wrapperEl.style.display = "block";
        if (emptyEl) emptyEl.style.display = "none";
      }

      tbody.querySelectorAll(".btn-order-detail").forEach((button) => {
        button.addEventListener("click", async () => {
          try {
            const order =
              await namespace.ordersApi.fetchOrderDetail(button.dataset.id);

            openMyOrderModal(order);
          } catch (error) {
            namespace.toast.error(
              error.message || "Không tải được chi tiết đơn"
            );
          }
        });
      });

      tbody.querySelectorAll(".btn-order-cancel").forEach((button) => {
        button.addEventListener("click", async () => {
          if (!confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;

          try {
            await namespace.ordersApi.cancelOrder(button.dataset.id, user.email);

            namespace.toast.success("Hủy đơn hàng thành công.");

            setTimeout(() => {
              window.location.reload();
            }, 900);
          } catch (error) {
            namespace.toast.error(
              error.message || "Hủy đơn hàng thất bại"
            );
          }
        });
      });
    } catch (error) {
      namespace.toast.error(
        error.message || "Không tải được đơn hàng"
      );
    }

    logoutBtn?.addEventListener("click", () => {
      window.location.href = "main.html";
    });
  });

})(window.HuiLegion);