package com.example.elearning.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CourseStudentDto {
    private Long studentId;
    private String fullName;
    private String email;
    private LocalDateTime enrollDate;
    private String status;
}
