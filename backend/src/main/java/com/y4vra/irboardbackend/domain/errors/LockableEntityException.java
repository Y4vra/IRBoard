package com.y4vra.irboardbackend.domain.errors;

public class LockableEntityException extends RuntimeException {
    public LockableEntityException(String message, Throwable cause) {
        super(message, cause);
    }
    public LockableEntityException(String message) {
        super(message);
    }
}
