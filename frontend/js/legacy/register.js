// js/register.js

document.addEventListener("DOMContentLoaded", function () {
    console.log("register.js đã chạy");

    const form = document.getElementById("register-form");
    if (!form) {
        console.warn("Không tìm thấy #register-form");
        return;
    }

    const fullnameInput   = document.getElementById("fullname");
    const emailInput      = document.getElementById("email");
    const passwordInput   = document.getElementById("password");
    const repasswordInput = document.getElementById("repassword");
    const agreeCheckbox   = document.getElementById("agree");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const fullname   = fullnameInput.value.trim();
        const email      = emailInput.value.trim();
        const password   = passwordInput.value.trim();
        const repassword = repasswordInput.value.trim();
        const agreed     = agreeCheckbox.checked;

        // Validate cơ bản
        if (!fullname || !email || !password || !repassword) {
            alert("Vui lòng nhập đầy đủ tất cả các trường.");
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            alert("Email không hợp lệ.");
            return;
        }

        if (password.length < 6) {
            alert("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        if (password !== repassword) {
            alert("Mật khẩu nhập lại không khớp.");
            return;
        }

        if (!agreed) {
            alert("Bạn cần đồng ý với Điều khoản sử dụng.");
            return;
        }

        const payload = { fullname, email, password };

        console.log("Gửi request đăng ký:", payload);

        fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(async (res) => {
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || "Đăng ký thất bại, vui lòng thử lại.");
                }
                return res.json();
            })
            .then((data) => {
                console.log("Đăng ký thành công, backend trả về:", data);
                alert("Đăng ký thành công! Mời bạn đăng nhập.");
                window.location.href = "login.html";
            })
            .catch((err) => {
                console.error("Lỗi khi đăng ký:", err);
                alert(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
            });
    });
});
