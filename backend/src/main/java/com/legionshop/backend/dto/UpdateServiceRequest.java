package com.legionshop.backend.dto;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Service xu ly nghiep vu logic cho UpdateRequest.
 */
public class UpdateServiceRequest {

    private String status;
    private Long estimatedCost;
    private String technicianNote;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Long estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public String getTechnicianNote() {
        return technicianNote;
    }

    public void setTechnicianNote(String technicianNote) {
        this.technicianNote = technicianNote;
    }
}