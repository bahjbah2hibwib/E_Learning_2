package com.example.elearning.service;

import com.example.elearning.dto.request.LessonCreateRequestDto;
import com.example.elearning.dto.request.SectionCreateRequestDto;
import com.example.elearning.dto.response.CourseAdminDetailResponseDto;

public interface CurriculumService {
    CourseAdminDetailResponseDto.SectionDto createSection(Long courseId, SectionCreateRequestDto requestDto, Long userId);
    CourseAdminDetailResponseDto.SectionDto updateSection(Long sectionId, SectionCreateRequestDto requestDto, Long userId);
    CourseAdminDetailResponseDto.LessonDto createLesson(Long sectionId, LessonCreateRequestDto requestDto, Long userId);
    CourseAdminDetailResponseDto.LessonDto updateLesson(Long lessonId, com.example.elearning.dto.request.LessonUpdateRequestDto requestDto, Long userId);
    void deleteSection(Long sectionId, Long userId);
    void deleteLesson(Long lessonId, Long userId);
    CourseAdminDetailResponseDto.VideoDto addVideoToLesson(Long lessonId, com.example.elearning.dto.request.VideoAddRequestDto requestDto, Long userId);
    CourseAdminDetailResponseDto.DocumentDto addDocumentToLesson(Long lessonId, com.example.elearning.dto.request.DocumentAddRequestDto requestDto, Long userId);
    CourseAdminDetailResponseDto.QuestionDto addQuestionToLesson(Long lessonId, com.example.elearning.dto.request.QuestionAddRequestDto requestDto, Long userId);
    CourseAdminDetailResponseDto.QuestionDto updateQuestion(Long questionId, com.example.elearning.dto.request.QuestionUpdateRequestDto requestDto, Long userId);
    void deleteQuestion(Long questionId, Long userId);
}
