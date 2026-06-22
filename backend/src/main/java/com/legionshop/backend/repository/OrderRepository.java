package com.legionshop.backend.repository;

import com.legionshop.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Repository ket noi co so du lieu cho ban Order.
 */
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<Order> findAllByOrderByCreatedAtDesc();
}