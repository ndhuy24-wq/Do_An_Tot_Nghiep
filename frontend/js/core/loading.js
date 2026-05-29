(function loadingModule(namespace) {
  function ensureEl() {
    let el = document.querySelector(".global-loading");
    if (!el) {
      el = document.createElement("div");
      el.className = "global-loading";
      el.innerHTML = '<div class="global-loading-spinner"></div><div>Đang xử lý...</div>';
      document.body.appendChild(el);
    }
    return el;
  }
  namespace.loading = {
    show() { ensureEl().classList.add("active"); },
    hide() { ensureEl().classList.remove("active"); }
  };
})(window.HuiLegion);
