package io.github.j_yuhanwang.food_ordering_app.exceptions;/*
 * @author BlairWang
 * @Date 22/12/2025 3:29 pm
 * @Version 1.0
 */

/**
 * Custom exception to indicate that a requested resource was not found.
 * Inherits from RuntimeException to avoid mandatory try-catch blocks (Unchecked Exception).
 */
public class NotFoundException extends RuntimeException{

    /**
     * Pass the custom message to the parent RuntimeException constructor.
     * @param message Detailed error information.
     */
    public NotFoundException(String message){
        // Passing the message to the superclass (RuntimeException)
        // so that Java's built-in error handling mechanisms
        // (like e.getMessage() and stack traces) can access it.
        // 将消息传递给父类（RuntimeException），
        // 以便 Java 内置的错误处理机制（如 e.getMessage() 和堆栈跟踪）能够访问它。
        super(message);
    }
}
