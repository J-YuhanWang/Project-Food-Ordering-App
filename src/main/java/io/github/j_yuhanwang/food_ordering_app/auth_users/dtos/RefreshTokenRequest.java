package io.github.j_yuhanwang.food_ordering_app.auth_users.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author YuhanWang
 * @Date 02/06/2026 10:47 pm
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenRequest {
    private String refreshToken;
}
