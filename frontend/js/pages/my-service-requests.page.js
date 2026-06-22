/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: my-service-requests.page.js - Xu ly logic phia client (Frontend JavaScript).
 */
(function myServiceRequestsPageModule(namespace) {
  function requireLoginUser() {
    const user = namespace.session?.getCurrentUser?.();
    if (!user?.email) {
      namespace.toast.warning("Vui lòng đăng nhập");
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

  function openMyServiceModal(item) {
    const modal = document.getElementById("my-service-detail-modal");
    const content = document.getElementById("my-service-detail-content");

    if (!modal || !content) {
      namespace.toast.error("Không tìm thấy modal chi tiết yêu cầu dịch vụ.");
      return;
    }

    content.innerHTML = `
      <div class="order-detail-grid">
        <div class="order-detail-box">
          <div class="order-detail-label">Mã yêu cầu</div>
          <div class="order-detail-value">${item.code || `DV${item.id}`}</div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Khách hàng</div>
          <div class="order-detail-value">${item.customerName || "Không rõ"}</div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Số điện thoại</div>
          <div class="order-detail-value">${item.customerPhone || "Chưa có"}</div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Email</div>
          <div class="order-detail-value">${item.userEmail || "Chưa có"}</div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Thiết bị</div>
          <div class="order-detail-value">${item.deviceName || "Chưa có"}</div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Hãng</div>
          <div class="order-detail-value">${item.brand || "Chưa có"}</div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Loại dịch vụ</div>
          <div class="order-detail-value">${namespace.repairApi.formatServiceType(item.serviceType)}</div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Trạng thái</div>
          <div class="order-detail-value">${namespace.repairApi.formatServiceStatus(item.status)}</div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Báo giá</div>
          <div class="order-detail-value">${namespace.utils.formatMoney(item.estimatedCost || 0)}</div>
        </div>

        <div class="order-detail-box">
          <div class="order-detail-label">Ngày hẹn</div>
          <div class="order-detail-value">${formatDateTime(item.appointmentDate) || "Chưa có"}</div>
        </div>

        <div class="order-detail-box order-detail-full">
          <div class="order-detail-label">Ngày tạo</div>
          <div class="order-detail-value">${formatDateTime(item.createdAt) || "Không rõ"}</div>
        </div>

        <div class="order-detail-box order-detail-full">
          <div class="order-detail-label">Mô tả yêu cầu</div>
          <div class="order-detail-value">${item.issueDescription || "Không có"}</div>
        </div>

        <div class="order-detail-box order-detail-full">
          <div class="order-detail-label">Tình trạng máy</div>
          <div class="order-detail-value">${item.deviceCondition || "Không có"}</div>
        </div>

        <div class="order-detail-box order-detail-full">
          <div class="order-detail-label">Ghi chú kỹ thuật</div>
          <div class="order-detail-value">${item.technicianNote || "Chưa có"}</div>
        </div>
      </div>
    `;

    modal.classList.add("active");
  }

  function bindServiceModalEvents() {
    document
      .getElementById("close-my-service-modal")
      ?.addEventListener("click", () => {
        document
          .getElementById("my-service-detail-modal")
          ?.classList.remove("active");
      });

    document
      .getElementById("my-service-detail-modal")
      ?.addEventListener("click", (event) => {
        if (event.target.id === "my-service-detail-modal") {
          event.target.classList.remove("active");
        }
      });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        document
          .getElementById("my-service-detail-modal")
          ?.classList.remove("active");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.getElementById("service-body");
    if (!tbody) return;

    bindServiceModalEvents();

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
            openMyServiceModal(item);
          } catch (error) {
            namespace.toast.error(error.message || "Không tải được chi tiết yêu cầu");
          }
        });
      });
    } catch (error) {
      namespace.toast.error(error.message || "Không tải được danh sách yêu cầu dịch vụ");
    }

    backBtn?.addEventListener("click", () => {
      window.location.href = "main.html";
    });
  });
})(window.HuiLegion);