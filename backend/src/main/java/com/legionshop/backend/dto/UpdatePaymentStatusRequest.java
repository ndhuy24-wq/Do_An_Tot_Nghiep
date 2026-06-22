package com.legionshop.backend.dto;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Data Transfer Object (DTO) dung de truyen nhan du lieu: UpdatePaymentStatusRequest.
 */
public class UpdatePaymentStatusRequest {

    private String paymentStatus;

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}