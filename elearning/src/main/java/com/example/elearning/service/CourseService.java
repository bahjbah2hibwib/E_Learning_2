package com.example.elearning.service;

import com.example.elearning.dto.response.CourseAdminItemDto;
import com.example.elearning.dto.response.PageResponseDto;

import com.example.elearning.dto.request.CourseStatusUpdateRequestDto;
import com.example.elearning.dto.response.CourseDetailResponseDto;
import com.example.elearning.dto.response.CourseAdminDetailResponseDto;

public interface CourseService {
    PageResponseDto<CourseAdminItemDto> getAdminCourses(int page, int size, String status, String keyword, String currentRole);
    
    CourseDetailResponseDto updateCourseStatus(Long courseId, CourseStatusUpdateRequestDto request, String currentRole);
    
    PageResponseDto<CourseAdminItemDto> getPublicCourses(int page, int size, String keyword);
    
    CourseAdminDetailResponseDto getPublicCourseDetail(Long courseId);

    CourseAdminDetailResponseDto getCourseDetail(Long courseId, String currentRole, Long currentUserId);
    
    PageResponseDto<CourseAdminItemDto> getInstructorCourses(Long instructorId, int page, int size, String status, String keyword);
    
    CourseDetailResponseDto createCourse(com.example.elearning.dto.request.CourseCreateRequestDto request, Long instructorId);
    
    CourseDetailResponseDto updateCourse(Long courseId, com.example.elearning.dto.request.CourseUpdateRequestDto request, Long instructorId);
    
    void deleteCourse(Long courseId, Long instructorId);

    java.util.List<com.example.elearning.dto.response.CourseStudentDto> getCourseStudents(Long courseId, Long instructorId);
}
