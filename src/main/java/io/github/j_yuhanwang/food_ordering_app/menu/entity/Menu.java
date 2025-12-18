package io.github.j_yuhanwang.food_ordering_app.menu.entity;/*
 * @author BlairWang
 * @Date 18/12/2025 2:04 pm
 * @Version 1.0
 */


import io.github.j_yuhanwang.food_ordering_app.category.entity.Category;
import io.github.j_yuhanwang.food_ordering_app.order.entity.OrderItem;
import io.github.j_yuhanwang.food_ordering_app.review.entity.Review;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Entity
@Table(name="menus")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Menu {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Price is required")
    private BigDecimal price;

    private String imageUrl;

    @ManyToOne
    @JoinColumn(name="category_id")
    private Category category;

    @OneToMany(mappedBy = "menu",cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

//    当这个属性完全依赖于当前类也就是review依赖当前menu时，可以用orphanRemoval
//    但是例如OrderItems不仅隶属于当条menu也可能在别的menu组合里出现，不能严格检查立马删除
    @OneToMany(mappedBy = "menu",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Review> reviews;
}
