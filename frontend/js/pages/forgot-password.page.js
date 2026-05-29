(function forgotPasswordPageModule(namespace) {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgot-password-form");
    const emailEl = document.getElementById("forgot-email");
    const tokenEl = document.getElementById("reset-token");
    const passEl = document.getElementById("reset-new-password");

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = emailEl?.value?.trim();
      if (!email) return namespace.toast.warning("Vui lòng nhập email.");
      try {
        namespace.loading?.show();
        const res = await namespace.authApi.forgotPassword(email);
        if (res.resetToken && tokenEl) tokenEl.value = res.resetToken;
        namespace.toast.success(res.message || "Đã tạo mã đặt lại mật khẩu.");
      } catch (error) {
        namespace.toast.error(error.message || "Không thể tạo mã đặt lại mật khẩu.");
      } finally { namespace.loading?.hide(); }
    });

    document.getElementById("btn-reset-password")?.addEventListener("click", async () => {
      const token = tokenEl?.value?.trim();
      const newPassword = passEl?.value?.trim();
      if (!token || !newPassword) return namespace.toast.warning("Vui lòng nhập token và mật khẩu mới.");
      try {
        namespace.loading?.show();
        await namespace.authApi.resetPassword(token, newPassword);
        namespace.toast.success("Đặt lại mật khẩu thành công.");
        setTimeout(() => window.location.href = "login.html", 1000);
      } catch (error) {
        namespace.toast.error(error.message || "Đặt lại mật khẩu thất bại.");
      } finally { namespace.loading?.hide(); }
    });
  });
})(window.HuiLegion);
