(function adminAccountsPageModule(namespace) {
  let allUsers = [];
  let editingUserId = null;

  function formatRole(role) {
    return String(role || "").toUpperCase() === "ADMIN" ? "Quản trị" : "Người dùng";
  }

  function formatStatus(status) {
    return String(status || "").toUpperCase() === "LOCKED" ? "Đã khóa" : "Hoạt động";
  }

  function getStatusBadgeClass(status) {
    return String(status || "").toUpperCase() === "LOCKED"
      ? "order-badge-cancel"
      : "order-badge-done";
  }

  function resetForm() {
    editingUserId = null;

    const nameEl = document.getElementById("acc-name");
    const emailEl = document.getElementById("acc-email");
    const roleEl = document.getElementById("acc-role");
    const statusEl = document.getElementById("acc-status");
    const noteEl = document.getElementById("acc-note");
    const titleBadge = document.getElementById("account-form-mode");

    if (nameEl) nameEl.value = "";
    if (emailEl) emailEl.value = "";
    if (roleEl) roleEl.value = "USER";
    if (statusEl) statusEl.value = "ACTIVE";
    if (noteEl) noteEl.value = "";
    if (titleBadge) titleBadge.textContent = "Chọn tài khoản để sửa";
  }

  function fillForm(user) {
    editingUserId = user.id;

    const nameEl = document.getElementById("acc-name");
    const emailEl = document.getElementById("acc-email");
    const roleEl = document.getElementById("acc-role");
    const statusEl = document.getElementById("acc-status");
    const noteEl = document.getElementById("acc-note");
    const titleBadge = document.getElementById("account-form-mode");

    if (nameEl) nameEl.value = user.fullname || "";
    if (emailEl) emailEl.value = user.email || "";
    if (roleEl) roleEl.value = String(user.role || "USER").toUpperCase();
    if (statusEl) statusEl.value = String(user.status || "ACTIVE").toUpperCase();
    if (noteEl) noteEl.value = `ID: ${user.id}`;
    if (titleBadge) titleBadge.textContent = `Đang sửa #${user.id}`;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateCurrentSessionIfNeeded(updatedUser) {
    const current = namespace.session?.getCurrentUser?.();
    if (!current || String(current.id) !== String(updatedUser.id)) {
      return;
    }

    const nextUser = {
      ...current,
      fullname: updatedUser.fullname,
      role: updatedUser.role
    };

    namespace.session?.setCurrentUser?.(nextUser);

    if (String(updatedUser.status || "").toUpperCase() === "LOCKED") {
      alert("Bạn vừa khóa chính tài khoản admin hiện tại. Hệ thống sẽ đăng xuất.");
      namespace.session?.clearCurrentUser?.();
      window.location.href = "main.html";
      return;
    }

    if (!namespace.utils?.isAdminRole?.(updatedUser.role)) {
      alert("Bạn vừa đổi tài khoản hiện tại khỏi quyền admin. Hệ thống sẽ quay về trang chủ.");
      namespace.session?.setCurrentUser?.(nextUser);
      window.location.href = "main.html";
    }
  }

  function bindTableEvents() {
    document.querySelectorAll(".btn-edit-account").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const user = allUsers.find((item) => String(item.id) === String(id));
        if (user) {
          fillForm(user);
        }
      });
    });

    document.querySelectorAll(".btn-toggle-lock").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        const user = allUsers.find((item) => String(item.id) === String(id));
        if (!user) return;

        const nextStatus = String(user.status || "").toUpperCase() === "LOCKED" ? "ACTIVE" : "LOCKED";
        const confirmText = nextStatus === "LOCKED"
          ? `Bạn có chắc muốn khóa tài khoản ${user.email}?`
          : `Bạn có chắc muốn mở khóa tài khoản ${user.email}?`;

        if (!confirm(confirmText)) return;

        try {
          const updated = await namespace.userApi.updateUserByAdmin(id, {
            fullname: user.fullname,
            role: user.role,
            status: nextStatus
          });

          allUsers = allUsers.map((item) => String(item.id) === String(updated.id) ? updated : item);
          updateCurrentSessionIfNeeded(updated);
          renderTable();
        } catch (error) {
          alert(error.message || "Không cập nhật được trạng thái tài khoản");
        }
      });
    });
  }

  function renderTable() {
    const tbody = document.getElementById("accounts-table-body");
    const countBadge = document.getElementById("accounts-count-badge");
    if (!tbody) return;

    if (countBadge) {
      countBadge.textContent = `${allUsers.length} tài khoản`;
    }

    if (!allUsers.length) {
      tbody.innerHTML = '<tr><td colspan="5">Chưa có tài khoản nào.</td></tr>';
      return;
    }

    tbody.innerHTML = allUsers.map((user) => `
      <tr>
        <td>${user.fullname || ""}</td>
        <td>${user.email || ""}</td>
        <td>${formatRole(user.role)}</td>
        <td>
          <span class="order-badge ${getStatusBadgeClass(user.status)}">
            ${formatStatus(user.status)}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="badge-action badge-edit btn-edit-account" data-id="${user.id}">
              <i class="fa-solid fa-pen"></i>
              Sửa
            </button>
            <button class="badge-action badge-delete btn-toggle-lock" data-id="${user.id}">
              <i class="fa-solid ${String(user.status || "").toUpperCase() === "LOCKED" ? "fa-lock-open" : "fa-lock"}"></i>
              ${String(user.status || "").toUpperCase() === "LOCKED" ? "Mở khóa" : "Khóa"}
            </button>
          </div>
        </td>
      </tr>
    `).join("");

    bindTableEvents();
  }

  async function loadUsers() {
    const tbody = document.getElementById("accounts-table-body");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5">Đang tải tài khoản...</td></tr>';

    try {
      allUsers = await namespace.userApi.fetchAllUsers();
      renderTable();
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="5" style="color:red;">${error.message || "Không tải được danh sách tài khoản"}</td></tr>`;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!editingUserId) {
      alert("Hãy bấm nút Sửa ở một tài khoản trước khi lưu.");
      return;
    }

    const fullname = document.getElementById("acc-name")?.value?.trim() || "";
    const role = document.getElementById("acc-role")?.value || "USER";
    const status = document.getElementById("acc-status")?.value || "ACTIVE";

    if (!fullname) {
      alert("Họ tên không được để trống.");
      return;
    }

    try {
      const updated = await namespace.userApi.updateUserByAdmin(editingUserId, {
        fullname,
        role,
        status
      });

      allUsers = allUsers.map((item) => String(item.id) === String(updated.id) ? updated : item);
      updateCurrentSessionIfNeeded(updated);
      renderTable();
      fillForm(updated);
      alert("Cập nhật tài khoản thành công!");
    } catch (error) {
      alert(error.message || "Lưu tài khoản thất bại");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("account-form");
    if (!form) return;

    document.getElementById("acc-email")?.setAttribute("readonly", "readonly");
    document.getElementById("acc-note")?.setAttribute("readonly", "readonly");

    form.addEventListener("submit", handleSubmit);
    document.getElementById("btn-reset-account")?.addEventListener("click", resetForm);

    resetForm();
    loadUsers();
  });
})(window.HuiLegion);