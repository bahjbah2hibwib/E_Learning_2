package com.example.elearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseStatusUpdateRequestDto {
    
    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "APPROVED|HIDDEN", message = "Trạng thái chỉ có thể là APPROVED hoặc HIDDEN")
    private String status;

}
