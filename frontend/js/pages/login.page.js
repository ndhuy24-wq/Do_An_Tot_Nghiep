(function loginPageModule(namespace) {

  document.addEventListener("DOMContentLoaded", () => {

    const currentUser =
      namespace.session?.getCurrentUser?.();

    if (currentUser) {
      window.location.href = "main.html";
      return;
    }

    const form =
      document.getElementById("login-form");

    if (!form) return;

    const emailInput =
      document.getElementById("login-email");

    const passwordInput =
      document.getElementById("login-password");

    form.addEventListener("submit", async (event) => {

      event.preventDefault();

      const email =
        emailInput?.value?.trim() || "";

      const password =
        passwordInput?.value?.trim() || "";

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

        const user =
          await namespace.authApi.login({
            email,
            password
          });

        const safeUser = {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
          role: user.role
        };

        namespace.session?.setCurrentUser?.(
          safeUser
        );

        namespace.toast.success(
          `Đăng nhập thành công, xin chào ${safeUser.fullname || safeUser.email}!`
        );

        setTimeout(() => {
          window.location.href = "main.html";
        }, 1200);

      } catch (error) {

        namespace.toast.error(
          error.message ||
          "Email hoặc mật khẩu không đúng, hoặc tài khoản chưa được đăng ký."
        );
      }
    });
  });

})(window.HuiLegion);