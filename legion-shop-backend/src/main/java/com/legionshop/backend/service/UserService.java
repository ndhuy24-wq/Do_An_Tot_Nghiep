package com.legionshop.backend.service;

import com.legionshop.backend.dto.AdminUpdateUserRequest;
import com.legionshop.backend.dto.LoginRequest;
import com.legionshop.backend.dto.RegisterRequest;
import com.legionshop.backend.dto.UpdateProfileRequest;
import com.legionshop.backend.dto.UserResponse;
import com.legionshop.backend.entity.User;
import com.legionshop.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Email không được để trống");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Mật khẩu không được để trống");
        }

        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email đã được đăng ký");
        }

        User user = new User();
        user.setFullname(request.getFullname());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setStatus("ACTIVE");

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public UserResponse login(LoginRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().toLowerCase().trim();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }

        User user = userOpt.get();

        if ("LOCKED".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("Tài khoản này đã bị khóa.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }

        return toResponse(user);
    }

    public UserResponse getUserProfileByEmail(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại."));

        return toResponse(user);
    }

    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại."));

        if (request.getFullname() != null && !request.getFullname().isBlank()) {
            user.setFullname(request.getFullname().trim());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
                throw new RuntimeException("Vui lòng nhập mật khẩu cũ để đổi mật khẩu.");
            }

            if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                throw new RuntimeException("Mật khẩu cũ không chính xác.");
            }

            if (request.getNewPassword().length() < 6) {
                throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự.");
            }

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        User updatedUser = userRepository.save(user);
        return toResponse(updatedUser);
    }

    public List<UserResponse> getAllUsersForAdmin() {
        return userRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse updateUserByAdmin(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản."));

        String fullname = safeTrim(request.getFullname());
        String role = normalizeRole(request.getRole());
        String status = normalizeStatus(request.getStatus());

        if (fullname.isBlank()) {
            throw new RuntimeException("Họ tên không được để trống.");
        }

        if (!role.equals("USER") && !role.equals("ADMIN")) {
            throw new RuntimeException("Vai trò không hợp lệ.");
        }

        if (!status.equals("ACTIVE") && !status.equals("LOCKED")) {
            throw new RuntimeException("Trạng thái không hợp lệ.");
        }

        user.setFullname(fullname);
        user.setRole(role);
        user.setStatus(status);

        User updated = userRepository.save(user);
        return toResponse(updated);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullname(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getPhone(),
                user.getAddress()
        );
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeRole(String role) {
        return safeTrim(role).toUpperCase();
    }

    private String normalizeStatus(String status) {
        return safeTrim(status).toUpperCase();
    }
}