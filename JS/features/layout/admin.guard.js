window.HuiLegion = window.HuiLegion || {};

(function adminGuardModule(namespace) {
  function redirectHome() {
    window.location.href = "main.html";
  }

  function checkAdminAccess() {
    const path = window.location.pathname;
    const isAdminPage =
      path.includes("admin.html") ||
      path.includes("admin_orders.html") ||
      path.includes("admin_accounts.html");
      path.includes("admin_service_requests.html");

    if (!isAdminPage) return true;

    const user = namespace.session?.getCurrentUser?.();
    const isAdmin = namespace.utils?.isAdminRole?.(user?.role);

    if (!user || !isAdmin) {
      alert("Bạn không có quyền truy cập trang quản trị!");
      if (user) {
        namespace.session?.clearCurrentUser?.();
      }
      redirectHome();
      return false;
    }

    return true;
  }

  namespace.adminGuard = { checkAdminAccess };
  window.checkAdminAccess = checkAdminAccess;

  document.addEventListener("DOMContentLoaded", checkAdminAccess);
})(window.HuiLegion);
