package com.example.elearning.service.impl;

import com.example.elearning.dto.response.NotificationResponseDto;
import com.example.elearning.dto.response.PageResponseDto;
import com.example.elearning.exception.ResourceNotFoundException;
import com.example.elearning.exception.AccessDeniedException;
import com.example.elearning.mapper.NotificationMapper;
import com.example.elearning.model.Notification;
import com.example.elearning.repository.NotificationRepository;
import com.example.elearning.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public PageResponseDto<NotificationResponseDto> getMyNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId, pageable);

        List<NotificationResponseDto> content = notificationPage.getContent().stream()
                .map(notificationMapper::toNotificationResponseDto)
                .collect(Collectors.toList());

        return PageResponseDto.<NotificationResponseDto>builder()
                .content(content)
                .pageNo(notificationPage.getNumber())
                .pageSize(notificationPage.getSize())
                .totalElements(notificationPage.getTotalElements())
                .totalPages(notificationPage.getTotalPages())
                .last(notificationPage.isLast())
                .build();
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUser_UserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo", "NOTIFICATION_NOT_FOUND"));

        // Kiểm tra quyền: Chỉ chủ sở hữu mới được đánh dấu đã đọc
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("Bạn không có quyền thao tác trên thông báo này", "ACCESS_DENIED");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}
