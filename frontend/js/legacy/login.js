/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: login.js - Xu ly logic phia client (Frontend JavaScript).
 */
// JS/login.js
// Xử lý logic đăng nhập và điều hướng phân quyền (ROLE_ADMIN/ROLE_USER)

document.addEventListener("DOMContentLoaded", function () {
    console.log("login.js đã chạy");

    // Nếu đã đăng nhập rồi thì đá về trang chủ
    if (typeof getCurrentUser === "function") {
        const current = getCurrentUser();
        if (current) {
            // Có thể thêm logic điều hướng phân quyền tại đây nếu cần
            window.location.href = "main.html"; 
            return;
        }
    }

    const form = document.getElementById("login-form");
    if (!form) {
        console.warn("Không tìm thấy #login-form");
        return;
    }

    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Vui lòng nhập đầy đủ Email và Mật khẩu.");
            return;
        }

        // check format email cơ bản
        if (!email.includes("@") || !email.includes(".")) {
            alert("Email không hợp lệ.");
            return;
        }

        const payload = { email, password };
        console.log("Gửi request đăng nhập:", payload);

        fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(async (res) => {
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || "Đăng nhập thất bại.");
                }
                return res.json();
            })
            .then((user) => {
                // user backend trả về: { id, fullname, email, role }

                // Chỉ lưu những field cần thiết, tránh log & lộ thêm info
                const safeUser = {
                    id: user.id,
                    email: user.email,
                    fullname: user.fullname,
                    role: user.role // Đã có trường role từ UserResponse.java
                };

                if (typeof setCurrentUser === "function") {
                    setCurrentUser(safeUser);
                } else {
                    localStorage.setItem("hui_legion_current_user", JSON.stringify(safeUser));
                }

                alert("Đăng nhập thành công, xin chào " + (safeUser.fullname || safeUser.email) + "!");
                
                // 🚨 LOGIC ĐIỀU HƯỚNG THEO VAI TRÒ 🚨
                if (safeUser.role && safeUser.role.toUpperCase() === 'ADMIN') {
                    window.location.href = 'main.html';
                } else {
                    // 2. Nếu là USER hoặc role không xác định -> Chuyển đến trang chủ
                    window.location.href = 'main.html';
                }
                // ------------------------------------
            })
            .catch((err) => {
                console.error("Lỗi khi đăng nhập:", err);
                alert(err.message || "Email hoặc mật khẩu không đúng, hoặc tài khoản chưa được đăng ký.");
            });
    });
});