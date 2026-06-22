/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: login.page.js - Xu ly logic phia client (Frontend JavaScript).
 */
(function loginPageModule(namespace) {

  // Lắng nghe sự kiện DOMContentLoaded để đảm bảo giao diện HTML đã được dựng xong
  document.addEventListener("DOMContentLoaded", () => {

    // Lấy thông tin user hiện tại từ session module (đã lưu ở Local Storage)
    const currentUser =
      namespace.session?.getCurrentUser?.();

    // Nếu người dùng đã đăng nhập trước đó rồi, lập tức điều hướng về trang chủ main.html
    if (currentUser) {
      window.location.href = "main.html";
      return;
    }

    // Lấy Form Đăng nhập từ DOM
    const form =
      document.getElementById("login-form");

    if (!form) return;

    // Lấy các thẻ Input email và mật khẩu
    const emailInput =
      document.getElementById("login-email");

    const passwordInput =
      document.getElementById("login-password");

    // Lắng nghe sự kiện click nút Submit Form
    form.addEventListener("submit", async (event) => {

      event.preventDefault(); // Chặn hành vi tải lại trang mặc định của Form

      const email =
        emailInput?.value?.trim() || "";

      const password =
        passwordInput?.value?.trim() || "";

      // 1. Kiểm tra dữ liệu đầu vào cơ bản (Frontend Validation)
      if (!email || !password) {
        namespace.toast.warning(
          "Vui lòng nhập đầy đủ Email và Mật khẩu."
        );
        return;
      }

      if (!email.includes("@") || !email.includes(".")) {
        namespace.toast.warning(
          "Email không hợp lệ."
        );
        return;
      }

      try {
        // 2. Gọi API đăng nhập gửi Email và Password lên Backend
        const user =
          await namespace.authApi.login({
            email,
            password
          });

        // Tạo object User an toàn loại bỏ các dữ liệu nhạy cảm
        const safeUser = {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
          role: user.role
        };

        // 3. Lưu thông tin người dùng vào Local Storage để duy trì trạng thái đăng nhập
        namespace.session?.setCurrentUser?.(
          safeUser
        );

        // Hiển thị thông báo chào mừng thành công
        namespace.toast.success(
          `Đăng nhập thành công, xin chào ${safeUser.fullname || safeUser.email}!`
        );

        // 4. Điều hướng về trang chủ sau 1.2 giây
        setTimeout(() => {
          window.location.href = "main.html";
        }, 1200);

      } catch (error) {
        // Hiển thị thông báo lỗi phản hồi từ Server
        namespace.toast.error(
          error.message ||
          "Email hoặc mật khẩu không đúng, hoặc tài khoản chưa được đăng ký."
        );
      }
    });
  });

})(window.HuiLegion);