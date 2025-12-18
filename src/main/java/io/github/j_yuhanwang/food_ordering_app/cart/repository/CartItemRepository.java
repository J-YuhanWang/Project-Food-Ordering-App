package io.github.j_yuhanwang.food_ordering_app.cart.repository;/*
 * @author BlairWang
 * @Date 17/12/2025 8:28 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem,Long> {

}
