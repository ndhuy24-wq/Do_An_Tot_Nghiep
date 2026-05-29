(function registerPageModule(namespace) {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");
    if (!form) return;

    const fullnameInput = document.getElementById("fullname");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const repasswordInput = document.getElementById("repassword");
    const agreeCheckbox = document.getElementById("agree");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const fullname = fullnameInput?.value?.trim() || "";
      const email = emailInput?.value?.trim() || "";
      const password = passwordInput?.value?.trim() || "";
      const repassword = repasswordInput?.value?.trim() || "";
      const agreed = !!agreeCheckbox?.checked;

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

      try {
        await namespace.authApi.register({ fullname, email, password });
        alert("Đăng ký thành công! Mời bạn đăng nhập.");
        window.location.href = "login.html";
      } catch (error) {
        alert(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    });
  });
})(window.HuiLegion);
