(function adminDashboardPageModule(namespace) {
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const dashboard = document.getElementById("admin-dashboard-stats");
    if (!dashboard) return;

    try {
      const stats = await namespace.dashboardApi.fetchRevenueStats();
      setText("stat-total-revenue", namespace.utils.formatMoney(stats.totalRevenue || 0));
      setText("stat-month-revenue", namespace.utils.formatMoney(stats.monthRevenue || 0));
      setText("stat-today-revenue", namespace.utils.formatMoney(stats.todayRevenue || 0));
      setText("stat-total-orders", `${stats.totalOrders || 0} đơn`);
      setText("stat-paid-orders", `${stats.paidOrders || 0} đơn`);
      setText("stat-unpaid-orders", `${stats.unpaidOrders || 0} đơn`);
      setText("stat-pending-orders", `${stats.pendingOrders || 0} đơn`);
      setText("stat-done-orders", `${stats.doneOrders || 0} đơn`);
    } catch (error) {
      namespace.toast?.error?.(error.message || "Không tải được dashboard");
    }
  });
})(window.HuiLegion);
