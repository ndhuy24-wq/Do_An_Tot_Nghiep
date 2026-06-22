package com.legionshop.backend.dto;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Data Transfer Object (DTO) dung de truyen nhan du lieu: OrderStatusHistoryResponse.
 */
public class OrderStatusHistoryResponse {
    private Long id;
    private String status;
    private String note;
    private String createdAt;

    public OrderStatusHistoryResponse(Long id, String status, String note, String createdAt) {
        this.id = id;
        this.status = status;
        this.note = note;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getStatus() { return status; }
    public String getNote() { return note; }
    public String getCreatedAt() { return createdAt; }
}
