package com.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserCreateResponseDto {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private Long avatarFileId; // API trả về File ID thay vì URL cho case tạo mới
    private String role;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
