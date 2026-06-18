package com.example.elearning.mapper;

import com.example.elearning.dto.response.CourseAdminDetailResponseDto;
import com.example.elearning.dto.response.CourseAdminItemDto;
import com.example.elearning.dto.response.CourseDetailResponseDto;
import com.example.elearning.model.Course;
import com.example.elearning.model.Lesson;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    @Mapping(source = "instructor.fullName", target = "instructorName")
    @Mapping(source = "category.categoryId", target = "categoryId")
    @Mapping(source = "category.categoryName", target = "categoryName")
    @Mapping(source = "description", target = "description")
    // thumbnailUrl sẽ được map thủ công ở tầng Service thông qua MinioService
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "totalStudents", ignore = true)
    @Mapping(target = "paidStudents", ignore = true)
    @Mapping(target = "totalRevenue", ignore = true)
    CourseAdminItemDto toCourseAdminItemDto(Course course);

    CourseDetailResponseDto toCourseDetailResponseDto(Course course);

    @Mapping(source = "course.instructor.userId", target = "instructor.userId")
    @Mapping(source = "course.instructor.fullName", target = "instructor.fullName")
    @Mapping(source = "course.instructor.email", target = "instructor.email")
    @Mapping(source = "course.category.categoryId", target = "category.categoryId")
    @Mapping(source = "course.category.categoryName", target = "category.categoryName")
    @Mapping(source = "sections", target = "sections")
    @Mapping(target = "thumbnailUrl", ignore = true) // Sẽ được map thủ công qua MinioService
    @Mapping(target = "totalStudents", ignore = true)
    @Mapping(target = "instructorName", ignore = true)
    CourseAdminDetailResponseDto toCourseAdminDetailResponseDto(Course course, List<com.example.elearning.model.Section> sections);

    CourseAdminDetailResponseDto.SectionDto toSectionDto(com.example.elearning.model.Section section);
    
    @Mapping(target = "videoCount", ignore = true)
    @Mapping(target = "documentCount", ignore = true)
    @Mapping(target = "quizCount", ignore = true)
    @Mapping(target = "durationMinutes", ignore = true)
    @Mapping(target = "videos", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "quizzes", ignore = true)
    CourseAdminDetailResponseDto.LessonDto toLessonDto(Lesson lesson);
}
