package io.github.j_yuhanwang.food_ordering_app.order.entity;/*
 * @author BlairWang
 * @Date 18/12/2025 3:29 pm
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
@Builder
@Table(name = "order_items")
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "menu_id")
    private Menu menu;

    private int quantity;

    private BigDecimal pricePerUnit;

    private BigDecimal subtotal;

}
