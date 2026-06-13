package com.example.elearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LessonCreateRequestDto {

    @NotBlank(message = "Tiêu đề bài giảng không được để trống")
    private String title;

    @NotBlank(message = "Loại bài giảng không được để trống")
    @Pattern(regexp = "^(VIDEO|DOCUMENT|QUIZ)$", message = "Loại bài giảng phải là VIDEO, DOCUMENT hoặc QUIZ")
    private String lessonType;
}
