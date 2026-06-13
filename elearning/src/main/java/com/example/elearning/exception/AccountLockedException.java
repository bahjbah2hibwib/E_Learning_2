package com.example.elearning.exception;

public class AccountLockedException extends RuntimeException {
    private final String errorCode;

    public AccountLockedException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
