window.HuiLegion = window.HuiLegion || {};

(function cartGuardModule(namespace) {
  function requireCartUser() {
    const user = namespace.session?.getCurrentUser?.();
    if (!user?.email) {
      throw new Error("Vui lòng đăng nhập để xem giỏ hàng.");
    }
    return user;
  }

  function setupCartGuard(doc = document) {
    const cartIcon = doc.querySelector(".icons .fa-cart-shopping");
    if (!cartIcon || !cartIcon.parentNode) return;

    const newCartIcon = cartIcon.cloneNode(true);
    cartIcon.parentNode.replaceChild(newCartIcon, cartIcon);

    let user = null;
    try {
      user = requireCartUser();
    } catch (error) {
      user = null;
    }

    if (!user) {
      newCartIcon.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        alert("Vui lòng đăng nhập để xem giỏ hàng.");
        window.location.href = "login.html";
      });
      return;
    }

    newCartIcon.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "cart.html";
    });
  }

  namespace.cartGuard = { setupCartGuard };
  window.setupCartGuard = setupCartGuard;

  document.addEventListener("DOMContentLoaded", () => setupCartGuard());
})(window.HuiLegion);
