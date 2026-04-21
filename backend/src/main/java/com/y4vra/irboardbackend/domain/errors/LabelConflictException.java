package com.y4vra.irboardbackend.domain.errors;

public class LabelConflictException extends RuntimeException {
    public LabelConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
