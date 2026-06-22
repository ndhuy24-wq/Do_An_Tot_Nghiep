package com.legionshop.backend.dto;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Data Transfer Object (DTO) dung de truyen nhan du lieu: ProductSpecRequest.
 */
public class ProductSpecRequest {

    private String specKey;
    private String specValue;

    public ProductSpecRequest() {
        // Constructor mặc định (cần thiết cho Spring MVC)
    }

    // Constructor đầy đ
    public ProductSpecRequest(String specKey, String specValue) {
        this.specKey = specKey;
        this.specValue = specValue;
    }

    // ================= GETTERS và SETTERS =================

    public String getSpecKey() {
        return specKey;
    }

    public void setSpecKey(String specKey) {
        this.specKey = specKey;
    }

    public String getSpecValue() {
        return specValue;
    }

    public void setSpecValue(String specValue) {
        this.specValue = specValue;
    }
}