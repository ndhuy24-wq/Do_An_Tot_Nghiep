package com.legionshop.backend.dto;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Data Transfer Object (DTO) dung de truyen nhan du lieu: OrderItemResponse.
 */
public class OrderItemResponse {

    private Long productId;
    private String name;
    private String imageUrl;
    private Long price;
    private Integer quantity;
    private Long lineTotal;

    public OrderItemResponse() {
    }

    public OrderItemResponse(Long productId, String name, String imageUrl, Long price, Integer quantity, Long lineTotal) {
        this.productId = productId;
        this.name = name;
        this.imageUrl = imageUrl;
        this.price = price;
        this.quantity = quantity;
        this.lineTotal = lineTotal;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getPrice() {
        return price;
    }

    public void setPrice(Long price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Long getLineTotal() {
        return lineTotal;
    }

    public void setLineTotal(Long lineTotal) {
        this.lineTotal = lineTotal;
    }
}