package io.github.j_yuhanwang.food_ordering_app.order.repository;/*
 * @author BlairWang
 * @Date 18/12/2025 4:42 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem,Long> {

//    Check whether the order contains the order items
//    scenario1: a user wants to write a review for a dish, but the system needs to check whether he/she have ordered it before
//    scenario2: a user wants to add a dish to the cart, the system needs to check whether he/she have ordered it before.
//              If it is, add the number, else add the whole info of that dish.
    @Query("SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END " +
            "FROM OrderItem oi " +
            "WHERE oi.order.id = :orderId AND oi.menu.id = :menuId")
    boolean existsByOrderIdAndMenuId(
            @Param("orderId") Long orderId,
            @Param("menuId") Long menuId
    );
}
