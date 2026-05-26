package com.y4vra.irboardbackend.domain.errors;

public class PermissionServiceException extends RuntimeException {
    public PermissionServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
