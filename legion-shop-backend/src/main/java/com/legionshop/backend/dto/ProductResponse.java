package com.legionshop.backend.dto;

import java.util.List;
import java.util.Collections;

public class ProductResponse {

    private Long id;
    private String name;
    private String sku;
    private Long price;
    private Long oldPrice;
    private String imageUrl;
    private String description;
    private String discount; // Trả về dạng String "-22%" cho Front-end


    private List<ProductSpecDto> specs;

    public ProductResponse() {
    }

    // Constructor đã được cập nhật với 8 tham số
    public ProductResponse(Long id, String name, String sku, Long price, Long oldPrice, String imageUrl, String description, Integer discount, List<ProductSpecDto> specs) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.price = price;
        this.oldPrice = oldPrice;
        this.imageUrl = imageUrl;
        this.description = description;
        this.discount = (discount != null && discount > 0) ? "-" + discount + "%" : null;
        this.specs = specs != null ? specs : Collections.emptyList();
    }

    // ================= GETTERS và SETTERS =================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }

    public Long getOldPrice() { return oldPrice; }
    public void setOldPrice(Long oldPrice) { this.oldPrice = oldPrice; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDiscount() { return discount; }
    public void setDiscount(String discount) { this.discount = discount; }

    // 👉 GETTERS VÀ SETTERS cho List<ProductSpecDto>
    public List<ProductSpecDto> getSpecs() {
        return specs;
    }

    public void setSpecs(List<ProductSpecDto> specs) {
        this.specs = specs;
    }
}