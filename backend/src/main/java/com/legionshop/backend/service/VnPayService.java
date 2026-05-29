package com.legionshop.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VnPayService {
    @Value("${vnpay.tmn-code:}")
    private String tmnCode;

    @Value("${vnpay.hash-secret:}")
    private String hashSecret;

    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String payUrl;

    @Value("${vnpay.return-url:http://localhost:8080/api/payments/vnpay/callback}")
    private String defaultReturnUrl;

    public String createPaymentUrl(long amount, String orderInfo, String returnUrl) {
        if (amount <= 0) {
            throw new RuntimeException("Số tiền VNPay không hợp lệ.");
        }
        if (tmnCode == null || tmnCode.isBlank() || hashSecret == null || hashSecret.isBlank()) {
            throw new RuntimeException("Chưa cấu hình vnpay.tmn-code hoặc vnpay.hash-secret trong application.properties.");
        }

        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String createDate = formatter.format(calendar.getTime());
        calendar.add(Calendar.MINUTE, 15);
        String expireDate = formatter.format(calendar.getTime());

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", String.valueOf(amount * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", String.valueOf(System.currentTimeMillis()));
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl == null || returnUrl.isBlank() ? defaultReturnUrl : returnUrl);
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        String query = buildQuery(params, true);
        String hashData = buildQuery(params, false);
        String secureHash = hmacSha512(hashSecret, hashData);
        return payUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    public boolean verifyCallback(Map<String, String> inputParams) {
        if (hashSecret == null || hashSecret.isBlank()) return false;

        String receivedHash = inputParams.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) return false;

        Map<String, String> params = new TreeMap<>();
        for (Map.Entry<String, String> entry : inputParams.entrySet()) {
            String key = entry.getKey();
            if (key.startsWith("vnp_") && !key.equals("vnp_SecureHash") && !key.equals("vnp_SecureHashType")) {
                params.put(key, entry.getValue());
            }
        }

        String hashData = buildQuery(params, false);
        String calculatedHash = hmacSha512(hashSecret, hashData);
        return calculatedHash.equalsIgnoreCase(receivedHash);
    }

    private String buildQuery(Map<String, String> params, boolean encodeValue) {
        List<String> parts = new ArrayList<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String value = entry.getValue() == null ? "" : entry.getValue();
            if (encodeValue) {
                value = URLEncoder.encode(value, StandardCharsets.UTF_8);
            }
            parts.add(entry.getKey() + "=" + value);
        }
        return String.join("&", parts);
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo chữ ký VNPay.");
        }
    }
}
