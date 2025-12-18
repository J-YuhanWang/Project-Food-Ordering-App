package io.github.j_yuhanwang.food_ordering_app.role.repository;/*
 * @author BlairWang
 * @Date 18/12/2025 8:09 pm
 * @Version 1.0
 */


import io.github.j_yuhanwang.food_ordering_app.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role,Long> {

    Optional<Role> findByName(String name);
}
