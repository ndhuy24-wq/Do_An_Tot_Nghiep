(function myOrdersPageModule(namespace) {
  function requireLoginUser() {
    const user = namespace.session?.getCurrentUser?.();
    if (!user?.email) {
      alert("Vui lòng đăng nhập");
      window.location.href = "login.html";
      return null;
    }
    return user;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.getElementById("orders-body");
    if (!tbody) return;

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
              <button data-id="${order.id}" class="btn-order-detail">Xem</button>
              ${order.status === "pending"
                ? `<button data-id="${order.id}" class="btn-order-cancel">Hủy</button>`
                : ""}
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
            const order = await namespace.ordersApi.fetchOrderDetail(button.dataset.id);
            let message = `Mã đơn: ${order.code || `HD${order.id}`}\n`;
            message += `Trạng thái: ${namespace.ordersApi.formatOrderStatus(order.status)}\n`;
            message += `Địa chỉ: ${order.shippingAddress || "Chưa có"}\n\n`;
            (order.items || []).forEach((item) => {
              message += `- ${item.name} x${item.quantity}\n`;
            });
            alert(message);
          } catch (error) {
            alert(error.message || "Không tải được chi tiết đơn");
          }
        });
      });

      tbody.querySelectorAll(".btn-order-cancel").forEach((button) => {
        button.addEventListener("click", async () => {
          if (!confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;

          try {
            await namespace.ordersApi.cancelOrder(button.dataset.id, user.email);
            alert("Hủy đơn hàng thành công.");
            window.location.reload();
          } catch (error) {
            alert(error.message || "Hủy đơn hàng thất bại");
          }
        });
      });
    } catch (error) {
      alert(error.message || "Không tải được đơn hàng");
    }

    logoutBtn?.addEventListener("click", () => {
      window.location.href = "main.html";
    });
  });
})(window.HuiLegion);