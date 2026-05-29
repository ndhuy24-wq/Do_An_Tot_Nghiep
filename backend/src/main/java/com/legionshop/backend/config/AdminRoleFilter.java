package com.legionshop.backend.config;

import com.legionshop.backend.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AdminRoleFilter extends OncePerRequestFilter {
    private final TokenService tokenService;

    public AdminRoleFilter(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean adminApi = isAdminApi(request, path);

        if (adminApi) {
            String token = resolveBearerToken(request);
            try {
                if (token == null || !tokenService.isAdminAccessToken(token)) {
                    writeForbidden(response, "Bạn không có quyền truy cập chức năng quản trị.");
                    return;
                }
            } catch (RuntimeException e) {
                writeForbidden(response, e.getMessage());
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private boolean isAdminApi(HttpServletRequest request, String path) {
        String method = request.getMethod();

        if (path.startsWith("/api/admin")) return true;

        if (path.startsWith("/api/products")) {
            return !"GET".equalsIgnoreCase(method);
        }

        if (path.startsWith("/api/orders/statistics")) return true;
        if (path.matches("/api/orders/?")) {
            return "GET".equalsIgnoreCase(method) && isBlank(request.getParameter("email"));
        }
        if (path.startsWith("/api/orders/")) {
            return !path.contains("/checkout")
                    && !path.contains("/cancel")
                    && (path.endsWith("/status") || path.endsWith("/payment-status"));
        }

        if (path.matches("/api/service-requests/?")) {
            return "GET".equalsIgnoreCase(method) && isBlank(request.getParameter("email"));
        }
        if (path.startsWith("/api/service-requests/")) {
            return "PUT".equalsIgnoreCase(method);
        }

        return false;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String resolveBearerToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        return authorization.substring(7).trim();
    }

    private void writeForbidden(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\":\"" + escapeJson(message) + "\"}");
    }

    private String escapeJson(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
