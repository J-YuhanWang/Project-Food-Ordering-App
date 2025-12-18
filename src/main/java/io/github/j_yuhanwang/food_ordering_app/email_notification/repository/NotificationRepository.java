package io.github.j_yuhanwang.food_ordering_app.email_notification.repository;/*
 * @author BlairWang
 * @Date 18/12/2025 2:03 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.email_notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification,Long> {

}
