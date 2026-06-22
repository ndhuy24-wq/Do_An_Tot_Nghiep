package com.legionshop.backend.dto;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Data Transfer Object (DTO) dung de truyen nhan du lieu: AuthResponse.
 */
public class AuthResponse {
    private UserResponse user;
    private String accessToken;
    private String refreshToken;

    public AuthResponse(UserResponse user, String accessToken, String refreshToken) {
        this.user = user;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public UserResponse getUser() { return user; }
    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
}
