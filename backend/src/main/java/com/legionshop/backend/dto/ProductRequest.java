package com.legionshop.backend.dto;

import java.util.List;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Data Transfer Object (DTO) dung de truyen nhan du lieu: ProductRequest.
 */
public class ProductRequest {
    private String name;
    private String sku;
    private Long price;
    private Long oldPrice;
    private Integer discount;
    private String imageUrl;
    private List<String> imageUrls;
    private Integer stockQuantity;
    private String description;
    private List<ProductSpecRequest> specs;

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
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<ProductSpecRequest> getSpecs() { return specs; }
    public void setSpecs(List<ProductSpecRequest> specs) { this.specs = specs; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
}
