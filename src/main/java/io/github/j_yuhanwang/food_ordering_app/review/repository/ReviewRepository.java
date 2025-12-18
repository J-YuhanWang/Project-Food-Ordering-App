package io.github.j_yuhanwang.food_ordering_app.review.repository;/*
 * @author BlairWang
 * @Date 18/12/2025 6:48 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review,Long> {

    List<Review> findByMenuIdOrderByIdDesc(Long menuId);

    @Query("""
        SELECT AVG(r.rating)
        FROM Review r
        WHERE r.menu.id = :menuId
        """)
    Double calculateAverageRatingByIdDesc(@Param("menuId") Long menuId);

    @Query("""
           SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
           FROM Review r
           WHERE r.user.id = :userId
           AND r.menu.id = :menuId
           AND r.orderId = :orderId
           """)
    boolean existsByUserIdAndMenuIdAndOrderId(
            @Param("userId") Long userId,
            @Param("menuId") Long menuId,
            @Param("orderId") Long orderId
    );
}
