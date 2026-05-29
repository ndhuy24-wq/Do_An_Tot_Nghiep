package com.legionshop.backend.repository;

import com.legionshop.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // Không cần thêm phương thức đặc biệt nào ở đây, JpaRepository đã đủ
}