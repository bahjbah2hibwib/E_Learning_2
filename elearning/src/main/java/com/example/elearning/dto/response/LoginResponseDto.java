package com.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {
    private String accessToken;
    private String tokenType;
    private Long expiresIn;
    private UserLoginDto user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserLoginDto {
        private Long userId;
        private String fullName;
        private String email;
        private Long avatarFileId;
        private String role;
        private Boolean status;
    }
}
