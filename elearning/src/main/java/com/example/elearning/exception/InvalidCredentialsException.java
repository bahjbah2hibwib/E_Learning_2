package com.example.elearning.exception;

public class InvalidCredentialsException extends RuntimeException {
    private final String errorCode;

    public InvalidCredentialsException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
