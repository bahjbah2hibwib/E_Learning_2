package com.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseAdminDetailResponseDto {
    private Long courseId;
    private String title;
    private String description;
    private String whatYouWillLearn;
    private String thumbnailUrl;
    private BigDecimal price;
    private Boolean isFree;
    private String status;
    private InstructorDto instructor;
    private CategoryDto category;
    private List<SectionDto> sections;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private Long totalStudents;
    private String instructorName;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InstructorDto {
        private Long userId;
        private String fullName;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryDto {
        private Integer categoryId;
        private String categoryName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionDto {
        private Long sectionId;
        private String title;
        private Integer sectionOrder;
        private List<LessonDto> lessons;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonDto {
        private Long lessonId;
        private String title;
        private String lessonType;
        private Integer lessonOrder;
        private String description;
        
        // Data for previewing
        private Integer videoCount;
        private Integer documentCount;
        private Integer quizCount;
        private Integer durationMinutes;
        
        private List<VideoDto> videos;
        private List<DocumentDto> documents;
        private List<QuizDto> quizzes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VideoDto {
        private Long videoId;
        private String title;
        private String videoUrl;
        private Integer durationMinutes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentDto {
        private Long documentId;
        private String title;
        private String fileUrl;
        private String fileName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizDto {
        private Long quizId;
        private String title;
        private List<QuestionDto> questions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionDto {
        private Long questionId;
        private String questionText;
        private List<AnswerDto> answers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerDto {
        private Long answerId;
        private String answerText;
        private Boolean isCorrect;
    }
}
