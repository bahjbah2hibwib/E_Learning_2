package com.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserItemResponseDto {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private Boolean status;
    private String avatarUrl;
    private LocalDateTime createdAt;
}
