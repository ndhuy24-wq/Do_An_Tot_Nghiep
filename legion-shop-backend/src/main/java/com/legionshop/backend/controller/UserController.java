package com.legionshop.backend.controller;

import com.legionshop.backend.dto.UpdateProfileRequest;
import com.legionshop.backend.dto.UserResponse;
import com.legionshop.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user") // Endpoint chung cho các hành động của user
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * API MỚI: Lấy thông tin user đầy đủ (fullname, phone, address) theo email.
     * Dùng cho việc đổ dữ liệu vào form account_info.html.
     */
    @GetMapping("/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable("email") String email) {
        try {
            // Gọi hàm trong UserService để lấy UserResponse
            UserResponse user = userService.getUserProfileByEmail(email);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            // Trả về 404 Not Found nếu không tìm thấy user
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * API để cập nhật profile và đổi mật khẩu.
     */
    @PutMapping("/{email}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable(value = "email") String email,
            @RequestBody UpdateProfileRequest request) {
        try {
            // Hàm này đã được sửa để xử lý update cả phone/address/password
            UserResponse user = userService.updateProfile(email, request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            // Trả về 400 Bad Request với message lỗi
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}