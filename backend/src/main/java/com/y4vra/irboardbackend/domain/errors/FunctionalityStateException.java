package com.y4vra.irboardbackend.domain.errors;

public class FunctionalityStateException extends RuntimeException {
    public FunctionalityStateException(String message) {
        super(message);
    }
    public FunctionalityStateException(String message, Throwable cause) {
        super(message,cause);
    }
}
