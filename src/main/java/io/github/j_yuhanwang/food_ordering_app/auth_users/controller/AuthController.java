package io.github.j_yuhanwang.food_ordering_app.auth_users.controller;

import io.github.j_yuhanwang.food_ordering_app.auth_users.dtos.*;
import io.github.j_yuhanwang.food_ordering_app.auth_users.services.AuthService;
import io.github.j_yuhanwang.food_ordering_app.exceptions.UnauthorizedAccessException;
import io.github.j_yuhanwang.food_ordering_app.response.Response;
import io.github.j_yuhanwang.food_ordering_app.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * @author YuhanWang
 * @Date 16/03/2026 3:48 pm
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public Response<UserDTO> register(@RequestBody @Valid RegistrationRequest registrationRequest){
        UserDTO userDTO = authService.register(registrationRequest);
        return Response.ok(userDTO,"User registered successfully");
    }

    @PostMapping("/login")
    public Response<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequest){
        LoginResponse loginResponse = authService.login(loginRequest);
        return Response.ok(loginResponse,"Login successfully");
    }

    @PostMapping("/logout")
    public Response<String> logout(){
        String email = SecurityUtils.getCurrentUserEmail();
        if(email==null || "anonymousUser".equals(email)){
            throw new UnauthorizedAccessException("Login required to logout");
        }
        authService.logout(email);
        return Response.ok(null,"Logout successfully");
    }

    @PostMapping("/refreshToken")
    public Response<LoginResponse> refreshToken(@RequestBody @Valid RefreshTokenRequest refreshRequest){
        LoginResponse loginResponse = authService.refreshToken(refreshRequest.getRefreshToken());
        return Response.ok(loginResponse,"Access token refreshed successfully");
    }
}
