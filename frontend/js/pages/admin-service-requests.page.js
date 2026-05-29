(function adminServiceRequestsPageModule(namespace) {
  let currentRequestId = null;
  let rawItems = [];

  function formatDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  }

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function openModal() {
    const modal = document.getElementById("service-modal");
    if (modal) modal.style.display = "flex";
  }

  function closeModal() {
    const modal = document.getElementById("service-modal");
    if (modal) modal.style.display = "none";
    currentRequestId = null;
  }

  function fillDetail(item) {
    setText("detail-code", item.code || "");
    setText("detail-customer-name", item.customerName || "");
    setText("detail-customer-phone", item.customerPhone || "");
    setText("detail-user-email", item.userEmail || "");
    setText("detail-device-name", item.deviceName || "");
    setText("detail-brand", item.brand || "");
    setText("detail-service-type", namespace.repairApi.formatServiceType(item.serviceType));
    setText("detail-appointment-date", formatDateTime(item.appointmentDate) || "Chưa có");
    setText("detail-created-at", formatDateTime(item.createdAt));
    setText("detail-updated-at", formatDateTime(item.updatedAt));
    setText("detail-issue-description", item.issueDescription || "Không có");
    setText("detail-device-condition", item.deviceCondition || "Không có");

    const statusInput = document.getElementById("update-status");
    const costInput = document.getElementById("update-estimated-cost");
    const noteInput = document.getElementById("update-technician-note");

    if (statusInput) statusInput.value = item.status || "received";
    if (costInput) costInput.value = item.estimatedCost || 0;
    if (noteInput) noteInput.value = item.technicianNote || "";
  }

  function buildStatusBadge(status) {
    return `
      <span class="service-status status-${status}">
        ${namespace.repairApi.formatServiceStatus(status)}
      </span>
    `;
  }

  function renderRows(items) {
    const tbody = document.getElementById("admin-service-body");
    const badge = document.getElementById("services-count-badge");
    if (!tbody) return;

    if (badge) {
      badge.textContent = `${items.length} yêu cầu`;
    }

    if (!items.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">Không có yêu cầu dịch vụ nào.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map((item) => `
      <tr>
        <td><strong>${item.code || ""}</strong></td>
        <td>
          <strong>${item.customerName || ""}</strong><br>
          <small>${item.customerPhone || ""}</small>
        </td>
        <td>${item.deviceName || ""}</td>
        <td>${namespace.repairApi.formatServiceType(item.serviceType)}</td>
        <td>${namespace.utils.formatMoney(item.estimatedCost || 0)}</td>
        <td>${buildStatusBadge(item.status)}</td>
        <td>${formatDateTime(item.createdAt)}</td>
        <td>
          <button class="btn btn-secondary btn-view-service" data-id="${item.id}">
            Xem / sửa
          </button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".btn-view-service").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          const item = await namespace.repairApi.fetchServiceRequestDetail(button.dataset.id);
          currentRequestId = item.id;
          fillDetail(item);
          openModal();
        } catch (error) {
          namespace.toast.error(error.message || "Không tải được chi tiết yêu cầu");
        }
      });
    });
  }

  function getFilterValues() {
    return {
      code: normalizeText(document.getElementById("service-code-filter")?.value),
      keyword: normalizeText(document.getElementById("service-keyword-filter")?.value),
      type: normalizeText(document.getElementById("service-type-filter")?.value),
      status: normalizeText(document.getElementById("service-status-filter")?.value)
    };
  }

  function applyClientFilters() {
    const { code, keyword, type, status } = getFilterValues();

    const filteredItems = rawItems.filter((item) => {
      const itemCode = normalizeText(item.code);
      const customerName = normalizeText(item.customerName);
      const customerPhone = normalizeText(item.customerPhone);
      const serviceType = normalizeText(item.serviceType);
      const itemStatus = normalizeText(item.status);

      const matchCode = !code || itemCode.includes(code);
      const matchKeyword =
        !keyword ||
        customerName.includes(keyword) ||
        customerPhone.includes(keyword);
      const matchType = !type || serviceType === type;
      const matchStatus = !status || itemStatus === status;

      return matchCode && matchKeyword && matchType && matchStatus;
    });

    renderRows(filteredItems);
  }

  async function loadServiceRequests() {
    const tbody = document.getElementById("admin-service-body");

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">Đang tải yêu cầu dịch vụ...</td>
        </tr>
      `;
    }

    try {
      rawItems = await namespace.repairApi.fetchAdminServiceRequests();
      applyClientFilters();
    } catch (error) {
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8">Không tải được dữ liệu.</td>
          </tr>
        `;
      }
      namespace.toast.error(error.message || "Không tải được danh sách yêu cầu");
    }
  }

  function clearFilters() {
    const ids = [
      "service-code-filter",
      "service-keyword-filter",
      "service-type-filter",
      "service-status-filter"
    ];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    applyClientFilters();
  }

  async function saveUpdate() {
    if (!currentRequestId) {
      namespace.toast.warning("Không tìm thấy yêu cầu cần cập nhật");
      return;
    }

    const saveBtn = document.getElementById("btn-save-service-update");
    const payload = {
      status: document.getElementById("update-status")?.value || "received",
      estimatedCost: Number(document.getElementById("update-estimated-cost")?.value || 0),
      technicianNote: document.getElementById("update-technician-note")?.value?.trim() || ""
    };

    try {
      if (saveBtn) saveBtn.disabled = true;

      await namespace.repairApi.updateServiceRequest(currentRequestId, payload);
      namespace.toast.success("Cập nhật yêu cầu dịch vụ thành công");
      closeModal();
      await loadServiceRequests();
    } catch (error) {
      namespace.toast.error(error.message || "Cập nhật thất bại");
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await loadServiceRequests();

    document.getElementById("service-code-filter")?.addEventListener("input", applyClientFilters);
    document.getElementById("service-keyword-filter")?.addEventListener("input", applyClientFilters);
    document.getElementById("service-type-filter")?.addEventListener("change", applyClientFilters);
    document.getElementById("service-status-filter")?.addEventListener("change", applyClientFilters);

    document.getElementById("btn-reload-service")?.addEventListener("click", loadServiceRequests);
    document.getElementById("btn-clear-service-filter")?.addEventListener("click", clearFilters);
    document.getElementById("close-service-modal")?.addEventListener("click", closeModal);
    document.getElementById("btn-save-service-update")?.addEventListener("click", saveUpdate);

    document.getElementById("service-modal")?.addEventListener("click", (event) => {
      if (event.target.id === "service-modal") {
        closeModal();
      }
    });
  });
})(window.HuiLegion);