package com.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardResponseDto {
    private LearningCourseDto learningCourse;
    private int totalEnrolled;
    private int totalCompletedLessons;
    private List<MyCourseDto> myCourses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LearningCourseDto {
        private Long courseId;
        private String courseName;
        private String categoryName;
        private String thumbnailUrl;
        private String currentChapter;
        private int progressPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MyCourseDto {
        private Long courseId;
        private String courseName;
        private String categoryName;
        private String thumbnailUrl;
        private int progressPercentage;
    }
}
