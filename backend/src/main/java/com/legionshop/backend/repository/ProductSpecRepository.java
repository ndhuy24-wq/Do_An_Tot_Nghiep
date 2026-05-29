package com.legionshop.backend.repository;

import com.legionshop.backend.entity.ProductSpec;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductSpecRepository extends JpaRepository<ProductSpec, Long> {
    // Không cần thêm phương thức đặc biệt nào ở đây, JpaRepository đã đủ
}