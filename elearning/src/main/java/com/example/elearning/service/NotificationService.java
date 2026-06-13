package com.example.elearning.service;

import com.example.elearning.dto.response.NotificationResponseDto;
import com.example.elearning.dto.response.PageResponseDto;

public interface NotificationService {
    PageResponseDto<NotificationResponseDto> getMyNotifications(Long userId, int page, int size);
    long getUnreadCount(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
}
