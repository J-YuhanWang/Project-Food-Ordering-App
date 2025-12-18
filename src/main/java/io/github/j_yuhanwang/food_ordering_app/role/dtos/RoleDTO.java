package io.github.j_yuhanwang.food_ordering_app.role.dtos;/*
 * @author BlairWang
 * @Date 18/12/2025 7:47 pm
 * @Version 1.0
 */

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class RoleDTO {
    private Long id;
    private String name;
}
