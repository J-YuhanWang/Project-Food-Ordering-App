package io.github.j_yuhanwang.food_ordering_app.email_notification.entity;/*
 * @author BlairWang
 * @Date 17/12/2025 8:56 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.enums.NotificationType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@Entity
@Table(name="notifications")
@AllArgsConstructor
@NoArgsConstructor

public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;

    @NotBlank(message = "recipient is required")
    private String recipient;

    @Lob
    private String body;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private final LocalDateTime createdAt = LocalDateTime.now();

    private boolean isHtml;
}
