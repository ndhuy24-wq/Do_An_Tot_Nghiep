(function adminOrdersPageModule(namespace) {
    let allOrders = [];
    let currentPage = 1;
    const pageSize = 8;

    function normalizePaymentStatus(status) {
        return String(status || "").toUpperCase();
    }

    function formatPaymentMethod(method) {
        switch ((method || "").toUpperCase()) {
            case "COD":
                return "COD";
            case "BANK_TRANSFER":
                return "Chuyển khoản";
            case "VNPAY":
                return "VNPay";
            case "MOMO":
                return "MoMo";
            default:
                return method || "Không rõ";
        }
    }

    function formatPaymentStatus(status) {
        switch (normalizePaymentStatus(status)) {
            case "PAID":
                return "Đã thanh toán";

            case "UNPAID":
                return "Chưa thanh toán";

            default:
                return status || "Không rõ";
        }
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function renderOrderItems(order) {
        const items = order.items || [];

        if (!items.length) {
            return `
                <div class="order-empty-items">
                    Chưa có sản phẩm trong đơn hàng này.
                </div>
            `;
        }

        return items.map((item) => `
            <div class="order-detail-item">
                <div class="order-detail-item-info">
                    <strong>${escapeHtml(item.name || "Sản phẩm")}</strong>
                    <span>Số lượng: ${escapeHtml(item.quantity || 0)}</span>
                </div>

                <div class="order-detail-item-price">
                    ${namespace.utils.formatMoney(item.lineTotal || 0)}
                </div>
            </div>
        `).join("");
    }

    function openOrderDetailModal(order) {
        const modal = document.getElementById("order-detail-modal");
        const content = document.getElementById("order-detail-content");

        if (!modal || !content) {
            namespace.toast?.warning?.("Không tìm thấy khung chi tiết đơn hàng.");
            return;
        }

        const orderCode = order.code || `HD${order.id}`;
        const paymentStatus = normalizePaymentStatus(order.paymentStatus);

        content.innerHTML = `
            <div class="order-detail-summary">
                <div>
                    <p class="order-detail-subtitle">Mã đơn</p>
                    <h3>${escapeHtml(orderCode)}</h3>
                </div>

                <div class="order-detail-total">
                    <span>Tổng tiền</span>
                    <strong>${namespace.utils.formatMoney(order.total || 0)}</strong>
                </div>
            </div>

            <div class="order-detail-grid">
                <div class="order-detail-box">
                    <span>Khách hàng</span>
                    <strong>${escapeHtml(order.customerName || "Không rõ")}</strong>
                </div>

                <div class="order-detail-box">
                    <span>Email</span>
                    <strong>${escapeHtml(order.userEmail || "Chưa có")}</strong>
                </div>

                <div class="order-detail-box">
                    <span>Số điện thoại</span>
                    <strong>${escapeHtml(order.customerPhone || "Chưa có")}</strong>
                </div>

                <div class="order-detail-box">
                    <span>Ngày đặt</span>
                    <strong>${escapeHtml(order.createdAt || "Chưa có")}</strong>
                </div>

                <div class="order-detail-box order-detail-box-full">
                    <span>Địa chỉ giao hàng</span>
                    <strong>${escapeHtml(order.shippingAddress || "Chưa có")}</strong>
                </div>

                <div class="order-detail-box">
                    <span>Trạng thái đơn</span>
                    <strong>${escapeHtml(namespace.ordersApi.formatOrderStatus(order.status))}</strong>
                </div>

                <div class="order-detail-box">
                    <span>Phương thức thanh toán</span>
                    <strong>${escapeHtml(formatPaymentMethod(order.paymentMethod))}</strong>
                </div>

                <div class="order-detail-box">
                    <span>TT thanh toán</span>
                    <strong class="payment-text payment-text-${paymentStatus}">
                        ${escapeHtml(formatPaymentStatus(paymentStatus))}
                    </strong>
                </div>
            </div>

            <div class="order-detail-products">
                <h3>Sản phẩm trong đơn</h3>
                ${renderOrderItems(order)}
            </div>
            <div style="text-align:right;margin-top:20px;">
                <button type="button" class="btn btn-primary" id="btn-print-current-order">
                    <i class="fa-solid fa-print"></i> In hóa đơn
                </button>
            </div>
        `;

        modal.classList.add("active");
        document.body.classList.add("modal-open");
        document.getElementById("btn-print-current-order")?.addEventListener("click", () => printOrderInvoice(order));
    }

    function printOrderInvoice(order) {
        const items = (order.items || []).map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(item.name || "Sản phẩm")}</td>
                <td>${item.quantity || 0}</td>
                <td>${namespace.utils.formatMoney(item.price || 0)}</td>
                <td>${namespace.utils.formatMoney(item.lineTotal || 0)}</td>
            </tr>
        `).join("");

        const win = window.open("", "_blank");
        win.document.write(`
            <html><head><title>Hóa đơn ${escapeHtml(order.code || `HD${order.id}`)}</title>
            <style>body{font-family:Arial;padding:28px;color:#111}h1{color:#dc2626}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f3f4f6}.total{text-align:right;font-size:22px;font-weight:800;margin-top:20px}</style>
            </head><body>
            <h1>HUI LEGION - HÓA ĐƠN</h1>
            <p><b>Mã đơn:</b> ${escapeHtml(order.code || `HD${order.id}`)}</p>
            <p><b>Khách hàng:</b> ${escapeHtml(order.customerName || "")}</p>
            <p><b>Email:</b> ${escapeHtml(order.userEmail || "")}</p>
            <p><b>Địa chỉ:</b> ${escapeHtml(order.shippingAddress || "")}</p>
            <p><b>Ngày đặt:</b> ${escapeHtml(order.createdAt || "")}</p>
            <table><thead><tr><th>STT</th><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>${items}</tbody></table>
            <div class="total">Tổng: ${namespace.utils.formatMoney(order.total || 0)}</div>
            </body></html>
        `);
        win.document.close();
        win.focus();
        win.print();
    }

    function closeOrderDetailModal() {
        document.getElementById("order-detail-modal")?.classList.remove("active");
        document.body.classList.remove("modal-open");
    }

    function getFilteredOrders() {
        const codeKeyword =
            document.getElementById("filter-code")?.value?.trim()?.toLowerCase() || "";

        const customerKeyword =
            document.getElementById("filter-customer")?.value?.trim()?.toLowerCase() || "";

        const status =
            document.getElementById("filter-status")?.value || "";

        const paymentStatus =
            document.getElementById("filter-payment-status")?.value || "";

        return allOrders.filter((order) => {

            const matchesCode =
                !codeKeyword ||
                String(order.code || "")
                    .toLowerCase()
                    .includes(codeKeyword);

            const customerText =
                `${order.customerName || ""} ${order.userEmail || ""}`
                    .toLowerCase();

            const matchesCustomer =
                !customerKeyword ||
                customerText.includes(customerKeyword);

            const matchesStatus =
                !status ||
                order.status === status;

            const matchesPaymentStatus =
                !paymentStatus ||
                String(order.paymentStatus || "").toUpperCase() === paymentStatus;

            return matchesCode &&
                matchesCustomer &&
                matchesStatus &&
                matchesPaymentStatus;
        });
    }
    function updateLocalOrder(updatedOrder) {
        const index = allOrders.findIndex(
            (order) => String(order.id) === String(updatedOrder.id)
        );

        if (index >= 0) {
            allOrders[index] = updatedOrder;
        }
    }

    function bindRowEvents(tbody) {
        tbody.querySelectorAll(".btn-view-order").forEach((button) => {
            button.addEventListener("click", async () => {
                try {
                    const order =
                        await namespace.ordersApi.fetchOrderDetail(button.dataset.id);

                    openOrderDetailModal(order);
                } catch (error) {
                    namespace.toast.error(error.message || "Không tải được chi tiết đơn");
                }
            });
        });

        tbody.querySelectorAll(".order-status-select").forEach((select) => {
            select.addEventListener("change", async () => {
                try {
                    const updated =
                        await namespace.ordersApi.updateOrderStatus(
                            select.dataset.id,
                            select.value
                        );

                    updateLocalOrder(updated);
                    namespace.toast.success("Cập nhật trạng thái đơn hàng thành công");
                    renderTable();
                } catch (error) {
                    namespace.toast.error(error.message || "Cập nhật trạng thái thất bại");
                    renderTable();
                }
            });
        });

        tbody.querySelectorAll(".payment-status-select").forEach((select) => {
            select.addEventListener("change", async () => {
                try {
                    const updated =
                        await namespace.ordersApi.updatePaymentStatus(
                            select.dataset.id,
                            select.value
                        );

                    updateLocalOrder(updated);
                    namespace.toast.success("Cập nhật trạng thái thanh toán thành công");
                    renderTable();
                } catch (error) {
                    namespace.toast.error(error.message || "Cập nhật trạng thái thanh toán thất bại");
                    renderTable();
                }
            });
        });
    }

    function renderPagination(totalItems) {
        const el = document.getElementById("orders-pagination");
        if (!el) return;

        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;

        el.innerHTML = `
            <button class="btn btn-secondary" id="orders-prev-page" ${currentPage <= 1 ? "disabled" : ""}>Trước</button>
            <span class="pagination-info">Trang ${currentPage}/${totalPages}</span>
            <button class="btn btn-secondary" id="orders-next-page" ${currentPage >= totalPages ? "disabled" : ""}>Sau</button>
        `;

        document.getElementById("orders-prev-page")?.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });

        document.getElementById("orders-next-page")?.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
    }

    function downloadCsv(filename, rows) {
        const csv = rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
        const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    function exportOrdersExcel() {
        const rows = [["Mã đơn", "Khách hàng", "Email", "Ngày đặt", "Tổng tiền", "PTTT", "TT thanh toán", "Trạng thái"]];
        getFilteredOrders().forEach(order => rows.push([
            order.code || `HD${order.id}`,
            order.customerName || "",
            order.userEmail || "",
            order.createdAt || "",
            order.total || 0,
            formatPaymentMethod(order.paymentMethod),
            formatPaymentStatus(order.paymentStatus),
            namespace.ordersApi.formatOrderStatus(order.status)
        ]));
        downloadCsv("danh-sach-don-hang.csv", rows);
        namespace.toast.success("Đã xuất file Excel/CSV đơn hàng");
    }

    function exportOrdersPdf() {
        const rows = getFilteredOrders().map(order => `
            <tr>
                <td>${escapeHtml(order.code || `HD${order.id}`)}</td>
                <td>${escapeHtml(order.customerName || "")}</td>
                <td>${escapeHtml(order.createdAt || "")}</td>
                <td>${namespace.utils.formatMoney(order.total || 0)}</td>
                <td>${escapeHtml(formatPaymentStatus(order.paymentStatus))}</td>
                <td>${escapeHtml(namespace.ordersApi.formatOrderStatus(order.status))}</td>
            </tr>
        `).join("");

        const win = window.open("", "_blank");
        win.document.write(`
            <html><head><title>Danh sách đơn hàng</title>
            <style>body{font-family:Arial;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}</style>
            </head><body>
            <h1>Danh sách đơn hàng - HUI LEGION</h1>
            <table>
                <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
            </body></html>
        `);
        win.document.close();
        win.focus();
        win.print();
    }

    function renderTable() {
        const tbody = document.getElementById("orders-table-body");
        const countBadge = document.getElementById("orders-count-badge");

        if (!tbody) return;

        const filteredOrders = getFilteredOrders();
        const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * pageSize;
        const orders = filteredOrders.slice(start, start + pageSize);

        if (countBadge) {
            countBadge.textContent = `${filteredOrders.length} đơn`;
        }

        if (!orders.length) {
            tbody.innerHTML =
                '<tr><td colspan="8">Không có đơn hàng phù hợp.</td></tr>';
            renderPagination(0);
            return;
        }

        tbody.innerHTML = orders.map((order) => {
            const paymentStatus = normalizePaymentStatus(order.paymentStatus);

            return `
                <tr>
                    <td>${order.code || `HD${order.id}`}</td>

                    <td>
                        <div style="font-weight:600;">
                            ${order.customerName || "Không rõ"}
                        </div>
                        <div style="font-size:12px;color:#666;">
                            ${order.userEmail || ""}
                        </div>
                    </td>

                    <td>${order.createdAt || ""}</td>

                    <td>${namespace.utils.formatMoney(order.total || 0)}</td>

                    <td>${formatPaymentMethod(order.paymentMethod)}</td>

                    <td>
                        <span class="payment-badge payment-badge-${paymentStatus}">
                            ${formatPaymentStatus(paymentStatus)}
                        </span>

                        <div style="margin-top:8px;">
                            <select class="payment-status-select"
                                    data-id="${order.id}"
                                    style="padding:8px;border-radius:8px;border:1px solid #ddd;">
                                <option value="UNPAID" ${paymentStatus === "UNPAID" ? "selected" : ""}>
                                    Chưa thanh toán
                                </option>
                                <option value="PAID" ${paymentStatus === "PAID" ? "selected" : ""}>
                                    Đã thanh toán
                                </option>
                            </select>
                        </div>
                    </td>

                    <td>
                        <span class="order-badge order-badge-${order.status}">
                            ${namespace.ordersApi.formatOrderStatus(order.status)}
                        </span>

                        <div style="margin-top:8px;">
                            <select class="order-status-select"
                                    data-id="${order.id}"
                                    style="padding:8px;border-radius:8px;border:1px solid #ddd;">
                                <option value="pending" ${order.status === "pending" ? "selected" : ""}>Chờ xử lý</option>
                                <option value="shipping" ${order.status === "shipping" ? "selected" : ""}>Đang giao</option>
                                <option value="done" ${order.status === "done" ? "selected" : ""}>Hoàn thành</option>
                                <option value="cancel" ${order.status === "cancel" ? "selected" : ""}>Đã hủy</option>
                            </select>
                        </div>
                    </td>

                    <td>
                        <div class="table-actions">
                            <button class="badge-action badge-edit btn-view-order"
                                    data-id="${order.id}">
                                <i class="fa-solid fa-eye"></i>
                                Xem
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        bindRowEvents(tbody);
        renderPagination(filteredOrders.length);
    }

    async function loadOrders() {
        const tbody = document.getElementById("orders-table-body");

        if (!tbody) return;

        tbody.innerHTML =
            '<tr><td colspan="8">Đang tải đơn hàng...</td></tr>';

        try {
            allOrders = await namespace.ordersApi.fetchAllOrders();
            renderTable();
        } catch (error) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="color:red;">
                        ${error.message || "Không tải được đơn hàng"}
                    </td>
                </tr>
            `;
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const page = document.getElementById("orders-table-body");
        if (!page) return;

        document
            .getElementById("btn-filter-orders")
            ?.addEventListener("click", () => { currentPage = 1; renderTable(); });

        document
            .getElementById("filter-payment-status")
            ?.addEventListener("change", () => { currentPage = 1; renderTable(); });

        document
            .getElementById("filter-status")
            ?.addEventListener("change", () => { currentPage = 1; renderTable(); });

        document.getElementById("btn-export-orders-excel")?.addEventListener("click", exportOrdersExcel);
        document.getElementById("btn-export-orders-pdf")?.addEventListener("click", exportOrdersPdf);

        document
            .getElementById("orders-filter-form")
            ?.addEventListener("reset", () => {
                setTimeout(() => { currentPage = 1; renderTable(); }, 0);
            });

        document
            .getElementById("close-order-modal")
            ?.addEventListener("click", closeOrderDetailModal);

        document
            .getElementById("order-detail-modal")
            ?.addEventListener("click", (event) => {
                if (event.target.id === "order-detail-modal") {
                    closeOrderDetailModal();
                }
            });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeOrderDetailModal();
            }
        });

        loadOrders();
    });
})(window.HuiLegion);