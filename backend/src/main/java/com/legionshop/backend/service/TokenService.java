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

@Service
public class TokenService {
    private static final long ACCESS_TOKEN_SECONDS = 15 * 60;
    private static final long REFRESH_TOKEN_SECONDS = 7 * 24 * 60 * 60;
    private static final String HMAC_ALGORITHM = "HmacSHA256";

    @Value("${app.security.token-secret:legion-shop-change-this-secret}")
    private String tokenSecret;

    public AuthResponse buildAuthResponse(UserResponse user) {
        return new AuthResponse(
                user,
                createToken(user, "ACCESS", ACCESS_TOKEN_SECONDS),
                createToken(user, "REFRESH", REFRESH_TOKEN_SECONDS)
        );
    }

    public String refreshAccessToken(String refreshToken) {
        TokenPayload payload = parseAndValidate(refreshToken);
        if (!"REFRESH".equals(payload.type)) {
            throw new RuntimeException("Refresh token không hợp lệ.");
        }

        UserResponse user = new UserResponse(payload.userId, payload.fullname, payload.email, payload.role, "ACTIVE", null, null);
        return createToken(user, "ACCESS", ACCESS_TOKEN_SECONDS);
    }

    public TokenPayload parseAndValidate(String token) {
        try {
            String[] tokenParts = token.split("\\.", -1);
            if (tokenParts.length != 2) throw new IllegalArgumentException();

            String payloadBase64 = tokenParts[0];
            String signatureBase64 = tokenParts[1];
            String expectedSignature = sign(payloadBase64);
            if (!MessageDigest.isEqual(signatureBase64.getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
                throw new IllegalArgumentException();
            }

            String raw = new String(Base64.getUrlDecoder().decode(payloadBase64), StandardCharsets.UTF_8);
            String[] parts = raw.split("\\|", -1);
            if (parts.length < 7) throw new IllegalArgumentException();

            TokenPayload payload = new TokenPayload(parts[0], Long.parseLong(parts[1]), parts[2], parts[3], parts[4], Long.parseLong(parts[5]));
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

    public boolean isAdminAccessToken(String token) {
        TokenPayload payload = parseAndValidate(token);
        if (!"ACCESS".equals(payload.type)) {
            throw new RuntimeException("Access token không hợp lệ.");
        }
        return "ADMIN".equalsIgnoreCase(payload.role);
    }

    private String createToken(UserResponse user, String type, long ttlSeconds) {
        long expiredAt = Instant.now().getEpochSecond() + ttlSeconds;
        String raw = type + "|" + user.getId() + "|" + safe(user.getEmail()) + "|" + safe(user.getFullname()) + "|" + safe(user.getRole()) + "|" + expiredAt + "|" + UUID.randomUUID();
        String payloadBase64 = Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
        return payloadBase64 + "." + sign(payloadBase64);
    }

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

    public record TokenPayload(String type, Long userId, String email, String fullname, String role, long expiredAt) {}
}
