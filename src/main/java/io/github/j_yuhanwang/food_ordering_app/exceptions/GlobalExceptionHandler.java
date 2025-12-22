package io.github.j_yuhanwang.food_ordering_app.exceptions;/*
 * @author BlairWang
 * @Date 22/12/2025 4:29 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.response.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;


@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle all uncaught exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Response<?>> handlerAllUnknownException(Exception ex){

        // 1. Create a custom response body with a 500 status code and the error message.
        // 创建自定义响应体，包含 500 状态码和错误消息。
        Response<?> response = Response.builder()
                .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message(ex.getMessage())
                .build();

        // 2. Wrap the response body in a ResponseEntity with an actual HTTP 500 status.
        // 将响应体封装在具有实际 HTTP 500 状态的 ResponseEntity 中。
        return new ResponseEntity<>(response,HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle not found exceptions.
     */
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Response<?>> handlerNotFoundException(NotFoundException ex){

        // 1. Create a custom response body with a NOT_FOUND status code and the error message.
        Response<?> response = Response.builder()
                .statusCode(HttpStatus.NOT_FOUND.value())  //404 error
                .message(ex.getMessage())
                .build();

        // 2. Wrap the response body in a ResponseEntity with an actual HTTP NOT_FOUND status.
        return new ResponseEntity<>(response,HttpStatus.NOT_FOUND);
    }

    /**
     * Handle bad request exceptions.
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Response<?>> handlerBadRequestException(BadRequestException ex){

        // 1. Create a custom response body with a BAD_REQUEST status code and the error message.
        Response<?> response = Response.builder()
                .statusCode(HttpStatus.BAD_REQUEST.value()) //400 error
                .message(ex.getMessage())
                .build();

        // 2. Wrap the response body in a ResponseEntity with an actual HTTP BAD_REQUEST status.
        return new ResponseEntity<>(response,HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle payment processing exceptions.
     */
    @ExceptionHandler(PaymentProcessingException.class)
    public ResponseEntity<Response<?>> handlerPaymentProcessingException(PaymentProcessingException ex){
        Response<?> response = Response.builder()
                .statusCode(HttpStatus.BAD_GATEWAY.value()) //502 error
                .message(ex.getMessage())
                .build();

        return new ResponseEntity<>(response,HttpStatus.BAD_GATEWAY);
    }


    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<Response<?>> handlerUnauthorizedAccessException(UnauthorizedAccessException ex){
        Response<?> response = Response.builder()
                .statusCode(HttpStatus.UNAUTHORIZED.value()) //401 error
                .message(ex.getMessage())
                .build();

        return new ResponseEntity<>(response,HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Response<?>> handlerIllegalArgumentException(IllegalArgumentException ex){
        Response<?> response = Response.builder()
                .statusCode(HttpStatus.BAD_REQUEST.value()) //400 error
                .message(ex.getMessage())
                .build();

        return new ResponseEntity<>(response,HttpStatus.BAD_REQUEST);
    }

}
