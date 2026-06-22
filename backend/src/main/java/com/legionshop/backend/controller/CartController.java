package com.legionshop.backend.controller;

import com.legionshop.backend.dto.CartAddItemRequest;
import com.legionshop.backend.dto.CartResponse;
import com.legionshop.backend.dto.CartUpdateQtyRequest;
import com.legionshop.backend.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Controller dinh nghia cac API endpoint lien quan den Cart.
 */
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // GET /api/cart?email=...
    @GetMapping
    public ResponseEntity<?> getCart(@RequestParam("email") String email) {
        try {
            CartResponse cart = cartService.getCart(email);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // POST /api/cart/items
    @PostMapping("/items")
    public ResponseEntity<?> addItem(@RequestBody CartAddItemRequest req) {
        try {
            if (req.getUserEmail() == null || req.getUserEmail().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Thiếu userEmail"));
            }
            if (req.getProductId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Thiếu productId"));
            }
            CartResponse cart = cartService.addItem(req.getUserEmail(), req.getProductId(), req.getQuantity());
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // PUT /api/cart/items/{productId}?email=...
    @PutMapping("/items/{productId}")
    public ResponseEntity<?> updateQty(
            @PathVariable Long productId,
            @RequestParam("email") String email,
            @RequestBody CartUpdateQtyRequest req
    ) {
        try {
            CartResponse cart = cartService.updateQty(email, productId, req.getQuantity());
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // DELETE /api/cart/items/{productId}?email=...
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<?> removeItem(@PathVariable Long productId, @RequestParam("email") String email) {
        try {
            CartResponse cart = cartService.removeItem(email, productId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // DELETE /api/cart?email=...
    @DeleteMapping
    public ResponseEntity<?> clearCart(@RequestParam("email") String email) {
        try {
            cartService.clearCart(email);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
