package com.y4vra.irboardbackend.domain.errors;

public class RemovedEntityException extends RuntimeException {
    public RemovedEntityException(String message) {
        super(message);
    }
    public RemovedEntityException(String message, Throwable cause) {super(message, cause);}
}
