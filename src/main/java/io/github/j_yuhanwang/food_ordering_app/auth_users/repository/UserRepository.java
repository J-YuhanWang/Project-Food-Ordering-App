package io.github.j_yuhanwang.food_ordering_app.auth_users.repository;/*
 * @author BlairWang
 * @Date 16/12/2025 3:12 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.auth_users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

}
