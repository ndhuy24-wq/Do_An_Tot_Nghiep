package com.legionshop.backend.service;

import com.legionshop.backend.entity.Order;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    /**
     * Demo email service: hiện tại ghi log ra console để không cần cấu hình SMTP khi bảo vệ.
     * Khi muốn gửi mail thật, thay phần System.out bằng JavaMailSender và cấu hình SMTP trong application.properties.
     */
    public void sendOrderConfirmation(String to, Order order) {
        System.out.println("[EMAIL DEMO] Gửi xác nhận đơn hàng tới: " + to);
        System.out.println("[EMAIL DEMO] Mã đơn: " + order.getCode() + ", tổng tiền: " + order.getTotal());
    }

    public void sendPasswordResetToken(String to, String token) {
        System.out.println("[EMAIL DEMO] Gửi mã/token đặt lại mật khẩu tới: " + to);
        System.out.println("[EMAIL DEMO] Reset token: " + token);
    }
}
