package com.example.elearning.exception;

public class AccessDeniedException extends RuntimeException {
    private final String errorCode;

    public AccessDeniedException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
