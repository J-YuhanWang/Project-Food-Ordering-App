package io.github.j_yuhanwang.food_ordering_app.order.entity;/*
 * @author BlairWang
 * @Date 18/12/2025 3:20 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.auth_users.entity.User;
import io.github.j_yuhanwang.food_ordering_app.enums.OrderStatus;
import io.github.j_yuhanwang.food_ordering_app.enums.PaymentStatus;
import io.github.j_yuhanwang.food_ordering_app.payment.entity.Payment;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@Table(name = "orders")
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    private LocalDateTime orderDate;

    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @OneToOne(mappedBy = "order")
    private Payment payment;

    @OneToMany(mappedBy = "order",cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;
}
