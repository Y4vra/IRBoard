package com.y4vra.irboardbackend.domain.errors;

public class ProjectStateException extends RuntimeException {
    public ProjectStateException(String message) {
        super(message);
    }
    public ProjectStateException(String message, Throwable cause) {
        super(message,cause);
    }
}
