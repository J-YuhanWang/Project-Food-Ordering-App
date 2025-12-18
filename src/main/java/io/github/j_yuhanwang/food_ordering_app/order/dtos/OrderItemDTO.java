package io.github.j_yuhanwang.food_ordering_app.order.dtos;/*
 * @author BlairWang
 * @Date 18/12/2025 3:51 pm
 * @Version 1.0
 */

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.github.j_yuhanwang.food_ordering_app.menu.dtos.MenuDTO;
import io.github.j_yuhanwang.food_ordering_app.menu.entity.Menu;
import io.github.j_yuhanwang.food_ordering_app.order.entity.Order;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderItemDTO {

    private Long id;

    private MenuDTO menu;

    private Long menuId;

    private int quantity;

    private BigDecimal pricePerUnit;

    private BigDecimal subtotal;
}
