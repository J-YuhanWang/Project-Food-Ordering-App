package io.github.j_yuhanwang.food_ordering_app.order.services;

import io.github.j_yuhanwang.food_ordering_app.enums.OrderStatus;
import io.github.j_yuhanwang.food_ordering_app.enums.PaymentStatus;
import io.github.j_yuhanwang.food_ordering_app.order.dtos.CanteenStatsDTO;
import io.github.j_yuhanwang.food_ordering_app.order.dtos.OrderDTO;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @author YuhanWang
 * @Date 04/04/2026 12:56 pm
 */
public interface OrderService {
    //1.create the order(core logic)
    OrderDTO placeOrderFromCart();

    //2. Query methods
    //2.1 users themselves/admin/valid manager can query the specific order
    OrderDTO getOrderById(Long orderId);
    //2.2 user themselves can query their own orders
    Page<OrderDTO> getOrdersOfUser(int page,int size);
    //2.3 manager can query the specific canteen's orders
    Page<OrderDTO> getOrdersByCanteenId(Long canteenId, OrderStatus status, int page, int size);
    //2.4 only the administrators can query all orders
    Page<OrderDTO> getAllOrders(OrderStatus orderStatus, int page, int size);

    //3.change the order status
    OrderDTO updateOrderStatus(Long orderId,OrderStatus status);
    //Timed scanning method (waiting for 15 minutes, do not convey to frontend)
    void cancelUnpaidOrders();
    //user cancel the order actively
    void cancelOrder(Long orderId);

    //5.synchronize the payment status
    void syncPaymentStatus(Long orderId, PaymentStatus paymentStatus);

    OrderDTO updateOrderStatusSystemForced(Long orderId, OrderStatus newStatus);

    //4. the aggregate information
    long countUniqueCustomers();
    BigDecimal getRevenueByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    //5. the aggregate canteen information
    CanteenStatsDTO getCanteenStats(Long canteenId,LocalDateTime startDate, LocalDateTime endDate);

}
