package io.github.j_yuhanwang.food_ordering_app.category.dtos;/*
 * @author BlairWang
 * @Date 17/12/2025 8:39 pm
 * @Version 1.0
 */

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CategoryDTO {
    private Long id;

    @NotBlank(message="A name is required")
    private String name;

    private String description;
}
