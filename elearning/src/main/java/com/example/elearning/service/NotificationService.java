package com.example.elearning.service;

import com.example.elearning.dto.response.NotificationResponseDto;
import com.example.elearning.dto.response.PageResponseDto;

public interface NotificationService {
    PageResponseDto<NotificationResponseDto> getMyNotifications(Long userId, int page, int size);
    long getUnreadCount(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
    
    // Thêm các hàm tạo thông báo
    void sendNotification(Long targetUserId, String title, String message, String type);
    void sendNotificationToRole(com.example.elearning.model.enums.UserRole role, String title, String message, String type);
}
