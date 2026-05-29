package com.legionshop.backend.dto;

public class ProductSpecDto {

    private String specKey;
    private String specValue;

    public ProductSpecDto() {}

    public ProductSpecDto(String specKey, String specValue) {
        this.specKey = specKey;
        this.specValue = specValue;
    }

    // ================= GETTERS & SETTERS =================

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