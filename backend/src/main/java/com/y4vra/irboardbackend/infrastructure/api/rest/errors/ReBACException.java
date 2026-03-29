package com.y4vra.irboardbackend.infrastructure.api.rest.errors;

public class ReBACException extends RuntimeException {
    public ReBACException(String message, Throwable cause) {
        super(message, cause);
    }
}
