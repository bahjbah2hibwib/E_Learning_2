package com.example.elearning.service;

import com.example.elearning.dto.request.AdminUserCreateRequestDto;
import com.example.elearning.dto.request.AdminUserUpdateRequestDto;
import com.example.elearning.dto.response.AdminUserCreateResponseDto;
import com.example.elearning.dto.response.PageResponseDto;
import com.example.elearning.dto.response.UserItemResponseDto;
import com.example.elearning.dto.response.UserDetailResponseDto;

public interface UserService {
    PageResponseDto<UserItemResponseDto> getAllUsers(int page, int size, String keyword, String role, Boolean status, String currentRole);
    
    AdminUserCreateResponseDto createUserByAdmin(AdminUserCreateRequestDto requestDto, String currentRole);

    UserDetailResponseDto getUserDetails(Long id, String currentRole, Long currentUserId);

    UserDetailResponseDto updateUserByAdmin(Long id, AdminUserUpdateRequestDto requestDto, String currentRole);

    com.example.elearning.dto.response.UserStatsResponseDto getUserStats(String currentRole);

    com.example.elearning.dto.response.StudentDashboardResponseDto getStudentDashboard(Long studentId);

    java.util.List<com.example.elearning.dto.response.user_activity.UserCourseDto> getUserCourses(Long userId);
    
    void enrollCourse(Long studentId, Long courseId);

    java.util.List<com.example.elearning.dto.response.user_activity.UserPaymentDto> getUserPayments(Long userId);

    java.util.Map<String, Object> getLearningData(Long userId, Long courseId);

    void markLessonCompleted(Long userId, Long lessonId);
}
