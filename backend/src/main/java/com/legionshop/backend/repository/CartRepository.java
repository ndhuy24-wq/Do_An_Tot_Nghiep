package com.legionshop.backend.repository;
import com.legionshop.backend.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Ma nguon thuoc du an LEGION SHOP - Website ban laptop/phu kien gaming.
 * Repository ket noi co so du lieu cho ban Cart.
 */
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserEmail(String userEmail);
}