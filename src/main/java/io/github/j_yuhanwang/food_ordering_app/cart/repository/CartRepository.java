package io.github.j_yuhanwang.food_ordering_app.cart.repository;/*
 * @author BlairWang
 * @Date 17/12/2025 7:48 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart,Long> {
    Optional<Cart> findByUser_Id(Long userId);
}
