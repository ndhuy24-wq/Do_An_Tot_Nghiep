package com.legionshop.backend.dto;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Data Transfer Object (DTO) dung de truyen nhan du lieu: CartUpdateQtyRequest.
 */
public class CartUpdateQtyRequest {

    private Integer quantity;

    /* ===== GETTER / SETTER ===== */

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
