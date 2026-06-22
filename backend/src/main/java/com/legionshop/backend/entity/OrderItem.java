package com.legionshop.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Thuc the (Entity) anh xa bang co so du lieu: OrderItem.
 */
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;

    @Column(nullable = false)
    private Long price;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Long lineTotal;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
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