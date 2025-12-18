package io.github.j_yuhanwang.food_ordering_app.payment.repository;/*
 * @author BlairWang
 * @Date 18/12/2025 5:23 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment,Long> {
}
