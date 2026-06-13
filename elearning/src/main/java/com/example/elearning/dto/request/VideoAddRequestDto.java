package com.example.elearning.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VideoAddRequestDto {
    @NotNull(message = "File ID không được để trống")
    private Long fileId;
    
    private Integer durationMinutes;
}
