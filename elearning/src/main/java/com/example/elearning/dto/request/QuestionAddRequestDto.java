package com.example.elearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class QuestionAddRequestDto {
    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String questionText;

    @NotEmpty(message = "Phải có ít nhất 2 đáp án")
    private List<AnswerAddRequestDto> answers;
    
    @Data
    public static class AnswerAddRequestDto {
        @NotBlank(message = "Nội dung đáp án không được để trống")
        private String answerText;
        
        @NotNull(message = "Trạng thái đúng/sai không được để trống")
        private Boolean isCorrect;
    }
}
