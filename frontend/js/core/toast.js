/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: toast.js - Xu ly logic phia client (Frontend JavaScript).
 */
(function toastModule(namespace) {
    namespace = namespace || (window.HuiLegion = window.HuiLegion || {});

    function show(message, type = "success") {
        const safeMessage = message || "Có thông báo mới";
        const safeType = ["success", "error", "info", "warning"].includes(type)
            ? type
            : "info";

        let container = document.querySelector(".toast-container");

        if (!container) {
            container = document.createElement("div");
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `toast toast-${safeType}`;
        toast.textContent = safeMessage;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2800);
    }

    namespace.toast = {
        show,
        success(message) {
            show(message, "success");
        },
        error(message) {
            show(message, "error");
        },
        info(message) {
            show(message, "info");
        },
        warning(message) {
            show(message, "warning");
        }
    };
})(window.HuiLegion);
