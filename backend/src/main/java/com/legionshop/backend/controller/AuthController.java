package com.legionshop.backend.controller;

import com.legionshop.backend.dto.*;
import com.legionshop.backend.service.UserService;
import com.legionshop.backend.service.TokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Controller dinh nghia cac API endpoint lien quan den Auth.
 */
public class AuthController {
    private final UserService userService;
    private final TokenService tokenService;

    @Value("${app.demo.expose-reset-token:false}")
    private boolean exposeResetToken;

    public AuthController(UserService userService, TokenService tokenService) { this.userService = userService; this.tokenService = tokenService; }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try { return ResponseEntity.ok(tokenService.buildAuthResponse(userService.register(request))); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try { return ResponseEntity.ok(tokenService.buildAuthResponse(userService.login(request))); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshTokenRequest request) {
        try { return ResponseEntity.ok(Map.of("accessToken", tokenService.refreshAccessToken(request.getRefreshToken()))); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            String token = userService.createPasswordResetToken(request.getEmail());
            if (exposeResetToken) {
                return ResponseEntity.ok(Map.of(
                        "message", "Đã tạo yêu cầu đặt lại mật khẩu. Reset token đang bật cho môi trường demo.",
                        "resetToken", token
                ));
            }
            return ResponseEntity.ok(Map.of(
                    "message", "Đã tạo yêu cầu đặt lại mật khẩu. Kiểm tra console backend hoặc email cấu hình."
            ));
        } catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try { userService.resetPassword(request.getToken(), request.getNewPassword()); return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công.")); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
}
