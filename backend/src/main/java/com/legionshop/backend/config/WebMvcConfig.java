package com.legionshop.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Cấu hình Web MVC cho ứng dụng.
 * Cấu hình đường dẫn tài nguyên tĩnh, ví dụ như ánh xạ các tệp ảnh tải lên từ thư mục uploads.
 */
@Configuration
/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Cau hinh he thong - WebMvcConfig.
 */
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Lấy đường dẫn tuyệt đối của thư mục "uploads" trong thư mục gốc dự án
        Path uploadDir = Paths.get("uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();
        
        // Ánh xạ URL dạng "/uploads/**" tới thư mục vật lý chứa file trên ổ đĩa
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
