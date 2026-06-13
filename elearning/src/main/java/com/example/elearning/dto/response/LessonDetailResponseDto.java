package com.example.elearning.dto.response;

import lombok.Data;

@Data
public class LessonDetailResponseDto {
    private Long lessonId;
    private String title;
    private String lessonType;
    private Integer orderIndex;
    private String content; // Có thể sẽ chi tiết hóa sau thành video/reading material
}
