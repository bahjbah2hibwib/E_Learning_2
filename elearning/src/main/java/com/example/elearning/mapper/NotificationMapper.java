package com.example.elearning.mapper;

import com.example.elearning.dto.response.NotificationResponseDto;
import com.example.elearning.model.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "notificationId", target = "id")
    NotificationResponseDto toNotificationResponseDto(Notification notification);
}
