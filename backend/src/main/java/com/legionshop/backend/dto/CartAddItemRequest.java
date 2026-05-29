package com.legionshop.backend.dto;


public class CartAddItemRequest {

    private String userEmail;
    private Long productId;
    private Integer quantity;

    /* ===== GETTER / SETTER ===== */

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}

