package com.legionshop.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "product_specs")
/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Thuc the (Entity) anh xa bang co so du lieu: ProductSpec.
 */
public class ProductSpec {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với bảng Product (One-to-Many từ Product)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 100)
    private String specKey;

    @Column(columnDefinition = "TEXT")
    private String specValue;

    // ================= GETTERS & SETTERS =================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getSpecKey() { return specKey; }
    public void setSpecKey(String specKey) { this.specKey = specKey; }
    public String getSpecValue() { return specValue; }
    public void setSpecValue(String specValue) { this.specValue = specValue; }
}