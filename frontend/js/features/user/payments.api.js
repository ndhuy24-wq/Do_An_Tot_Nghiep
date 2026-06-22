/**
 * Du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * File: payments.api.js - Xu ly logic phia client (Frontend JavaScript).
 */
window.HuiLegion = window.HuiLegion || {};

(function paymentsApiModule(namespace) {
  async function readJsonOrThrow(response, defaultMessage) {
    const raw = await response.text().catch(() => "");
    const data = namespace.utils.safeJsonParse(raw, {});
    if (!response.ok) throw new Error(data.message || defaultMessage);
    return data;
  }

  async function createVnPayPayment(amount, orderInfo, returnUrl) {
    const response = await fetch(`${namespace.getApiBaseUrl()}/payments/vnpay/create-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, orderInfo, returnUrl })
    });
    return readJsonOrThrow(response, "Không tạo được link thanh toán VNPay");
  }

  namespace.paymentsApi = { createVnPayPayment };
})(window.HuiLegion);
