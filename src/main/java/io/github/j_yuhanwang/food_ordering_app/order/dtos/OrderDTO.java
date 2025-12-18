package io.github.j_yuhanwang.food_ordering_app.order.dtos;/*
 * @author BlairWang
 * @Date 18/12/2025 3:34 pm
 * @Version 1.0
 */

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.github.j_yuhanwang.food_ordering_app.auth_users.dtos.UserDTO;
import io.github.j_yuhanwang.food_ordering_app.auth_users.entity.User;
import io.github.j_yuhanwang.food_ordering_app.enums.OrderStatus;
import io.github.j_yuhanwang.food_ordering_app.enums.PaymentStatus;
import io.github.j_yuhanwang.food_ordering_app.order.entity.OrderItem;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderDTO {

    private Long id;

    private UserDTO user;

    private LocalDateTime orderDate;

    private BigDecimal totalAmount;

    private OrderStatus orderStatus;

    private PaymentStatus paymentStatus;

//    The Payment object containing transaction serial number and
//    payment gateway information does not need to be passed to the front end.
//    private Payment payment;

    private List<OrderItemDTO> orderItems;
}
