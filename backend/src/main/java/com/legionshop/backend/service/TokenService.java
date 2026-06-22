package com.legionshop.backend.service;

import com.legionshop.backend.dto.AuthResponse;
import com.legionshop.backend.dto.UserResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

/**
 * Service quản lý việc tạo, ký và xác thực mã bảo mật (Access Token / Refresh Token).
 * Sử dụng thuật toán mã hóa HMAC-SHA256 kết hợp mã hóa Base64 để tự tạo mã chữ ký an toàn.
 */
@Service
/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Service xu ly nghiep vu logic cho Token.
 */
public class TokenService {
    // Thời hạn sống của Access Token: 15 phút (900 giây)
    private static final long ACCESS_TOKEN_SECONDS = 15 * 60;
    // Thời hạn sống của Refresh Token: 7 ngày (7 * 24 giờ)
    private static final long REFRESH_TOKEN_SECONDS = 7 * 24 * 60 * 60;
    // Thuật toán ký khóa đối xứng
    private static final String HMAC_ALGORITHM = "HmacSHA256";

    // Lấy secret key từ file cấu hình application.properties, nếu không có sẽ lấy giá trị mặc định
    @Value("${app.security.token-secret:legion-shop-change-this-secret}")
    private String tokenSecret;

    /**
     * Tạo đối tượng AuthResponse chứa cả thông tin User, Access Token và Refresh Token cho client.
     */
    public AuthResponse buildAuthResponse(UserResponse user) {
        return new AuthResponse(
                user,
                createToken(user, "ACCESS", ACCESS_TOKEN_SECONDS),
                createToken(user, "REFRESH", REFRESH_TOKEN_SECONDS)
        );
    }

    /**
     * Tạo một Access Token mới từ Refresh Token hợp lệ (khi Access Token cũ hết hạn).
     */
    public String refreshAccessToken(String refreshToken) {
        TokenPayload payload = parseAndValidate(refreshToken);
        if (!"REFRESH".equals(payload.type)) {
            throw new RuntimeException("Refresh token không hợp lệ.");
        }

        UserResponse user = new UserResponse(payload.userId, payload.fullname, payload.email, payload.role, "ACTIVE", null, null);
        return createToken(user, "ACCESS", ACCESS_TOKEN_SECONDS);
    }

    /**
     * Giải mã và xác thực Token. Kiểm tra xem chữ ký có khớp không và token còn hạn hay không.
     */
    public TokenPayload parseAndValidate(String token) {
        try {
            // Token có định dạng: [PayloadBase64].[SignatureBase64]
            String[] tokenParts = token.split("\\.", -1);
            if (tokenParts.length != 2) throw new IllegalArgumentException();

            String payloadBase64 = tokenParts[0];
            String signatureBase64 = tokenParts[1];
            
            // Tính toán chữ ký kỳ vọng từ Payload nhận được
            String expectedSignature = sign(payloadBase64);
            
            // So sánh an toàn chống tấn công timing attack bằng MessageDigest.isEqual
            if (!MessageDigest.isEqual(signatureBase64.getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
                throw new IllegalArgumentException();
            }

            // Giải mã phần thông tin Payload
            String raw = new String(Base64.getUrlDecoder().decode(payloadBase64), StandardCharsets.UTF_8);
            String[] parts = raw.split("\\|", -1);
            if (parts.length < 7) throw new IllegalArgumentException();

            // Ánh xạ chuỗi thô đã giải mã vào Record TokenPayload
            TokenPayload payload = new TokenPayload(parts[0], Long.parseLong(parts[1]), parts[2], parts[3], parts[4], Long.parseLong(parts[5]));
            
            // Kiểm tra thời gian hết hạn của token
            if (payload.expiredAt < Instant.now().getEpochSecond()) {
                throw new RuntimeException("Token đã hết hạn.");
            }
            return payload;
        } catch (RuntimeException e) {
            if ("Token đã hết hạn.".equals(e.getMessage())) throw e;
            throw new RuntimeException("Token không hợp lệ.");
        } catch (Exception e) {
            throw new RuntimeException("Token không hợp lệ.");
        }
    }

    /**
     * Kiểm tra xem Token gửi lên có phải là Access Token hợp lệ của Admin hay không.
     */
    public boolean isAdminAccessToken(String token) {
        TokenPayload payload = parseAndValidate(token);
        if (!"ACCESS".equals(payload.type)) {
            throw new RuntimeException("Access token không hợp lệ.");
        }
        return "ADMIN".equalsIgnoreCase(payload.role);
    }

    /**
     * Tạo chuỗi token thô, mã hóa sang Base64 và ký số bằng HmacSHA256.
     */
    private String createToken(UserResponse user, String type, long ttlSeconds) {
        long expiredAt = Instant.now().getEpochSecond() + ttlSeconds;
        // Chuỗi Payload ghép các thông tin phân tách bởi dấu | và UUID ngẫu nhiên để chống trùng lặp token
        String raw = type + "|" + user.getId() + "|" + safe(user.getEmail()) + "|" + safe(user.getFullname()) + "|" + safe(user.getRole()) + "|" + expiredAt + "|" + UUID.randomUUID();
        String payloadBase64 = Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
        return payloadBase64 + "." + sign(payloadBase64);
    }

    /**
     * Tạo chữ ký cho chuỗi PayloadBase64 bằng khóa bí mật.
     */
    private String sign(String payloadBase64) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            byte[] signature = mac.doFinal(payloadBase64.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo chữ ký token.");
        }
    }

    private String safe(String value) { return value == null ? "" : value; }

    // Cấu trúc dữ liệu chứa thông tin sau khi giải mã token thành công
    public record TokenPayload(String type, Long userId, String email, String fullname, String role, long expiredAt) {}
}
