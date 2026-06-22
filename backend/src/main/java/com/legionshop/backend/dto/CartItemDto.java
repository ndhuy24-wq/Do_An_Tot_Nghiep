package com.legionshop.backend.dto;

/**
 * Data Transfer Object (DTO) đại diện cho thông tin một sản phẩm trong giỏ hàng.
 * Dùng để truyền nhận dữ liệu giỏ hàng giữa Frontend và Backend.
 */
/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Data Transfer Object (DTO) dung de truyen nhan du lieu: CartItemDto.
 */
public class CartItemDto {

    // ID của sản phẩm trong giỏ
    private Long productId;
    
    // Tên sản phẩm
    private String name;
    
    // Đường dẫn ảnh sản phẩm
    private String imageUrl;
    
    // Đơn giá sản phẩm tại thời điểm hiển thị
    private long price;
    
    // Số lượng sản phẩm khách chọn mua
    private int quantity;
    
    // Thành tiền của sản phẩm này (price * quantity)
    private long lineTotal;

    /* ===== GETTER / SETTER ===== */

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

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public long getLineTotal() {
        return lineTotal;
    }

    public void setLineTotal(long lineTotal) {
        this.lineTotal = lineTotal;
    }
}
