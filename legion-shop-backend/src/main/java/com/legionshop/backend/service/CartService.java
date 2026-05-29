package com.legionshop.backend.service;

import com.legionshop.backend.dto.CartItemDto;
import com.legionshop.backend.dto.CartResponse;
import com.legionshop.backend.entity.Cart;
import com.legionshop.backend.entity.CartItem;
import com.legionshop.backend.entity.Product;
import com.legionshop.backend.entity.User;
import com.legionshop.backend.repository.CartRepository;
import com.legionshop.backend.repository.ProductRepository;
import com.legionshop.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(
            CartRepository cartRepository,
            ProductRepository productRepository,
            UserRepository userRepository
    ) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // ================= UTIL =================
    private String normalizeEmail(String email) {
        return (email == null) ? "" : email.toLowerCase().trim();
    }

    // ================= GET CART =================
    @Transactional(readOnly = true)
    public CartResponse getCart(String email) {
        String e = normalizeEmail(email);

        Cart cart = cartRepository.findByUserEmail(e).orElse(null);
        if (cart == null) return emptyCart(e);

        return toCartResponse(cart);
    }

    // ================= ADD ITEM =================
    @Transactional
    public CartResponse addItem(String email, Long productId, Integer quantity) {
        String e = normalizeEmail(email);
        int qty = (quantity == null || quantity < 1) ? 1 : quantity;

        Cart cart = getOrCreateCart(e);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        CartItem existing = null;
        for (CartItem item : cart.getItems()) {
            if (item.getProduct() != null && item.getProduct().getId().equals(productId)) {
                existing = item;
                break;
            }
        }

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + qty);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(qty);
            cart.getItems().add(item);
        }

        return toCartResponse(cartRepository.save(cart));
    }

    // ================= UPDATE QTY =================
    @Transactional
    public CartResponse updateQty(String email, Long productId, Integer quantity) {
        String e = normalizeEmail(email);

        Cart cart = cartRepository.findByUserEmail(e)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng không tồn tại"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct() != null && i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ"));

        if (quantity == null || quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }

        return toCartResponse(cartRepository.save(cart));
    }

    // ================= REMOVE ITEM =================
    @Transactional
    public CartResponse removeItem(String email, Long productId) {
        String e = normalizeEmail(email);

        Cart cart = cartRepository.findByUserEmail(e)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng không tồn tại"));

        cart.getItems().removeIf(it -> it.getProduct() != null && it.getProduct().getId().equals(productId));

        return toCartResponse(cartRepository.save(cart));
    }

    // ================= CLEAR CART =================
    @Transactional
    public void clearCart(String email) {
        String e = normalizeEmail(email);

        Cart cart = cartRepository.findByUserEmail(e).orElse(null);
        if (cart == null) return;

        cart.getItems().clear();
        cartRepository.save(cart);
    }

    // ================= HELPERS =================

    /**
     * Không bao giờ tạo cart trùng:
     * - Luôn normalize email
     * - Luôn tìm theo userEmail trước
     * - Nếu chưa có thì mới tạo
     */
    private Cart getOrCreateCart(String normalizedEmail) {

        return cartRepository.findByUserEmail(normalizedEmail)
                .orElseGet(() -> {

                    User user = userRepository.findByEmail(normalizedEmail)
                            .orElseThrow(() -> new RuntimeException("User không tồn tại: " + normalizedEmail));

                    Cart cart = new Cart();
                    cart.setUser(user);                 // ✅ fill user_id
                    cart.setUserEmail(normalizedEmail); // ✅ unique key theo email

                    return cartRepository.save(cart);
                });
    }

    private CartResponse emptyCart(String email) {
        CartResponse res = new CartResponse();
        res.setUserEmail(email);
        res.setItems(new ArrayList<>());
        res.setTotalItems(0);
        res.setTotalPrice(0);
        return res;
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItemDto> items = new ArrayList<>();
        int totalItems = 0;
        long totalPrice = 0;

        for (CartItem item : cart.getItems()) {
            Product p = item.getProduct();
            if (p == null) continue;

            int qty = (item.getQuantity() == null) ? 0 : item.getQuantity();
            long price = (p.getPrice() == null) ? 0 : p.getPrice();
            long lineTotal = qty * price;

            CartItemDto dto = new CartItemDto();
            dto.setProductId(p.getId());
            dto.setName(p.getName());
            dto.setImageUrl(p.getImageUrl());
            dto.setPrice(price);
            dto.setQuantity(qty);
            dto.setLineTotal(lineTotal);

            items.add(dto);
            totalItems += qty;
            totalPrice += lineTotal;
        }

        CartResponse res = new CartResponse();
        res.setUserEmail(cart.getUserEmail());
        res.setItems(items);
        res.setTotalItems(totalItems);
        res.setTotalPrice(totalPrice);
        return res;
    }
}
