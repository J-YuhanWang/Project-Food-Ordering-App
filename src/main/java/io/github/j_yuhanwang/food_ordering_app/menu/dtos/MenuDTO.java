package io.github.j_yuhanwang.food_ordering_app.menu.dtos;/*
 * @author BlairWang
 * @Date 18/12/2025 2:39 pm
 * @Version 1.0
 */

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.github.j_yuhanwang.food_ordering_app.category.entity.Category;
import io.github.j_yuhanwang.food_ordering_app.review.dtos.ReviewDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder
public class MenuDTO {

    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private String imageUrl;

    @NotBlank(message = "Category ID is required")
    private Long categoryId;

    private MultipartFile imageFile;

    private List<ReviewDTO> reviews;
}
