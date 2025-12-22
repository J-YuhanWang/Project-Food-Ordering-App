package io.github.j_yuhanwang.food_ordering_app.exceptions;/*
 * @author BlairWang
 * @Date 22/12/2025 3:29 pm
 * @Version 1.0
 */

/**
 * Custom exception to indicate that a requested resource was not found.
 * Inherits from RuntimeException to avoid mandatory try-catch blocks (Unchecked Exception).
 */
public class PaymentProcessingException extends RuntimeException{

    /**
     * Pass the custom message to the parent RuntimeException constructor.
     * @param message Detailed error information.
     */
    public PaymentProcessingException(String message){
        super(message);
    }
}
