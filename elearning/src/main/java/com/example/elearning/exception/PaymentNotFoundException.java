package com.example.elearning.exception;

public class PaymentNotFoundException extends RuntimeException {
    private final String errorCode;

    public PaymentNotFoundException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
