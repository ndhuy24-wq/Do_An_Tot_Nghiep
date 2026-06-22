/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: service-request.page.js - Xu ly logic phia client (Frontend JavaScript).
 */
(function serviceRequestPageModule(namespace) {
  function getCurrentUser() {
    return namespace.session?.getCurrentUser?.() || null;
  }

  function fillUserInfo() {
    const user = getCurrentUser();

    const emailInput = document.getElementById("customer-email");
    const nameInput = document.getElementById("customer-name");

    if (user?.email && emailInput) {
      emailInput.value = user.email;
    }

    if (user?.fullName && nameInput) {
      nameInput.value = user.fullName;
    } else if (user?.name && nameInput) {
      nameInput.value = user.name;
    }
  }

  function fillServiceTypeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const select = document.getElementById("service-type");

    if (!select || !type) return;

    const validTypes = ["repair", "upgrade", "maintenance"];
    if (validTypes.includes(type)) {
      select.value = type;
    }
  }

  function normalizeDateTime(value) {
    if (!value) return null;
    return value.length === 16 ? `${value}:00` : value;
  }

  function buildPayload() {
    return {
      userEmail: document.getElementById("customer-email")?.value?.trim() || "",
      customerName: document.getElementById("customer-name")?.value?.trim() || "",
      customerPhone: document.getElementById("customer-phone")?.value?.trim() || "",
      deviceName: document.getElementById("device-name")?.value?.trim() || "",
      brand: document.getElementById("brand")?.value?.trim() || "",
      serviceType: document.getElementById("service-type")?.value || "",
      issueDescription: document.getElementById("issue-description")?.value?.trim() || "",
      deviceCondition: document.getElementById("device-condition")?.value?.trim() || "",
      appointmentDate: normalizeDateTime(document.getElementById("appointment-date")?.value || "")
    };
  }

  function validatePayload(payload) {
    if (!payload.customerName) {
      throw new Error("Vui lòng nhập họ và tên.");
    }
    if (!payload.customerPhone) {
      throw new Error("Vui lòng nhập số điện thoại.");
    }
    if (!payload.deviceName) {
      throw new Error("Vui lòng nhập tên máy.");
    }
    if (!payload.serviceType) {
      throw new Error("Vui lòng chọn loại dịch vụ.");
    }
    if (!payload.issueDescription) {
      throw new Error("Vui lòng nhập mô tả yêu cầu.");
    }
  }

  function resetForm(form) {
    form.reset();
    fillUserInfo();
    fillServiceTypeFromUrl();
  }

  async function loadHeaderFooter() {
    async function loadSection(id, file) {
      const el = document.getElementById(id);
      if (!el) return;

      try {
        const response = await fetch(file);
        const html = await response.text();
        el.innerHTML = html;

        if (id === "header") {
          if (typeof setupHeaderUser === "function") {
            setupHeaderUser();
          }
          if (typeof setupCartGuard === "function") {
            setupCartGuard();
          }
        }
      } catch (error) {
        console.error(`Lỗi tải ${file}`, error);
      }
    }

    await loadSection("header", "header.html");
    await loadSection("footer", "footer.html");
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await loadHeaderFooter();

    fillUserInfo();
    fillServiceTypeFromUrl();

    const form = document.getElementById("service-request-form");
    const submitBtn = document.querySelector(".btn-submit-service");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      try {
        const payload = buildPayload();
        validatePayload(payload);

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Đang gửi...";
        }

        const result = await namespace.repairApi.createServiceRequest(payload);

        namespace.toast.success(
          `Gửi yêu cầu thành công. Mã yêu cầu: ${result.code || ""} - Trạng thái: ${namespace.repairApi.formatServiceStatus(result.status)}`
        );

        resetForm(form);
      } catch (error) {
        namespace.toast.error(error.message || "Gửi yêu cầu thất bại");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Gửi yêu cầu";
        }
      }
    });
  });
})(window.HuiLegion);