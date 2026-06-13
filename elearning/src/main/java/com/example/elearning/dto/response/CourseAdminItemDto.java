package com.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseAdminItemDto {
    private Long courseId;
    private String title;
    private String instructorName;
    private String thumbnailUrl;
    private String status;
    private BigDecimal price;
    private LocalDateTime createdAt;
    private Long totalStudents;
    private Long paidStudents;
    private BigDecimal totalRevenue;
    private String description;
    private Long categoryId;
    private String categoryName;
}
