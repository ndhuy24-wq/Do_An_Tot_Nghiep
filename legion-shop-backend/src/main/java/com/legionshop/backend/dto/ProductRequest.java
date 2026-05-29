package com.legionshop.backend.dto;

import java.util.List; // Cần import List

public class ProductRequest {
    private String name;
    private String sku;
    private Long price;
    private Long oldPrice;
    private Integer discount;
    private String imageUrl;
    private String description;

    // 👉 THÊM DANH SÁCH CẤU HÌNH GỬI LÊN
    private List<ProductSpecRequest> specs;

    // ================= GETTERS và Setters =================

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }
    public Long getOldPrice() { return oldPrice; }
    public void setOldPrice(Long oldPrice) { this.oldPrice = oldPrice; }
    public Integer getDiscount() { return discount; }
    public void setDiscount(Integer discount) { this.discount = discount; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<ProductSpecRequest> getSpecs() {
        return specs;
    }

    public void setSpecs(List<ProductSpecRequest> specs) {
        this.specs = specs;
    }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
}