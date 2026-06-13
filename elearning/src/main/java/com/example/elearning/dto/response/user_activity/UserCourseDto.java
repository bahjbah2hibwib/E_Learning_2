package com.example.elearning.dto.response.user_activity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCourseDto {
    private Long courseId;
    private String courseName;
    private String status;
    private String enrollDate;
}
