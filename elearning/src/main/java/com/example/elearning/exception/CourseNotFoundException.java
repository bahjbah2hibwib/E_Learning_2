package com.example.elearning.exception;

public class CourseNotFoundException extends RuntimeException {
    private final String errorCode;

    public CourseNotFoundException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
