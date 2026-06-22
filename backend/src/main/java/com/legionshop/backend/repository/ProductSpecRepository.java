package com.legionshop.backend.repository;

import com.legionshop.backend.entity.ProductSpec;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Repository ket noi co so du lieu cho ban ProductSpec.
 */
public interface ProductSpecRepository extends JpaRepository<ProductSpec, Long> {
    // Không cần thêm phương thức đặc biệt nào ở đây, JpaRepository đã đủ
}