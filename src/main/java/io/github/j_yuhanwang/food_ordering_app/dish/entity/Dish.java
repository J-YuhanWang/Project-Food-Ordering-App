package io.github.j_yuhanwang.food_ordering_app.dish.entity;

import io.github.j_yuhanwang.food_ordering_app.canteen.entity.Canteen;
import io.github.j_yuhanwang.food_ordering_app.order.entity.OrderItem;
import io.github.j_yuhanwang.food_ordering_app.review.entity.Review;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a specific food item or dish available for purchase.
 * A Dish item belongs to a specific {@link Canteen}. It includes pricing details,
 * availability windows (e.g., Breakfast only), and links to customer reviews.
 * Enhanced with Soft Delete (@SQLDelete + @SQLRestriction)
 *
 * @author BlairWang
 * @version 1.1
 * @date 17/06/2026 3:24 pm
 */

@Table(name = "dishes",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"canteen_id", "name","is_deleted"}
                )
        })
@SQLDelete(sql = "UPDATE dishes SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted=false")
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Dish {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the dish (e.g., "Kung Pao Chicken").
     */
    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private String imageUrl;

    /**
     * The canteen that provides this dish item.
     * Relationship: Many Dish items belong to One Canteen.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "canteen_id", nullable = false)
    @ToString.Exclude
    private Canteen canteen;

    /**
     * Historical record of orders containing this item.
     * Used for sales analysis or popularity ranking.
     */
    @OneToMany(mappedBy = "dish", cascade = CascadeType.ALL)
    @ToString.Exclude
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    /**
     * Customer reviews specific to this dish.
     */
    @OneToMany(mappedBy = "dish", cascade = CascadeType.ALL)
    @ToString.Exclude
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    /**
     * Category tag (e.g., "Main Course", "Beverage", "Dessert").
     */
    private String foodCategory;

    @Builder.Default
    private boolean isAvailable=true;

    /**
     * Soft delete status flag.
     * false = Active, true = Deleted.
     */
    @Column(name="is_deleted",nullable = false)
    @Builder.Default
    private boolean isDeleted=false;



}