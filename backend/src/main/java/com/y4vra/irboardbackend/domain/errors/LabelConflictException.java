package com.y4vra.irboardbackend.domain.errors;

public class LabelConflictException extends RuntimeException {
    public LabelConflictException(String message, Throwable cause) {
        super(message, cause);
    }
    public LabelConflictException(String message) {
        super(message);
    }
}
