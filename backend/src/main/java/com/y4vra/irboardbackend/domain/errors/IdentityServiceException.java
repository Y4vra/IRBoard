package com.y4vra.irboardbackend.domain.errors;

public class IdentityServiceException extends RuntimeException {
    public IdentityServiceException(String message, Throwable cause) {
        super(message, cause);
    }
    public IdentityServiceException(String message) {
        super(message);
    }
}
