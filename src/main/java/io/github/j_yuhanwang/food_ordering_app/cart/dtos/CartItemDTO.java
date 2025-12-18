package io.github.j_yuhanwang.food_ordering_app.cart.dtos;/*
 * @author BlairWang
 * @Date 17/12/2025 7:42 pm
 * @Version 1.0
 */

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.github.j_yuhanwang.food_ordering_app.cart.entity.Cart;
import io.github.j_yuhanwang.food_ordering_app.menu.dtos.MenuDTO;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

import java.math.BigDecimal;

//Entity是接收收集到的信息直通database，DTO是从数据库层层返上来直连前端的，反馈给front-end
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)//只包含非空项，如果为null,不传递给前端
@JsonIgnoreProperties(ignoreUnknown = true)//如果包含Unknown properties->ignored
public class CartItemDTO {

    private Long id;

    private MenuDTO menu;

    private int quantity;

    private BigDecimal pricePerUnit;

    private BigDecimal subtotal;
}
