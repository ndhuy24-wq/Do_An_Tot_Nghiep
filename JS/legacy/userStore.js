// js/userStore.js
// CHỈ quản lý session user + gọi API
// KHÔNG dùng localStorage cho users / profile / orders

const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

const CURRENT_USER_KEY = "hui_legion_current_user";

/* ======================================================
   SESSION USER (login state)
====================================================== */

function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch {
        return null;
    }
}

function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

/* ======================================================
   API – USER PROFILE
====================================================== */

// GET /api/user/{email}
async function fetchUserProfile(email) {
    const res = await fetch(`${API_BASE_URL}/user/${email}`);
    if (!res.ok) throw new Error("Không tải được profile");
    return res.json();
}

// PUT /api/user/{email}/profile
async function updateUserProfile(email, payload) {
    const res = await fetch(`${API_BASE_URL}/user/${email}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Cập nhật thất bại");
    }

    return res.json();
}

/* ======================================================
   API – ORDERS
====================================================== */

// GET /api/orders?email=...
async function fetchMyOrders(email) {
    // encode email để tránh lỗi ký tự đặc biệt
    const res = await fetch(`${API_BASE_URL}/orders?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error("Không tải được đơn hàng");
    return res.json();
}

// GET /api/orders/{id}
async function fetchOrderDetail(id) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!res.ok) throw new Error("Không tải được chi tiết đơn");
    return res.json();
}

/* ======================================================
   UI – ACCOUNT INFO PAGE
====================================================== */

async function initAccountInfoPage() {
    const form = document.getElementById("account-form");
    if (!form) return;

    const user = getCurrentUser();
    if (!user || !user.email) {
        alert("Vui lòng đăng nhập");
        window.location.href = "login.html";
        return;
    }

    const emailInput = document.getElementById("acc-email");
    const nameInput = document.getElementById("acc-name");
    const phoneInput = document.getElementById("acc-phone");
    const oldPassInput = document.getElementById("old_password");
    const newPassInput = document.getElementById("new_password");

    let profile = {};

    try {
        profile = await fetchUserProfile(user.email);
    } catch {
        profile = user;
    }

    if (emailInput) emailInput.value = profile.email || user.email || "";
    if (nameInput) nameInput.value = profile.fullname || user.fullname || "";
    if (phoneInput) phoneInput.value = profile.phone || "";

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fullnameVal = (nameInput?.value || "").trim();
        const phoneVal = (phoneInput?.value || "").trim();

        if (!fullnameVal) {
            alert("Họ và tên không được để trống.");
            return;
        }

        const payload = { fullname: fullnameVal, phone: phoneVal };

        const oldPassVal = (oldPassInput?.value || "").trim();
        const newPassVal = (newPassInput?.value || "").trim();

        // nếu muốn đổi mật khẩu thì phải nhập đủ 2 trường
        if ((oldPassVal && !newPassVal) || (!oldPassVal && newPassVal)) {
            alert("Vui lòng nhập đầy đủ Mật khẩu cũ và Mật khẩu mới.");
            return;
        }

        if (oldPassVal && newPassVal) {
            payload.oldPassword = oldPassVal;
            payload.newPassword = newPassVal;
        }

        try {
            const updated = await updateUserProfile(user.email, payload);

            // ✅ SỬA LỖI LOGOUT:
            // luôn merge với currentUser MỚI NHẤT để không mất email/role/field khác
            const cur = getCurrentUser() || user;
            setCurrentUser({
                ...cur,
                email: cur.email || user.email, // giữ chắc email
                fullname: updated.fullname ?? fullnameVal,
                phone: updated.phone ?? phoneVal
            });

            if (oldPassInput) oldPassInput.value = "";
            if (newPassInput) newPassInput.value = "";

            alert("Cập nhật thông tin thành công!");
            if (typeof setupHeaderUser === "function") setupHeaderUser();

        } catch (err) {
            alert(err.message);
        }
    });
}

/* ======================================================
   UI – MY ORDERS PAGE
====================================================== */

function formatOrderStatus(status) {
    switch (status) {
        case "pending": return "Chờ xử lý";
        case "paid": return "Đã thanh toán";
        case "shipping": return "Đang giao";
        case "done": return "Hoàn thành";
        case "cancel": return "Đã hủy";
        default: return status || "";
    }
}

async function initMyOrdersPage() {
    const tbody = document.getElementById("orders-body");
    if (!tbody) return;

    const user = getCurrentUser();
    if (!user || !user.email) {
        alert("Vui lòng đăng nhập");
        window.location.href = "login.html";
        return;
    }

    let orders = [];
    try {
        orders = await fetchMyOrders(user.email);
    } catch (err) {
        alert(err.message);
        return;
    }

    if (!orders.length) {
        const empty = document.getElementById("orders-empty");
        if (empty) empty.style.display = "block";
        return;
    }

    tbody.innerHTML = "";

    orders.forEach(order => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${order.code || "HD" + order.id}</td>
            <td>${order.createdAt || ""}</td>
            <td>${(order.total || 0).toLocaleString("vi-VN")}đ</td>
            <td>${formatOrderStatus(order.status)}</td>
            <td>
                <button data-id="${order.id}" class="btn-order-detail">Xem</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll(".btn-order-detail").forEach(btn => {
        btn.addEventListener("click", async () => {
            try {
                const id = btn.dataset.id;
                const order = await fetchOrderDetail(id);

                let msg = `Mã đơn: ${order.code || "HD" + order.id}\n`;
                msg += `Trạng thái: ${formatOrderStatus(order.status)}\n\n`;

                (order.items || []).forEach(it => {
                    msg += `- ${it.name} x${it.quantity}\n`;
                });

                alert(msg);
            } catch (e) {
                alert(e.message || "Không tải được chi tiết đơn");
            }
        });
    });
}

/* ======================================================
   INIT
====================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initAccountInfoPage();
    initMyOrdersPage();

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            window.location.href = "main.html";
        });
    }
});
