package io.github.j_yuhanwang.food_ordering_app.menu.repository;/*
 * @author BlairWang
 * @Date 18/12/2025 3:07 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.menu.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

//JpaSpecificationExecutor<Menu>可以支持复杂的动态查询，例如组合查询
public interface MenuRepository extends JpaRepository<Menu, Long>, JpaSpecificationExecutor<Menu> {
}
