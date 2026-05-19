package com.y4vra.irboardbackend.domain.errors;

public class DeactivatedEntityException extends RuntimeException {
    public DeactivatedEntityException(String message) {
        super(message);
    }
    public DeactivatedEntityException(String message, Throwable cause) {super(message, cause);}
}
