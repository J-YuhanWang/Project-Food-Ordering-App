package io.github.j_yuhanwang.food_ordering_app.cart.entity;/*
 * @author BlairWang
 * @Date 17/12/2025 6:56 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.menu.entity.Menu;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Entity
@Table(name="cart_items")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="cart_id")
    private Cart cart;

    @ManyToOne
    @JoinColumn(name="menu_id")
    private Menu menu;

    private int quantity;

    private BigDecimal pricePerUnit;

    private BigDecimal subtotal;

}
