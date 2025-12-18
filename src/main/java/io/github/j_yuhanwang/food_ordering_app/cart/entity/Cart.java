package io.github.j_yuhanwang.food_ordering_app.cart.entity;/*
 * @author BlairWang
 * @Date 16/12/2025 8:03 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.auth_users.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

//Due to it is the entity, it will connect to the database
@Data
@Entity
@Table(name="carts")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<CartItem> cartItems;

    private String promoCode;
}
