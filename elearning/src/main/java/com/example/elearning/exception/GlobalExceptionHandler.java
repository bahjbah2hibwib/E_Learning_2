package com.example.elearning.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Xử lý lỗi trùng lặp dữ liệu (Email hoặc Số điện thoại) - Case 2 trong register.md
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleUserAlreadyExistsException(UserAlreadyExistsException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("errorCode", ex.getErrorCode()); // VD: "EMAIL_ALREADY_EXISTS"
        response.put("message", ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.CONFLICT); // HTTP 409 Conflict
    }

    // Xử lý lỗi Validation Dữ liệu đầu vào (@Valid trong DTO) - Case 3 trong register.md
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("errorCode", "VALIDATION_FAILED");
        response.put("message", "Dữ liệu đầu vào không hợp lệ");

        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        response.put("errors", errors);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST); // HTTP 400 Bad Request
    }

    // Xử lý lỗi sai thông tin đăng nhập - Case 2 trong login.md
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentialsException(InvalidCredentialsException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("errorCode", ex.getErrorCode()); // VD: "INVALID_CREDENTIALS"
        response.put("message", ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED); // HTTP 401 Unauthorized
    }

    // Xử lý lỗi tài khoản bị khóa - Case 3 trong login.md
    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<Map<String, Object>> handleAccountLockedException(AccountLockedException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("errorCode", ex.getErrorCode()); // VD: "ACCOUNT_LOCKED"
        response.put("message", ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN); // HTTP 403 Forbidden
    }

    // Xử lý lỗi Không có quyền truy cập - Case 2 trong manage_user.md
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("errorCode", ex.getErrorCode()); // VD: "FORBIDDEN_ACCESS"
        response.put("message", ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN); // HTTP 403 Forbidden
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("errorCode", ex.getErrorCode()); 
        response.put("message", ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND); // HTTP 404 Not Found
    }

    // Xử lý lỗi Không tìm thấy người dùng - Case 2 trong manage_user_detail.md
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFoundException(UserNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("errorCode", ex.getErrorCode()); // VD: "USER_NOT_FOUND"
        response.put("message", ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND); // HTTP 404 Not Found
    }

    @ExceptionHandler(CourseNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleCourseNotFoundException(CourseNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("errorCode", ex.getErrorCode()); // VD: "COURSE_NOT_FOUND"
        response.put("message", ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND); // HTTP 404 Not Found
    }

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handlePaymentNotFoundException(PaymentNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("errorCode", ex.getErrorCode()); // VD: "PAYMENT_NOT_FOUND"
        response.put("message", ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND); // HTTP 404 Not Found
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("errorCode", "INVALID_ARGUMENT");
        response.put("message", ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST); // HTTP 400 Bad Request
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("errorCode", "INTERNAL_SERVER_ERROR");
        response.put("message", "Lỗi Server: " + ex.getMessage() + " | Type: " + ex.getClass().getSimpleName());
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
