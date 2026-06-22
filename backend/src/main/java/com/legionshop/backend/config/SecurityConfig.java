package com.legionshop.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Cấu hình bảo mật hệ thống sử dụng Spring Security.
 * Định cấu hình CORS, cơ chế mã hóa mật khẩu, và thêm bộ lọc AdminRoleFilter tùy chỉnh.
 */
@Configuration
@EnableWebSecurity
/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Cau hinh he thong - SecurityConfig.
 */
public class SecurityConfig {
    private final AdminRoleFilter adminRoleFilter;

    public SecurityConfig(AdminRoleFilter adminRoleFilter) {
        this.adminRoleFilter = adminRoleFilter;
    }

    /**
     * Định hình chuỗi bộ lọc bảo mật HTTP.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Vô hiệu hóa CSRF cho ứng dụng REST API không dùng session cookie truyền thống
                .cors(Customizer.withDefaults()) // Áp dụng cấu hình CORS bên dưới
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập công khai tất cả API, việc phân quyền sẽ do bộ lọc AdminRoleFilter đảm nhiệm chi tiết hơn
                        .requestMatchers("/api/**").permitAll()
                        .anyRequest().permitAll()
                )
                // Đặt bộ lọc kiểm tra quyền Admin chạy trước bộ lọc đăng nhập cơ bản của Spring Security
                .addFilterBefore(adminRoleFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Cấu hình chia sẻ tài nguyên nguồn gốc chéo (CORS) cho phép frontend gọi API từ các domain khác nhau.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Cho phép các nguồn gốc (Origin) chỉ định truy cập API
        config.setAllowedOriginPatterns(List.of(
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "https://huilegion.netlify.app/"
        ));

        // Các phương thức HTTP được chấp nhận
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        // Các header được chấp nhận trong request gửi lên
        config.setAllowedHeaders(List.of("*", "Authorization"));

        // Cho phép gửi kèm cookie hoặc thông tin xác thực
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Định nghĩa bean mã hóa mật khẩu bằng thuật toán BCrypt.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
