package io.github.j_yuhanwang.food_ordering_app.canteen.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.github.j_yuhanwang.food_ordering_app.auth_users.dtos.UserDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CanteenAdminDTO {

    private Long id;

    @NotBlank(message = "Canteen name is required")
    private String name;

    private String canteenType;

    private String imageUrl;

    private UserDTO manager;
}
