package com.legionshop.backend.service;

import com.legionshop.backend.dto.*;
import com.legionshop.backend.entity.*;
import com.legionshop.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository, CartRepository cartRepository, UserRepository userRepository, ProductRepository productRepository, OrderStatusHistoryRepository historyRepository, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.historyRepository = historyRepository;
        this.emailService = emailService;
    }

    @Transactional
    public OrderResponse checkout(CreateOrderRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (email.isBlank()) throw new RuntimeException("Thiếu email người dùng.");
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Người dùng không tồn tại."));
        Cart cart = cartRepository.findByUserEmail(email).orElseThrow(() -> new RuntimeException("Giỏ hàng không tồn tại."));
        if (cart.getItems() == null || cart.getItems().isEmpty()) throw new RuntimeException("Giỏ hàng đang trống.");
        String address = safeTrim(request.getAddress());
        if (address.isBlank()) throw new RuntimeException("Vui lòng cung cấp địa chỉ giao hàng.");

        Order order = new Order();
        order.setUser(user); order.setUserEmail(email);
        order.setCustomerName(defaultIfBlank(user.getFullname(), email));
        order.setCustomerPhone(user.getPhone()); order.setShippingAddress(address);
        order.setStatus("pending");
        String paymentMethod = safeTrim(request.getPaymentMethod());
        if (paymentMethod.isBlank()) paymentMethod = "COD";
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(paymentMethod.equalsIgnoreCase("COD") ? "UNPAID" : "PAID");

        long total = 0L;
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            if (cartItem.getProduct() == null) continue;
            Product product = productRepository.findById(cartItem.getProduct().getId()).orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại."));
            int quantity = cartItem.getQuantity() == null ? 0 : cartItem.getQuantity();
            if (quantity <= 0) continue;
            int stock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
            if (stock < quantity) throw new RuntimeException("Sản phẩm '" + product.getName() + "' không đủ tồn kho. Còn: " + stock);
            product.setStockQuantity(stock - quantity);
            productRepository.save(product);

            long price = product.getPrice() == null ? 0L : product.getPrice();
            long lineTotal = price * quantity;
            OrderItem item = new OrderItem();
            item.setOrder(order); item.setProductId(product.getId());
            item.setName(defaultIfBlank(product.getName(), "Sản phẩm"));
            item.setImageUrl(product.getImageUrl()); item.setPrice(price);
            item.setQuantity(quantity); item.setLineTotal(lineTotal);
            orderItems.add(item); total += lineTotal;
        }
        if (orderItems.isEmpty()) throw new RuntimeException("Không thể tạo đơn hàng từ giỏ hiện tại.");
        order.setItems(orderItems); order.setTotal(total);
        order.setCode("TEMP-" + System.currentTimeMillis());
        Order saved = orderRepository.save(order);
        saved.setCode(String.format("HD%05d", saved.getId()));
        Order finalOrder = orderRepository.save(saved);
        addHistory(finalOrder, "pending", "Khách hàng tạo đơn hàng");
        cart.getItems().clear(); cartRepository.save(cart);
        emailService.sendOrderConfirmation(email, finalOrder);
        return toResponse(finalOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserEmail(String email) {
        return orderRepository.findByUserEmailOrderByCreatedAtDesc(normalizeEmail(email)).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        return toResponse(orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng.")));
    }

    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        String normalizedStatus = safeTrim(status).toLowerCase();
        if (!isValidStatus(normalizedStatus)) throw new RuntimeException("Trạng thái đơn hàng không hợp lệ.");
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));
        String oldStatus = safeTrim(order.getStatus()).toLowerCase();
        order.setStatus(normalizedStatus);
        Order saved = orderRepository.save(order);
        addHistory(saved, normalizedStatus, "Admin cập nhật trạng thái từ " + oldStatus + " sang " + normalizedStatus);
        return toResponse(saved);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id, String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail.isBlank()) throw new RuntimeException("Thiếu email người dùng.");
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));
        if (!normalizedEmail.equalsIgnoreCase(safeTrim(order.getUserEmail()))) throw new RuntimeException("Bạn không có quyền hủy đơn hàng này.");
        if (!safeTrim(order.getStatus()).equalsIgnoreCase("pending")) throw new RuntimeException("Chỉ được hủy đơn hàng đang chờ xử lý.");
        restoreStock(order);
        order.setStatus("cancel");
        Order saved = orderRepository.save(order);
        addHistory(saved, "cancel", "Khách hàng hủy đơn hàng, hệ thống hoàn tồn kho");
        return toResponse(saved);
    }

    @Transactional
    public OrderResponse updatePaymentStatus(Long id, String paymentStatus) {
        String normalizedStatus = safeTrim(paymentStatus).toUpperCase();
        if (!isValidPaymentStatus(normalizedStatus)) throw new RuntimeException("Trạng thái thanh toán không hợp lệ.");
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));
        order.setPaymentStatus(normalizedStatus);
        Order saved = orderRepository.save(order);
        addHistory(saved, "payment:" + normalizedStatus, "Admin cập nhật thanh toán: " + normalizedStatus);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderStatusHistoryResponse> getOrderHistory(Long orderId) {
        return historyRepository.findByOrderIdOrderByCreatedAtDesc(orderId).stream()
                .map(h -> new OrderStatusHistoryResponse(h.getId(), h.getStatus(), h.getNote(), h.getCreatedAt() == null ? "" : h.getCreatedAt().format(DATE_TIME_FORMATTER)))
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInvoice(Long id) {
        OrderResponse order = getOrderById(id);
        return Map.of("order", order, "shopName", "HUI LEGION", "invoiceTitle", "HÓA ĐƠN BÁN HÀNG");
    }

    @Transactional(readOnly = true)
    public OrderStatsResponse getStatistics() {
        List<Order> orders = orderRepository.findAll();
        LocalDate today = LocalDate.now();
        long totalOrders = orders.size(), pendingOrders = 0L, shippingOrders = 0L, doneOrders = 0L, cancelOrders = 0L, paidOrders = 0L, unpaidOrders = 0L, totalRevenue = 0L, todayRevenue = 0L, monthRevenue = 0L;
        for (Order order : orders) {
            String status = safeTrim(order.getStatus()).toLowerCase();
            String paymentStatus = safeTrim(order.getPaymentStatus()).toUpperCase();
            long total = order.getTotal() == null ? 0L : order.getTotal();
            if (status.equals("pending")) pendingOrders++;
            if (status.equals("shipping")) shippingOrders++;
            if (status.equals("done")) doneOrders++;
            if (status.equals("cancel")) cancelOrders++;
            if (paymentStatus.equals("PAID")) paidOrders++;
            if (paymentStatus.equals("UNPAID")) unpaidOrders++;
            if (status.equals("done") || paymentStatus.equals("PAID")) {
                totalRevenue += total;
                if (order.getCreatedAt() != null) {
                    LocalDate createdDate = order.getCreatedAt().toLocalDate();
                    if (createdDate.equals(today)) todayRevenue += total;
                    if (createdDate.getYear() == today.getYear() && createdDate.getMonth() == today.getMonth()) monthRevenue += total;
                }
            }
        }
        return new OrderStatsResponse(totalOrders, pendingOrders, shippingOrders, doneOrders, cancelOrders, paidOrders, unpaidOrders, totalRevenue, todayRevenue, monthRevenue);
    }

    private void restoreStock(Order order) {
        if (order.getItems() == null) return;
        for (OrderItem item : order.getItems()) {
            if (item.getProductId() == null) continue;
            productRepository.findById(item.getProductId()).ifPresent(product -> {
                int stock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
                int quantity = item.getQuantity() == null ? 0 : item.getQuantity();
                product.setStockQuantity(stock + quantity);
                productRepository.save(product);
            });
        }
    }

    private void addHistory(Order order, String status, String note) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order); history.setStatus(status); history.setNote(note);
        historyRepository.save(history);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems() == null ? new ArrayList<>() : order.getItems().stream()
                .map(item -> new OrderItemResponse(item.getProductId(), item.getName(), item.getImageUrl(), item.getPrice(), item.getQuantity(), item.getLineTotal()))
                .toList();
        return new OrderResponse(order.getId(), order.getCode(), order.getUserEmail(), order.getCustomerName(), order.getCustomerPhone(), order.getShippingAddress(), order.getTotal(), order.getStatus(), order.getPaymentMethod(), order.getPaymentStatus(), order.getCreatedAt() == null ? "" : order.getCreatedAt().format(DATE_TIME_FORMATTER), items);
    }

    private String normalizeEmail(String email) { return safeTrim(email).toLowerCase(); }
    private String safeTrim(String value) { return value == null ? "" : value.trim(); }
    private String defaultIfBlank(String value, String fallback) { String trimmed = safeTrim(value); return trimmed.isBlank() ? fallback : trimmed; }
    private boolean isValidStatus(String status) { return status.equals("pending") || status.equals("shipping") || status.equals("done") || status.equals("cancel"); }
    private boolean isValidPaymentStatus(String paymentStatus) { return paymentStatus.equals("UNPAID") || paymentStatus.equals("PAID"); }
}
