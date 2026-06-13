package com.example.elearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionCreateRequestDto {
    
    @NotBlank(message = "Tiêu đề chương không được để trống")
    @Size(max = 255, message = "Tiêu đề quá dài")
    private String title;
}
