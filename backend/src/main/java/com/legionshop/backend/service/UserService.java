package com.legionshop.backend.service;

import com.legionshop.backend.dto.*;
import com.legionshop.backend.entity.User;
import com.legionshop.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public UserResponse register(RegisterRequest request) {
        String fullname = safeTrim(request.getFullname());
        String email = safeTrim(request.getEmail()).toLowerCase();
        String password = safeTrim(request.getPassword());
        if (fullname.isBlank()) throw new RuntimeException("Họ tên không được để trống");
        if (email.isBlank()) throw new RuntimeException("Email không được để trống");
        if (!email.contains("@") || !email.contains(".")) throw new RuntimeException("Email không hợp lệ");
        if (password.length() < 6) throw new RuntimeException("Mật khẩu phải có ít nhất 6 ký tự");
        if (userRepository.findByEmail(email).isPresent()) throw new RuntimeException("Email đã được đăng ký");
        User user = new User();
        user.setFullname(fullname); user.setEmail(email); user.setPassword(passwordEncoder.encode(password));
        user.setRole("USER"); user.setStatus("ACTIVE");
        return toResponse(userRepository.save(user));
    }

    public UserResponse login(LoginRequest request) {
        String email = safeTrim(request.getEmail()).toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) throw new RuntimeException("Email hoặc mật khẩu không đúng");
        User user = userOpt.get();
        if ("LOCKED".equalsIgnoreCase(user.getStatus())) throw new RuntimeException("Tài khoản này đã bị khóa.");
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) throw new RuntimeException("Email hoặc mật khẩu không đúng");
        return toResponse(user);
    }

    @Transactional
    public String createPasswordResetToken(String email) {
        String normalized = safeTrim(email).toLowerCase();
        User user = userRepository.findByEmail(normalized).orElseThrow(() -> new RuntimeException("Email chưa được đăng ký."));
        String token = UUID.randomUUID().toString().replace("-", "");
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiresAt(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);
        emailService.sendPasswordResetToken(user.getEmail(), token);
        return token;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        String safeToken = safeTrim(token);
        if (safeToken.isBlank()) throw new RuntimeException("Token không hợp lệ.");
        if (safeTrim(newPassword).length() < 6) throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự.");
        User user = userRepository.findAll().stream()
                .filter(u -> safeToken.equals(u.getResetPasswordToken()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Token đặt lại mật khẩu không hợp lệ."));
        if (user.getResetPasswordTokenExpiresAt() == null || user.getResetPasswordTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token đã hết hạn.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiresAt(null);
        userRepository.save(user);
    }

    public UserResponse getUserProfileByEmail(String email) {
        return toResponse(userRepository.findByEmail(email.toLowerCase().trim()).orElseThrow(() -> new RuntimeException("Người dùng không tồn tại.")));
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email.toLowerCase().trim()).orElseThrow(() -> new RuntimeException("Người dùng không tồn tại."));
        if (request.getFullname() != null && !request.getFullname().isBlank()) user.setFullname(request.getFullname().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getOldPassword() == null || request.getOldPassword().isBlank()) throw new RuntimeException("Vui lòng nhập mật khẩu cũ để đổi mật khẩu.");
            if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) throw new RuntimeException("Mật khẩu cũ không chính xác.");
            if (request.getNewPassword().length() < 6) throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự.");
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> getAllUsersForAdmin() {
        return userRepository.findAllByOrderByIdDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public UserResponse updateUserByAdmin(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản."));
        String fullname = safeTrim(request.getFullname());
        String role = normalizeRole(request.getRole());
        String status = normalizeStatus(request.getStatus());
        if (fullname.isBlank()) throw new RuntimeException("Họ tên không được để trống.");
        if (!role.equals("USER") && !role.equals("ADMIN")) throw new RuntimeException("Vai trò không hợp lệ.");
        if (!status.equals("ACTIVE") && !status.equals("LOCKED")) throw new RuntimeException("Trạng thái không hợp lệ.");
        user.setFullname(fullname); user.setRole(role); user.setStatus(status);
        return toResponse(userRepository.save(user));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getFullname(), user.getEmail(), user.getRole(), user.getStatus(), user.getPhone(), user.getAddress());
    }
    private String safeTrim(String value) { return value == null ? "" : value.trim(); }
    private String normalizeRole(String role) { return safeTrim(role).toUpperCase(); }
    private String normalizeStatus(String status) { return safeTrim(status).toUpperCase(); }
}
