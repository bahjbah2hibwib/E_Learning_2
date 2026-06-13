package com.example.elearning.controller;

import com.example.elearning.dto.response.NotificationResponseDto;
import com.example.elearning.dto.response.PageResponseDto;
import com.example.elearning.security.JwtTokenProvider;
import com.example.elearning.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // Bước 1: Trích xuất userId từ JWT Token
        Long currentUserId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            currentUserId = jwtTokenProvider.getUserIdFromJwtToken(token);
        }

        // Bước 2: Gọi Service
        PageResponseDto<NotificationResponseDto> data = notificationService.getMyNotifications(currentUserId, page, size);

        // Bước 3: Trả về JSON
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách thông báo thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long currentUserId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            currentUserId = jwtTokenProvider.getUserIdFromJwtToken(token);
        }

        long data = notificationService.getUnreadCount(currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long currentUserId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            currentUserId = jwtTokenProvider.getUserIdFromJwtToken(token);
        }

        notificationService.markAsRead(id, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã đánh dấu đã đọc");
        response.put("data", null);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long currentUserId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            currentUserId = jwtTokenProvider.getUserIdFromJwtToken(token);
        }

        notificationService.markAllAsRead(currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã đánh dấu đọc tất cả");
        response.put("data", null);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
