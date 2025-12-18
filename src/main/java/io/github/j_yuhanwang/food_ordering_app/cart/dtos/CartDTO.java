package io.github.j_yuhanwang.food_ordering_app.cart.dtos;/*
 * @author BlairWang
 * @Date 17/12/2025 7:04 pm
 * @Version 1.0
 */

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CartDTO {

    private Long id;
    private List<CartItemDTO> cartItems;
    private Long menuId;
    private int quantity;
    private BigDecimal totalAmount;
}
