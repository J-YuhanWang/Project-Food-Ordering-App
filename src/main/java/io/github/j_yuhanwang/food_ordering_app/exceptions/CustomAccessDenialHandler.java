package io.github.j_yuhanwang.food_ordering_app.exceptions;/*
 * @author BlairWang
 * @Date 22/12/2025 9:23 pm
 * @Version 1.0
 */

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.j_yuhanwang.food_ordering_app.response.Response;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Custom handler for Access Denied (HTTP 403) errors.
 * This is triggered when an authenticated user attempts to access a resource
 * they do not have the required permissions for.
 */
@Component
@RequiredArgsConstructor
public class CustomAccessDenialHandler implements AccessDeniedHandler {

    // Inject ObjectMapper to convert the Response object into a JSON string
    private final ObjectMapper objectMapper;


    /**
     * Handles the access denied failure.
     */
    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException)
            throws IOException, ServletException {

        // 1. Construct the uniform error response object
        Response<?> errorResponse = Response.builder()
                .statusCode(HttpStatus.FORBIDDEN.value()) //403 error
                .message(accessDeniedException.getMessage())
                .build();

        // 2. Set response headers and status code
        response.setContentType("application/json");
        response.setStatus(HttpStatus.FORBIDDEN.value());
        // 3. Write the JSON string to the response body
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
