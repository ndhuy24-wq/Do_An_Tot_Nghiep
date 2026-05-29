// JS/productDetail.js
function getApiBaseUrl() {
  return (
    window.API_BASE_URL ||
    (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
    "http://localhost:8080/api"
  );
}

function formatPrice(num) {
  if (num === null || num === undefined) return "";
  return Number(num).toLocaleString("vi-VN") + "đ";
}

function requireLoginUser() {
  if (typeof getCurrentUser !== "function") {
    throw new Error("Thiếu getCurrentUser() (userStore.js)");
  }
  const user = getCurrentUser();
  if (!user || !user.email) throw new Error("Vui lòng đăng nhập để mua hàng.");
  return user;
}

// POST /api/cart/items
async function apiCartAddItem(userEmail, productId, quantity) {
  const API = getApiBaseUrl();

  const res = await fetch(`${API}/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userEmail,
      productId,
      quantity
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Thêm vào giỏ thất bại.");
  }

  return res.json(); // CartResponse
}

async function loadAndRenderProductDetail() {
  const API = getApiBaseUrl();

  // ===== LẤY ID SẢN PHẨM TRÊN URL =====
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");
  const productId = idParam ? parseInt(idParam, 10) : null;

  if (!productId) {
    alert("ID sản phẩm không hợp lệ.");
    window.location.href = "products.html";
    return;
  }

  let product = null;

  try {
    const response = await fetch(`${API}/products/${productId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Không tìm thấy sản phẩm ID: ${productId}`);
    }

    product = await response.json();
  } catch (error) {
    console.error("Lỗi tải chi tiết sản phẩm:", error);
    alert("Lỗi tải sản phẩm: " + error.message);
    return;
  }

  // ===== RENDER =====

  const breadcrumbCurrent = document.querySelector(".breadcrumb .current");
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;

  const titleEl = document.querySelector(".product-title");
  if (titleEl) titleEl.textContent = product.name;
  document.title = `${product.name} - Chi Tiết Sản Phẩm`;

  const mainImgEl = document.querySelector(".product-main-image img");
  if (mainImgEl) mainImgEl.src = product.imageUrl || "";

  const discountBadge = document.querySelector(".discount-badge");
  if (discountBadge) {
    discountBadge.textContent = product.discount || "";
    discountBadge.style.display = product.discount ? "block" : "none";
  }

  const skuEl = document.querySelector(".product-sku");
  if (skuEl) skuEl.textContent = product.sku || product.productCode || "N/A";

  const priceNowEl = document.querySelector(".product-price-block .price-now");
  if (priceNowEl) priceNowEl.textContent = formatPrice(product.price);

  const priceOldEl = document.querySelector(".product-price-block .price-old");
  if (priceOldEl) priceOldEl.textContent = product.oldPrice ? formatPrice(product.oldPrice) : "";

  const savingEl = document.querySelector(".product-price-block .saving");
  if (savingEl && product.oldPrice && product.price) {
    const saving = product.oldPrice - product.price;
    savingEl.textContent = saving > 0 ? "Tiết kiệm " + formatPrice(saving) : "";
  }

  const descEl = document.getElementById("tab-des");
  if (descEl) {
    const contentP = descEl.querySelector("p");
    if (contentP) contentP.textContent = product.description || "Sản phẩm này chưa có mô tả chi tiết.";
  }

  const specTableEl = document.querySelector("#tab-spec .spec-table");
  if (specTableEl) {
    specTableEl.innerHTML = "";
    if (product.specs && product.specs.length > 0) {
      let specHtml = "";
      product.specs.forEach(spec => {
        specHtml += `
          <tr>
            <th>${spec.specKey}</th>
            <td>${spec.specValue}</td>
          </tr>
        `;
      });
      specTableEl.innerHTML = specHtml;
    } else {
      specTableEl.innerHTML = '<tr><td colspan="2">Chưa có thông số cấu hình chi tiết.</td></tr>';
    }
  }

  // Tabs
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(targetId);
      if (target) target.classList.add("active");
    });
  });

  // Qty
  const qtyInput = document.querySelector(".qty-control input");
  const qtyBtns = document.querySelectorAll(".qty-control .qty-btn");

  if (qtyInput && qtyBtns.length) {
    qtyBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        let val = parseInt(qtyInput.value) || 1;
        const text = btn.textContent.trim();
        if (text === "+") val++;
        if (text === "-" && val > 1) val--;
        qtyInput.value = val;
      });
    });
  }

  // ✅ ADD TO CART (BACKEND)
  const addCartBtn = document.querySelector(".product-actions .btn.btn-primary");

  if (addCartBtn) {
    addCartBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      let user;
      try {
        user = requireLoginUser();
      } catch (err) {
        alert(err.message);
        window.location.href = "login.html";
        return;
      }

      const quantity = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

      try {
        const cartDto = await apiCartAddItem(user.email, product.id, quantity);
        alert(`Đã thêm ${quantity} sản phẩm (${product.name}) vào giỏ! (Tổng: ${cartDto.totalItems})`);
        // window.location.href = "cart.html";
      } catch (error) {
        console.error("Lỗi khi thêm vào giỏ:", error);
        alert("Lỗi: " + (error.message || "Thêm vào giỏ thất bại"));
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", loadAndRenderProductDetail);
