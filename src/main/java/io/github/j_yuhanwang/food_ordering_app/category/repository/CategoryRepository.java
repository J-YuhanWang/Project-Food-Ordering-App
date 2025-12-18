package io.github.j_yuhanwang.food_ordering_app.category.repository;/*
 * @author BlairWang
 * @Date 17/12/2025 8:42 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;



public interface CategoryRepository extends JpaRepository<Category,Long> {
}
