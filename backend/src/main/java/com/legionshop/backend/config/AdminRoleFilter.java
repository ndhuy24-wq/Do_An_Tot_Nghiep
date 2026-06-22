package com.legionshop.backend.config;

import com.legionshop.backend.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter bảo vệ quyền Admin. Lọc các HTTP request gửi tới server, 
 * nếu request yêu cầu quyền Admin, filter sẽ kiểm tra token trong Header Authorization.
 */
@Component
/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Bo loc bao mat / Interceptor - AdminRoleFilter.
 */
public class AdminRoleFilter extends OncePerRequestFilter {
    private final TokenService tokenService;

    public AdminRoleFilter(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        // Kiểm tra xem API hiện tại có bắt buộc quyền Admin hay không
        boolean adminApi = isAdminApi(request, path);

        if (adminApi) {
            // Lấy token từ Header "Authorization: Bearer <token>"
            String token = resolveBearerToken(request);
            try {
                // Xác thực token và kiểm tra quyền admin
                if (token == null || !tokenService.isAdminAccessToken(token)) {
                    writeForbidden(response, "Bạn không có quyền truy cập chức năng quản trị.");
                    return;
                }
            } catch (RuntimeException e) {
                // Trả về thông báo lỗi cụ thể nếu token không hợp lệ hoặc hết hạn
                writeForbidden(response, e.getMessage());
                return;
            }
        }
        // Cho phép request tiếp tục đi tới Controller xử lý nếu hợp lệ hoặc không cần quyền Admin
        filterChain.doFilter(request, response);
    }

    /**
     * Xác định xem API request có yêu cầu quyền Admin hay không dựa trên URL và HTTP Method.
     */
    private boolean isAdminApi(HttpServletRequest request, String path) {
        String method = request.getMethod();

        // 1. Mọi URL bắt đầu bằng /api/admin đều là API quản trị
        if (path.startsWith("/api/admin")) return true;

        // 2. Với /api/products, các hành động ghi dữ liệu (POST, PUT, DELETE) yêu cầu quyền admin.
        //    Hành động đọc dữ liệu (GET) được phép truy cập công khai.
        if (path.startsWith("/api/products")) {
            return !"GET".equalsIgnoreCase(method);
        }

        // 3. Xem báo cáo thống kê doanh thu đơn hàng
        if (path.startsWith("/api/orders/statistics")) return true;
        
        // 4. Lấy danh sách toàn bộ đơn hàng (GET /api/orders mà không lọc theo email khách hàng cụ thể)
        if (path.matches("/api/orders/?")) {
            return "GET".equalsIgnoreCase(method) && isBlank(request.getParameter("email"));
        }
        
        // 5. Các API thay đổi trạng thái đơn hàng hoặc thanh toán đơn hàng
        if (path.startsWith("/api/orders/")) {
            return !path.contains("/checkout")
                    && !path.contains("/cancel")
                    && (path.endsWith("/status") || path.endsWith("/payment-status"));
        }

        // 6. Lấy danh sách toàn bộ yêu cầu sửa chữa dịch vụ (GET mà không lọc theo email khách hàng cụ thể)
        if (path.matches("/api/service-requests/?")) {
            return "GET".equalsIgnoreCase(method) && isBlank(request.getParameter("email"));
        }
        
        // 7. Cập nhật tiến độ yêu cầu dịch vụ (PUT /api/service-requests/{id})
        if (path.startsWith("/api/service-requests/")) {
            return "PUT".equalsIgnoreCase(method);
        }

        return false;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    /**
     * Trích xuất token từ Header "Authorization: Bearer <token>"
     */
    private String resolveBearerToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        return authorization.substring(7).trim();
    }

    /**
     * Gửi phản hồi lỗi 403 Forbidden về phía client dưới dạng JSON.
     */
    private void writeForbidden(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\":\"" + escapeJson(message) + "\"}");
    }

    private String escapeJson(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
