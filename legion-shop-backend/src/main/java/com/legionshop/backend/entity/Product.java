package com.legionshop.backend.entity;

import jakarta.persistence.*;
import java.util.List; // Cần import List

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    private Long price;
    private Long oldPrice;
    private Integer discount;

    @Column(nullable = false, length = 50, unique = true) // Mã sản phẩm thường là duy nhất
    private String sku;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Đã dùng LONGTEXT để lưu chuỗi Base64 của ảnh (khắc phục lỗi Data truncation)
    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;

    // 👉 THÊM MỐI QUAN HỆ 1-N (One-to-Many) VỚI PRODUCTSPEC
    // cascade = CascadeType.ALL: Đảm bảo khi xóa Product thì xóa cả Specs liên quan.
    // orphanRemoval = true: Đảm bảo các Specs bị xóa khỏi List cũng bị xóa khỏi DB.
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductSpec> specs;



    // ================= GETTERS and SETTERS =================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }
    public Long getOldPrice() { return oldPrice; }
    public void setOldPrice(Long oldPrice) { this.oldPrice = oldPrice; }
    public Integer getDiscount() { return discount; }
    public void setDiscount(Integer discount) { this.discount = discount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<ProductSpec> getSpecs() {
        return specs;
    }

    public void setSpecs(List<ProductSpec> specs) {
        this.specs = specs;
    }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
}