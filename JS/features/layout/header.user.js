window.HuiLegion = window.HuiLegion || {};

(function headerUserModule(namespace) {
  function createAdminMenuItem(user) {
    if (!namespace.utils.isAdminRole(user?.role)) {
      return "";
    }

    return `
      <a href="admin.html" class="user-menu-item admin-menu-item">
        <i class="fa-solid fa-user-shield"></i>
        <span>Trang Quản Trị</span>
      </a>
      <div class="user-menu-divider"></div>
    `;
  }

  function buildLoggedInMenu(user) {
    const fullName = user.fullname || user.fullName || user.name || user.email || "User";

    return `
      <button class="header-user-toggle" type="button">
        <span class="header-user-name">${fullName}</span>
        <i class="fa-solid fa-chevron-down header-user-caret"></i>
      </button>

      <div class="header-user-menu">
        <div class="header-user-info">
          <div class="user-name">${fullName}</div>
          <div class="user-email">${user.email || ""}</div>
        </div>

        ${createAdminMenuItem(user)}

        <a href="account_info.html" class="user-menu-item">
          <i class="fa-solid fa-user"></i>
          <span>Thông Tin Tài Khoản</span>
        </a>

        <a href="my_orders.html" class="user-menu-item">
          <i class="fa-solid fa-box"></i>
          <span>Đơn Hàng Của Tôi</span>
        </a>

        <a href="my_service_requests.html" class="user-menu-item">
          <i class="fa-solid fa-screwdriver-wrench"></i>
          <span>Dịch Vụ Của Tôi</span>
        </a>
        
        <button type="button" class="user-menu-item user-logout-btn">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Đăng Xuất</span>
        </button>
      </div>
    `;
  }

  function buildGuestMenu() {
    return `
      <button class="header-user-toggle header-user-guest-toggle" type="button">
        <i class="fa-solid fa-user"></i>
      </button>

      <div class="header-user-menu">
        <a href="login.html" class="user-menu-item">
          <i class="fa-solid fa-right-to-bracket"></i>
          <span>Đăng Nhập</span>
        </a>

        <a href="register.html" class="user-menu-item">
          <i class="fa-solid fa-user-plus"></i>
          <span>Đăng Ký</span>
        </a>
      </div>
    `;
  }

  function enhanceHeader(headerEl) {
    const iconsDiv = headerEl.querySelector(".icons");
    if (!iconsDiv || iconsDiv.dataset.userEnhanced === "1") return;

    const user = namespace.session?.getCurrentUser?.() || null;

    if (user) {
      const loginIcon = iconsDiv.querySelector('a[href="login.html"]');
      if (loginIcon) {
        loginIcon.remove();
      }

      const wrapper = document.createElement("div");
      wrapper.className = "header-user-dropdown";
      wrapper.innerHTML = buildLoggedInMenu(user);
      iconsDiv.appendChild(wrapper);
      iconsDiv.dataset.userEnhanced = "1";

      const logoutBtn = wrapper.querySelector(".user-logout-btn");
      logoutBtn?.addEventListener("click", () => {
        namespace.session?.clearCurrentUser?.();
        window.location.href = "main.html";
      });
      return;
    }

    const loginIcon = iconsDiv.querySelector('a[href="login.html"]');
    if (!loginIcon) return;

    const wrapper = document.createElement("div");
    wrapper.className = "header-user-dropdown";
    wrapper.innerHTML = buildGuestMenu();
    loginIcon.replaceWith(wrapper);
    iconsDiv.dataset.userEnhanced = "1";
  }

  function setupHeaderUser(doc = document) {
    doc.querySelectorAll("header").forEach(enhanceHeader);
  }

  namespace.headerUser = { setupHeaderUser };
  window.setupHeaderUser = setupHeaderUser;

  document.addEventListener("DOMContentLoaded", () => setupHeaderUser());
})(window.HuiLegion);