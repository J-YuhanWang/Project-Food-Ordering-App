package io.github.j_yuhanwang.food_ordering_app.review.dtos;/*
 * @author BlairWang
 * @Date 18/12/2025 6:27 pm
 * @Version 1.0
 */

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.github.j_yuhanwang.food_ordering_app.auth_users.entity.User;
import io.github.j_yuhanwang.food_ordering_app.menu.entity.Menu;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReviewDTO {
    private Long id;

    private Long menuId;

    private Long orderId;

    @NotNull(message = "Rating is required")
    @Min(1)
    @Max(10)
    private Integer rating;//e.g..1 to 10 stars

    @Size(max = 500, message = "Comment cannot exceed 500 characters")
    private String comment;

    private String menuName;

    private LocalDateTime createdAt;

}
