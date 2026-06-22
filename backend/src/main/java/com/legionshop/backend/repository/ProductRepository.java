package com.legionshop.backend.repository;

import com.legionshop.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Repository ket noi co so du lieu cho ban Product.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Không cần thêm phương thức đặc biệt nào ở đây, JpaRepository đã đủ
}