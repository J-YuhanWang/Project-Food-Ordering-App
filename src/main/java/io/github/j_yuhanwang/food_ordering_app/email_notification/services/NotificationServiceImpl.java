package io.github.j_yuhanwang.food_ordering_app.email_notification.services;

import io.github.j_yuhanwang.food_ordering_app.email_notification.dtos.NotificationDTO;
import io.github.j_yuhanwang.food_ordering_app.email_notification.entity.Notification;
import io.github.j_yuhanwang.food_ordering_app.email_notification.repository.NotificationRepository;
import io.github.j_yuhanwang.food_ordering_app.enums.NotificationType;
import io.github.j_yuhanwang.food_ordering_app.exceptions.EmailDeliveryException;
import io.github.j_yuhanwang.food_ordering_app.order.dtos.OrderDTO;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * @author YuhanWang
 * @Date 19/02/2026 8:55 pm
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService{
    private final JavaMailSender javaMailSender;
    private final NotificationRepository notificationRepository;

    private final TemplateEngine templateEngine;

    @Async
    @Override
    public void sendVerificationEmail(NotificationDTO notificationDTO) {
        log.info("Inside sendVerificationEmail()");
        try{
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mimeMessage,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );
            helper.setTo(notificationDTO.getRecipient());
            helper.setSubject(notificationDTO.getSubject());
            helper.setText(notificationDTO.getBody(), notificationDTO.isHtml());
            javaMailSender.send(mimeMessage);

            //save to database
            Notification notification = Notification.builder()
                    .recipient(notificationDTO.getRecipient())
                    .subject(notificationDTO.getSubject())
                    .body(notificationDTO.getBody())
                    .notificationType(notificationDTO.getNotificationType())
                    .isHtml(notificationDTO.isHtml())
                    .build();

            notificationRepository.save(notification);
            log.info("Email record saved to database.");
        }catch (Exception e){
            log.error("Failed to send email:{}",e.getMessage());
            throw new EmailDeliveryException("Failed to send notification email to " + notificationDTO.getRecipient());
        }
    }

    @Async
    public void sendOrderConfirmation(OrderDTO orderDTO,String userEmail){
        log.info("Preparing order confirmation email for order: {}", orderDTO.getId());
        try{

            // 1. Build Thymeleaf context
            Context context = new Context();
            context.setVariable("customerName",orderDTO.getUserName());
            context.setVariable("orderId",orderDTO.getId());
            context.setVariable("orderDate",orderDTO.getOrderDate()
                    .format(DateTimeFormatter.ofPattern("dd MM yyyy, HH:mm:ss")));
            context.setVariable("canteenName",orderDTO.getCanteenName());
            context.setVariable("orderItems",orderDTO.getItems());
            context.setVariable("totalAmount",orderDTO.getTotalAmount());
            context.setVariable("pickupCode",orderDTO.getPickupCode());
            context.setVariable("currentYear", LocalDate.now().getYear());

            // 2. Render HTML
            String htmlContent = templateEngine.process("order-confirmation",context);

            // 3.Build MimeMessage
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mimeMessage,
                    MimeMessageHelper.MULTIPART_MODE_RELATED,
                    StandardCharsets.UTF_8.name()
            );
            helper.setTo(userEmail);
            helper.setSubject("UCD Canteen — Order Confirmed #" + orderDTO.getId());
            helper.setText(htmlContent,true);

            // 4. Send
            javaMailSender.send(mimeMessage);

            // 5. Save audit log to database
            Notification notification = Notification.builder()
                    .recipient(userEmail)
                    .subject("UCD Canteen — Order Confirmed #" + orderDTO.getId())
                    .body(htmlContent)
                    .notificationType(NotificationType.EMAIL)
                    .createdAt(LocalDateTime.now())
                    .isHtml(true)
                    .build();
            notificationRepository.save(notification);
            log.info("Order confirmation sent for order: {}", orderDTO.getId());

        }catch (Exception e){
            log.error("Failed to send order confirmation for order {}: {}",
                    orderDTO.getId(), e.getMessage());
            throw new EmailDeliveryException(
                    "Failed to send order confirmation for order: " + orderDTO.getId());

        }
    }
}
