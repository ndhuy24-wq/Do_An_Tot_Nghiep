package com.legionshop.backend.controller;

import com.legionshop.backend.service.VnPayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    private final VnPayService vnPayService;

    public PaymentController(VnPayService vnPayService) {
        this.vnPayService = vnPayService;
    }

    @PostMapping("/vnpay/create-payment")
    public ResponseEntity<?> createVnPayPayment(@RequestBody Map<String, Object> payload) {
        try {
            long amount = Long.parseLong(String.valueOf(payload.getOrDefault("amount", "0")));
            String orderInfo = String.valueOf(payload.getOrDefault("orderInfo", "Thanh toan HUI LEGION"));
            String returnUrl = String.valueOf(payload.getOrDefault("returnUrl", ""));
            return ResponseEntity.ok(Map.of("paymentUrl", vnPayService.createPaymentUrl(amount, orderInfo, returnUrl)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/vnpay/callback")
    public ResponseEntity<?> vnPayCallback(@RequestParam Map<String, String> params) {
        boolean valid = vnPayService.verifyCallback(params);
        String responseCode = params.getOrDefault("vnp_ResponseCode", "");
        return ResponseEntity.ok(Map.of(
                "validSignature", valid,
                "success", valid && "00".equals(responseCode),
                "responseCode", responseCode,
                "transactionNo", params.getOrDefault("vnp_TransactionNo", ""),
                "orderInfo", params.getOrDefault("vnp_OrderInfo", "")
        ));
    }
}
