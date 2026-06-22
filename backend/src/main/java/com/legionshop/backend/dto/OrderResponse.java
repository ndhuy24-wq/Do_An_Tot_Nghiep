package com.legionshop.backend.dto;

import java.util.List;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Data Transfer Object (DTO) dung de truyen nhan du lieu: OrderResponse.
 */
public class OrderResponse {

    private Long id;
    private String code;
    private String userEmail;
    private String customerName;
    private String customerPhone;
    private String shippingAddress;
    private Long total;
    private String status;

    private String paymentMethod;
    private String paymentStatus;

    private String createdAt;
    private List<OrderItemResponse> items;

    public OrderResponse() {
    }

    public OrderResponse(
            Long id,
            String code,
            String userEmail,
            String customerName,
            String customerPhone,
            String shippingAddress,
            Long total,
            String status,
            String paymentMethod,
            String paymentStatus,
            String createdAt,
            List<OrderItemResponse> items
    ) {
        this.id = id;
        this.code = code;
        this.userEmail = userEmail;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.shippingAddress = shippingAddress;
        this.total = total;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.createdAt = createdAt;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }
}