package com.example.elearning.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CourseCreateRequestDto {

    @NotBlank(message = "Tiêu đề khóa học không được để trống")
    private String title;

    private String description;
    
    private String whatYouWillLearn;

    private Integer categoryId;

    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "^(DRAFT|PENDING|APPROVED|HIDDEN)$", message = "Trạng thái không hợp lệ")
    private String status;

    @Min(value = 0, message = "Giá khóa học không được âm")
    private BigDecimal price;

    private Long thumbnailFileId;
}
