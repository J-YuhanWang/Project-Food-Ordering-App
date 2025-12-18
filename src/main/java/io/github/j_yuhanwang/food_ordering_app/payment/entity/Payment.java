package io.github.j_yuhanwang.food_ordering_app.payment.entity;/*
 * @author BlairWang
 * @Date 18/12/2025 5:05 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.auth_users.entity.User;
import io.github.j_yuhanwang.food_ordering_app.enums.PaymentGateway;
import io.github.j_yuhanwang.food_ordering_app.enums.PaymentStatus;
import io.github.j_yuhanwang.food_ordering_app.order.entity.Order;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@Table(name = "payments")
@AllArgsConstructor
@NoArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name="order_id")
    private Order order;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private String transactionId;

    @Enumerated(EnumType.STRING)
    private PaymentGateway paymentGateway;

    private String failureReasons;

    private LocalDateTime paymentDate;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;//The user who made the payment

}
