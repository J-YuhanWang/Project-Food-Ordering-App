package io.github.j_yuhanwang.food_ordering_app.exceptions;

/**
 * Thrown when a client exceeds the allowed request rate.
 * Maps to HTTP 429 Too Many Requests.
 *
 * @author YuhanWang
 * @Date 06/06/2026 2:14 pm
 */
public class TooManyRequestsException extends RuntimeException{
    public TooManyRequestsException(String message){
        super(message);
    }
}
