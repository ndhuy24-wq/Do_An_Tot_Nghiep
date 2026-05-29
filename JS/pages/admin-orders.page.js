(function adminOrdersPageModule(namespace) {
    let allOrders = [];

    function formatPaymentMethod(method) {
        switch ((method || "").toUpperCase()) {
            case "COD": return "COD";
            case "BANK_TRANSFER": return "Chuyển khoản";
            case "VNPAY": return "VNPay";
            case "MOMO": return "MoMo";
            default: return method || "Không rõ";
        }
    }

    function formatPaymentStatus(status) {
        switch ((status || "").toUpperCase()) {
            case "PAID": return "Đã thanh toán";
            case "UNPAID": return "Chưa thanh toán";
            default: return status || "Không rõ";
        }
    }

    function buildOrderDetailMessage(order) {
        let message = `Mã đơn: ${order.code || `HD${order.id}`}\n`;
        message += `Khách hàng: ${order.customerName || order.userEmail || ""}\n`;
        message += `Email: ${order.userEmail || ""}\n`;
        message += `SĐT: ${order.customerPhone || "Chưa có"}\n`;
        message += `Địa chỉ: ${order.shippingAddress || "Chưa có"}\n`;
        message += `Ngày đặt: ${order.createdAt || ""}\n`;
        message += `Trạng thái đơn: ${namespace.ordersApi.formatOrderStatus(order.status)}\n`;
        message += `Phương thức TT: ${formatPaymentMethod(order.paymentMethod)}\n`;
        message += `Thanh toán: ${formatPaymentStatus(order.paymentStatus)}\n`;
        message += `Tổng tiền: ${namespace.utils.formatMoney(order.total || 0)}\n\n`;

        message += "Sản phẩm:\n";
        (order.items || []).forEach((item) => {
            message += `- ${item.name} x${item.quantity} = ${namespace.utils.formatMoney(item.lineTotal || 0)}\n`;
        });

        return message;
    }

    function getFilteredOrders() {
        const codeKeyword =
            document.getElementById("filter-code")?.value?.trim()?.toLowerCase() || "";

        const customerKeyword =
            document.getElementById("filter-customer")?.value?.trim()?.toLowerCase() || "";

        const status = document.getElementById("filter-status")?.value || "";

        return allOrders.filter((order) => {
            const matchesCode =
                !codeKeyword ||
                String(order.code || "").toLowerCase().includes(codeKeyword);

            const customerText =
                `${order.customerName || ""} ${order.userEmail || ""}`.toLowerCase();

            const matchesCustomer =
                !customerKeyword || customerText.includes(customerKeyword);

            const matchesStatus =
                !status || order.status === status;

            return matchesCode && matchesCustomer && matchesStatus;
        });
    }

    function bindRowEvents(tbody) {
        // XEM CHI TIẾT
        tbody.querySelectorAll(".btn-view-order").forEach((button) => {
            button.addEventListener("click", async () => {
                try {
                    const order =
                        await namespace.ordersApi.fetchOrderDetail(button.dataset.id);

                    alert(buildOrderDetailMessage(order));
                } catch (error) {
                    alert(error.message || "Không tải được chi tiết đơn");
                }
            });
        });

        // UPDATE TRẠNG THÁI ĐƠN
        tbody.querySelectorAll(".order-status-select").forEach((select) => {
            select.addEventListener("change", async () => {
                try {
                    await namespace.ordersApi.updateOrderStatus(
                        select.dataset.id,
                        select.value
                    );

                    await loadOrders(); // 🔥 reload chuẩn
                } catch (error) {
                    alert(error.message || "Cập nhật trạng thái thất bại");
                }
            });
        });
    }

    function renderTable() {
        const tbody = document.getElementById("orders-table-body");
        const countBadge = document.getElementById("orders-count-badge");

        if (!tbody) return;

        const orders = getFilteredOrders();

        if (countBadge) {
            countBadge.textContent = `${orders.length} đơn`;
        }

        if (!orders.length) {
            tbody.innerHTML =
                '<tr><td colspan="8">Không có đơn hàng phù hợp.</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map((order) => `
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
                    <span class="payment-badge ${order.paymentStatus}">
                        ${formatPaymentStatus(order.paymentStatus)}
                    </span>
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
        `).join("");

        bindRowEvents(tbody);
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

        // 🔍 LỌC (local)
        document
            .getElementById("btn-filter-orders")
            ?.addEventListener("click", renderTable);

        // 🔄 LÀM MỚI (reload API)
        document
            .getElementById("orders-filter-form")
            ?.addEventListener("reset", () => {
                setTimeout(() => {
                    loadOrders(); 
                }, 0);
            });

       
        loadOrders();

        // 🔁 AUTO REFRESH (OPTIONAL)
        // setInterval(loadOrders, 5000);
    });
})(window.HuiLegion);