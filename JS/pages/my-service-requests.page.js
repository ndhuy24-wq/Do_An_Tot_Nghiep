(function myServiceRequestsPageModule(namespace) {
  function requireLoginUser() {
    const user = namespace.session?.getCurrentUser?.();
    if (!user?.email) {
      alert("Vui lòng đăng nhập");
      window.location.href = "login.html";
      return null;
    }
    return user;
  }

  function formatDateTime(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("vi-VN");
  }

  function buildDetailMessage(item) {
    let message = `Mã yêu cầu: ${item.code || ""}\n`;
    message += `Khách hàng: ${item.customerName || ""}\n`;
    message += `Số điện thoại: ${item.customerPhone || ""}\n`;
    message += `Email: ${item.userEmail || ""}\n`;
    message += `Thiết bị: ${item.deviceName || ""}\n`;
    message += `Hãng: ${item.brand || ""}\n`;
    message += `Loại dịch vụ: ${namespace.repairApi.formatServiceType(item.serviceType)}\n`;
    message += `Trạng thái: ${namespace.repairApi.formatServiceStatus(item.status)}\n`;
    message += `Báo giá: ${namespace.utils.formatMoney(item.estimatedCost || 0)}\n`;
    message += `Ngày hẹn: ${formatDateTime(item.appointmentDate) || "Chưa có"}\n`;
    message += `Ngày tạo: ${formatDateTime(item.createdAt)}\n\n`;
    message += `Mô tả yêu cầu:\n${item.issueDescription || "Không có"}\n\n`;
    message += `Tình trạng máy:\n${item.deviceCondition || "Không có"}\n\n`;
    message += `Ghi chú kỹ thuật:\n${item.technicianNote || "Chưa có"}`;

    return message;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.getElementById("service-body");
    if (!tbody) return;

    const user = requireLoginUser();
    if (!user) return;

    const emptyEl = document.getElementById("service-empty");
    const wrapperEl = document.getElementById("service-wrapper");
    const backBtn = document.getElementById("btn-back-home");

    try {
      const items = await namespace.repairApi.fetchMyServiceRequests(user.email);

      if (!items.length) {
        if (emptyEl) emptyEl.style.display = "block";
        if (wrapperEl) wrapperEl.style.display = "none";
      } else {
        tbody.innerHTML = "";

        items.forEach((item) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${item.code || `DV${item.id}`}</td>
            <td>${formatDateTime(item.createdAt)}</td>
            <td>${item.deviceName || ""}</td>
            <td>${namespace.repairApi.formatServiceType(item.serviceType)}</td>
            <td>${namespace.utils.formatMoney(item.estimatedCost || 0)}</td>
            <td>
              <span class="order-status status-${item.status}">
                ${namespace.repairApi.formatServiceStatus(item.status)}
              </span>
            </td>
            <td>
              <button data-id="${item.id}" class="btn-order-detail">Xem</button>
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
            const item = await namespace.repairApi.fetchServiceRequestDetail(button.dataset.id);
            alert(buildDetailMessage(item));
          } catch (error) {
            alert(error.message || "Không tải được chi tiết yêu cầu");
          }
        });
      });
    } catch (error) {
      alert(error.message || "Không tải được danh sách yêu cầu dịch vụ");
    }

    backBtn?.addEventListener("click", () => {
      window.location.href = "main.html";
    });
  });
})(window.HuiLegion);