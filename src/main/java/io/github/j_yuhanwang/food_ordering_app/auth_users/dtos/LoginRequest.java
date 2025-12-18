package io.github.j_yuhanwang.food_ordering_app.auth_users.dtos;/*
 * @author BlairWang
 * @Date 16/12/2025 2:48 pm
 * @Version 1.0
 */

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
//    NotNull can only detect the value of null,
//    NotBlank can retrieve the empty space,  "" and null.
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
