package com.y4vra.irboardbackend.infrastructure.api.rest.errors;

public class AccountRecoveryException extends RuntimeException {
    public AccountRecoveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
