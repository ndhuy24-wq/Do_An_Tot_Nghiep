(function accountInfoPageModule(namespace) {
  function requireLoginUser() {
    const user = namespace.session?.getCurrentUser?.();
    if (!user?.email) {
      alert("Vui lòng đăng nhập");
      window.location.href = "login.html";
      return null;
    }
    return user;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("account-form");
    if (!form) return;

    const user = requireLoginUser();
    if (!user) return;

    const emailInput = document.getElementById("acc-email");
    const nameInput = document.getElementById("acc-name");
    const phoneInput = document.getElementById("acc-phone");
    const oldPassInput = document.getElementById("old_password");
    const newPassInput = document.getElementById("new_password");
    const logoutBtn = document.getElementById("btn-logout");

    let profile = user;
    try {
      profile = await namespace.userApi.fetchProfile(user.email);
    } catch (error) {
      profile = user;
    }

    if (emailInput) emailInput.value = profile.email || user.email || "";
    if (nameInput) nameInput.value = profile.fullname || user.fullname || "";
    if (phoneInput) phoneInput.value = profile.phone || "";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const fullname = nameInput?.value?.trim() || "";
      const phone = phoneInput?.value?.trim() || "";
      const oldPassword = oldPassInput?.value?.trim() || "";
      const newPassword = newPassInput?.value?.trim() || "";

      if (!fullname) {
        alert("Họ và tên không được để trống.");
        return;
      }

      if ((oldPassword && !newPassword) || (!oldPassword && newPassword)) {
        alert("Vui lòng nhập đầy đủ Mật khẩu cũ và Mật khẩu mới.");
        return;
      }

      const payload = { fullname, phone };
      if (oldPassword && newPassword) {
        payload.oldPassword = oldPassword;
        payload.newPassword = newPassword;
      }

      try {
        const updated = await namespace.userApi.updateProfile(user.email, payload);
        const current = namespace.session?.getCurrentUser?.() || user;

        namespace.session?.setCurrentUser?.({
          ...current,
          email: current.email || user.email,
          fullname: updated.fullname ?? fullname,
          phone: updated.phone ?? phone
        });

        if (oldPassInput) oldPassInput.value = "";
        if (newPassInput) newPassInput.value = "";

        alert("Cập nhật thông tin thành công!");
        window.setupHeaderUser?.();
      } catch (error) {
        alert(error.message || "Cập nhật thất bại");
      }
    });

    logoutBtn?.addEventListener("click", () => {
      window.location.href = "main.html";
    });
  });
})(window.HuiLegion);
