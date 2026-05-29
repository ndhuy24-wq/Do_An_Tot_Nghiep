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
    private List<String> imageUrls;
    private Integer stockQuantity;
    private String description;
    private String discount;
    private List<ProductSpecDto> specs;

    public ProductResponse() {}

    public ProductResponse(Long id, String name, String sku, Long price, Long oldPrice, String imageUrl, List<String> imageUrls, Integer stockQuantity, String description, Integer discount, List<ProductSpecDto> specs) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.price = price;
        this.oldPrice = oldPrice;
        this.imageUrl = imageUrl;
        this.imageUrls = imageUrls != null ? imageUrls : Collections.emptyList();
        this.stockQuantity = stockQuantity == null ? 0 : stockQuantity;
        this.description = description;
        this.discount = (discount != null && discount > 0) ? "-" + discount + "%" : null;
        this.specs = specs != null ? specs : Collections.emptyList();
    }

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
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDiscount() { return discount; }
    public void setDiscount(String discount) { this.discount = discount; }
    public List<ProductSpecDto> getSpecs() { return specs; }
    public void setSpecs(List<ProductSpecDto> specs) { this.specs = specs; }
}
