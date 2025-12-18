package io.github.j_yuhanwang.food_ordering_app.payment.dtos;/*
 * @author BlairWang
 * @Date 18/12/2025 5:18 pm
 * @Version 1.0
 */

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.github.j_yuhanwang.food_ordering_app.auth_users.dtos.UserDTO;
import io.github.j_yuhanwang.food_ordering_app.auth_users.entity.User;
import io.github.j_yuhanwang.food_ordering_app.enums.PaymentGateway;
import io.github.j_yuhanwang.food_ordering_app.enums.PaymentStatus;
import io.github.j_yuhanwang.food_ordering_app.order.dtos.OrderDTO;
import io.github.j_yuhanwang.food_ordering_app.order.entity.Order;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentDTO {

    private Long id;

    private Long orderId;

    private BigDecimal amount;

    private PaymentStatus paymentStatus;

    private String transactionId;

    private PaymentGateway paymentGateway;

    private String failureReasons;

    private boolean success;

    private LocalDateTime paymentDate;

    private UserDTO user;//The user who made the payment
    private OrderDTO order;
}
