package io.github.j_yuhanwang.food_ordering_app.auth_users.services;

import io.github.j_yuhanwang.food_ordering_app.auth_users.dtos.LoginRequest;
import io.github.j_yuhanwang.food_ordering_app.auth_users.dtos.LoginResponse;
import io.github.j_yuhanwang.food_ordering_app.auth_users.dtos.RegistrationRequest;
import io.github.j_yuhanwang.food_ordering_app.auth_users.dtos.UserDTO;

/**
 * @author YuhanWang
 * @Date 16/03/2026 9:36 am
 */
public interface AuthService {
    //registration can return a UserDTO
    UserDTO register(RegistrationRequest registrationRequest);
    LoginResponse login(LoginRequest loginRequest);
    LoginResponse refreshToken(String refreshToken);
    //logout: clean up the refresh token from redis
    void logout(String email);

}
