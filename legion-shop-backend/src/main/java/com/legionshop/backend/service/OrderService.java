package com.legionshop.backend.service;

import com.legionshop.backend.dto.CreateOrderRequest;
import com.legionshop.backend.dto.OrderItemResponse;
import com.legionshop.backend.dto.OrderResponse;
import com.legionshop.backend.entity.*;
import com.legionshop.backend.repository.CartRepository;
import com.legionshop.backend.repository.OrderRepository;
import com.legionshop.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse checkout(CreateOrderRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (email.isBlank()) {
            throw new RuntimeException("Thiếu email người dùng.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại."));

        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng không tồn tại."));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng đang trống.");
        }

        String address = safeTrim(request.getAddress());
        if (address.isBlank()) {
            throw new RuntimeException("Vui lòng cung cấp địa chỉ giao hàng.");
        }

        Order order = new Order();
        order.setUser(user);
        order.setUserEmail(email);
        order.setCustomerName(defaultIfBlank(user.getFullname(), email));
        order.setCustomerPhone(user.getPhone());
        order.setShippingAddress(address);

        // ORDER STATUS
        order.setStatus("pending");

        // PAYMENT
        String paymentMethod = safeTrim(request.getPaymentMethod());
        if (paymentMethod.isBlank()) {
            paymentMethod = "COD";
        }

        order.setPaymentMethod(paymentMethod);

        if (paymentMethod.equalsIgnoreCase("COD")) {
            order.setPaymentStatus("unpaid");
        } else {
            order.setPaymentStatus("paid");
        }

        long total = 0L;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            if (cartItem.getProduct() == null) continue;

            int quantity = cartItem.getQuantity() == null ? 0 : cartItem.getQuantity();
            long price = cartItem.getProduct().getPrice() == null ? 0L : cartItem.getProduct().getPrice();
            long lineTotal = price * quantity;

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(cartItem.getProduct().getId());
            item.setName(defaultIfBlank(cartItem.getProduct().getName(), "Sản phẩm"));
            item.setImageUrl(cartItem.getProduct().getImageUrl());
            item.setPrice(price);
            item.setQuantity(quantity);
            item.setLineTotal(lineTotal);

            orderItems.add(item);
            total += lineTotal;
        }

        if (orderItems.isEmpty()) {
            throw new RuntimeException("Không thể tạo đơn hàng từ giỏ hiện tại.");
        }

        order.setItems(orderItems);
        order.setTotal(total);

        order.setCode("TEMP-" + System.currentTimeMillis());

        Order saved = orderRepository.save(order);

        saved.setCode(String.format("HD%05d", saved.getId()));
        Order finalOrder = orderRepository.save(saved);

        cart.getItems().clear();
        cartRepository.save(cart);

        return toResponse(finalOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserEmail(String email) {
        return orderRepository.findByUserEmailOrderByCreatedAtDesc(normalizeEmail(email))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        String normalizedStatus = safeTrim(status).toLowerCase();

        if (!isValidStatus(normalizedStatus)) {
            throw new RuntimeException("Trạng thái đơn hàng không hợp lệ.");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        order.setStatus(normalizedStatus);

        Order saved = orderRepository.save(order);
        return toResponse(saved);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id, String email) {
        String normalizedEmail = normalizeEmail(email);

        if (normalizedEmail.isBlank()) {
            throw new RuntimeException("Thiếu email người dùng.");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        if (!normalizedEmail.equalsIgnoreCase(safeTrim(order.getUserEmail()))) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này.");
        }

        if (!safeTrim(order.getStatus()).equalsIgnoreCase("pending")) {
            throw new RuntimeException("Chỉ được hủy đơn hàng đang chờ xử lý.");
        }

        order.setStatus("cancel");

        Order saved = orderRepository.save(order);
        return toResponse(saved);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems() == null
                ? new ArrayList<>()
                : order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProductId(),
                        item.getName(),
                        item.getImageUrl(),
                        item.getPrice(),
                        item.getQuantity(),
                        item.getLineTotal()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getCode(),
                order.getUserEmail(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getShippingAddress(),
                order.getTotal(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getCreatedAt() == null ? "" : order.getCreatedAt().format(DATE_TIME_FORMATTER),
                items
        );
    }

    private String normalizeEmail(String email) {
        return safeTrim(email).toLowerCase();
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private String defaultIfBlank(String value, String fallback) {
        String trimmed = safeTrim(value);
        return trimmed.isBlank() ? fallback : trimmed;
    }

    private boolean isValidStatus(String status) {
        return status.equals("pending")
                || status.equals("shipping")
                || status.equals("done")
                || status.equals("cancel");
    }
}