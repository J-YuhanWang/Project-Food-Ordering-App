package io.github.j_yuhanwang.food_ordering_app.auth_users.dtos;/*
 * @author BlairWang
 * @Date 16/12/2025 3:00 pm
 * @Version 1.0
 */

import lombok.Data;

import java.util.List;

@Data
public class LoginResponse {

    private String token;
    private List<String> roles;
}
