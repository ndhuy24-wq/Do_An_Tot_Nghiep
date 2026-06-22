/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: headerUser.js - Xu ly logic phia client (Frontend JavaScript).
 */
// JS/headerUser.js
// Xử lý logic hiển thị user/dropdown và thêm Admin Guard

console.log("headerUser.js loaded");

// =======================================================
// 🛡️ ADMIN GUARD LOGIC
// =======================================================

// Hàm kiểm tra và chặn truy cập Admin
function checkAdminAccess() {
    // Chỉ chạy kiểm tra trên các trang Admin
    const isLoginPage = window.location.pathname.includes('login.html');
    const isAdminPage = window.location.pathname.includes('admin.html') || 
                        window.location.pathname.includes('admin_orders.html') ||
                        window.location.pathname.includes('admin_accounts.html');
    
    // Nếu đang ở trang login, không cần chặn
    if (isLoginPage) return;

    if (isAdminPage) {
        if (typeof getCurrentUser !== 'function') {
            // Trường hợp userStore.js chưa load
            console.error("Lỗi: Không tìm thấy getCurrentUser. Không thể kiểm tra quyền Admin.");
            return;
        }
        
        const user = getCurrentUser();

        // 1. Kiểm tra nếu chưa đăng nhập hoặc không phải ADMIN
        if (!user || user.role.toUpperCase() !== 'ADMIN') {
            alert("Bạn không có quyền truy cập trang quản trị!");
            console.warn("Truy cập ADMIN bị chặn. Điều hướng về trang chủ.");
            
            // Xóa session nếu có user không hợp lệ
            if (user && typeof clearCurrentUser === "function") {
                clearCurrentUser();
            }
            
            window.location.href = 'main.html'; 
        } else {
            console.log("Quyền ADMIN được xác nhận.");
        }
    }
}


// =======================================================
// 💻 HEADER ENHANCEMENT LOGIC
// =======================================================

function enhanceHeader(headerEl) {
    const iconsDiv = headerEl.querySelector(".icons");
    if (!iconsDiv) return;
    if (iconsDiv.dataset.userEnhanced === "1") return;

    const user = (typeof getCurrentUser === "function") ? getCurrentUser() : null;
    console.log("Header – current user:", user);

    // Thêm link Admin nếu là Admin
    let adminLinkHtml = '';
    if (user && user.role.toUpperCase() === 'ADMIN') {
        adminLinkHtml = `
            <a href="admin.html" class="user-menu-item" style="font-weight: bold; color: var(--main-color);">
                <i class="fa-solid fa-user-shield"></i> Trang Quản Trị
            </a>
            <div class="user-menu-divider" style="border-top: 1px solid #eee; margin: 5px 0;"></div>
        `;
    }

    if (user) {
        // Ưu tiên fullname
        const fullName = user.fullname || user.fullName || user.name || user.email || "User";

        // Xoá icon login cũ nếu có
        const loginIcon = iconsDiv.querySelector('a[href="login.html"]');
        if (loginIcon) loginIcon.remove();

        const wrapper = document.createElement("div");
        wrapper.className = "header-user-dropdown";

        wrapper.innerHTML = `
            <button class="header-user-toggle" type="button">
                <span class="header-user-name">${fullName}</span>
                <i class="fa-solid fa-chevron-down header-user-caret"></i>
            </button>

            <div class="header-user-menu">
                <div class="header-user-info">
                    <div class="user-name">${fullName}</div>
                    <div class="user-email">${user.email || ""}</div>
                </div>

                ${adminLinkHtml} 

                <a href="account_info.html" class="user-menu-item">
                    <i class="fa-solid fa-user"></i> Thông Tin Tài Khoản
                </a>

                <a href="my_orders.html" class="user-menu-item">
                    <i class="fa-solid fa-box"></i> Đơn Hàng Của Tôi
                </a>

                <button type="button" class="user-menu-item user-logout-btn">
                    <i class="fa-solid fa-right-from-bracket"></i> Đăng Xuất
                </button>
            </div>
        `;

        iconsDiv.appendChild(wrapper);
        iconsDiv.dataset.userEnhanced = "1";

        const logoutBtn = wrapper.querySelector(".user-logout-btn");
        logoutBtn.addEventListener("click", () => {
            if (typeof clearCurrentUser === "function") {
                clearCurrentUser();
            }
            window.location.href = "main.html";
        });

    } else {
        // CHƯA ĐĂNG NHẬP (Logic cũ)
        const loginIcon = iconsDiv.querySelector('a[href="login.html"]');
        if (!loginIcon) return;

        const wrapper = document.createElement("div");
        wrapper.className = "header-user-dropdown";

        wrapper.innerHTML = `
            <button class="header-user-toggle header-user-guest-toggle" type="button">
                <i class="fa-solid fa-user"></i>
            </button>

            <div class="header-user-menu">
                <a href="login.html" class="user-menu-item">
                    <i class="fa-solid fa-right-to-bracket"></i> Đăng Nhập
                </a>
                <a href="register.html" class="user-menu-item">
                    <i class="fa-solid fa-user-plus"></i> Đăng Ký
                </a>
            </div>
        `;

        loginIcon.replaceWith(wrapper);
        iconsDiv.dataset.userEnhanced = "1";
    }
}

function setupHeaderUser(doc = document) {
    const headers = doc.querySelectorAll("header");
    headers.forEach(enhanceHeader);
}

document.addEventListener("DOMContentLoaded", () => {
    // Bắt đầu kiểm tra quyền Admin ngay khi DOMContentLoaded
    checkAdminAccess();
    
    // Setup header
    setupHeaderUser();
});