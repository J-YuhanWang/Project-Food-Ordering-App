package io.github.j_yuhanwang.food_ordering_app.payment.repository;

import io.github.j_yuhanwang.food_ordering_app.enums.PaymentStatus;
import io.github.j_yuhanwang.food_ordering_app.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Repository interface for Payment entity.
 *
 * @author YuhanWang
 * @Date 28/01/2026 6:14 pm
 */
public interface PaymentRepository extends JpaRepository<Payment,Long> {
    Page<Payment> findByUserId(Long userId, Pageable pageable);
    Optional<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByOrderIdAndPaymentStatus(Long orderId, PaymentStatus paymentStatus);

    //Retrieve all Payments if the ID of the Canteen object associated with its corresponding Order object equals the passed parameter.
    @Query("SELECT p FROM Payment p WHERE p.order.canteen.id=:canteenId")
    Page<Payment> findByCanteenId(@Param("canteenId") Long canteenId, Pageable pageable);

    Optional<Payment> findByTransactionId(String transactionId);

    @Query("SELECT COALESCE(SUM(p.amount),0) " +
            "FROM Payment p " +
            "WHERE (:canteenId IS NULL) OR (p.order.canteen.id = :canteenId) " +
            "AND p.paymentStatus='COMPLETED'")
    BigDecimal calculateTotalRevenue(@Param("canteenId") Long canteenId);

    @Query("SELECT COUNT(p) " +
            "FROM Payment p " +
            "WHERE (:canteenId IS NULL) OR (p.order.id=:canteenId) " +
            "AND p.paymentStatus=:paymentStatus")
    Long countOrdersByStatus(
            @Param("canteenId") Long canteenId,
            @Param("paymentStatus") PaymentStatus peymentStatus
    );
}
