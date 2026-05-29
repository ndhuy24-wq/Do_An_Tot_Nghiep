package com.legionshop.backend.dto;

// DTO chứa thông tin mà người dùng muốn cập nhật
public class UpdateProfileRequest {

    private String fullname;
    private String phone;
    // Trường address có trong User.java nhưng chưa có trong form HTML
    // private String address;

    private String oldPassword;
    private String newPassword;

    // Getters và Setters
    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}