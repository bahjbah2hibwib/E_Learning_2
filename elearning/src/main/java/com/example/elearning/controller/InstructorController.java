package com.example.elearning.controller;

import com.example.elearning.dto.response.CourseAdminItemDto;
import com.example.elearning.model.Course;
import com.example.elearning.model.Enrollment;
import com.example.elearning.model.enums.CourseStatus;
import com.example.elearning.repository.CourseRepository;
import com.example.elearning.repository.EnrollmentRepository;
import com.example.elearning.repository.PaymentRepository;
import com.example.elearning.security.JwtTokenProvider;
import com.example.elearning.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/instructor")
@RequiredArgsConstructor
public class InstructorController {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;
    private final MinioService minioService;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.example.elearning.service.CourseService courseService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getInstructorDashboard(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 1. Thống kê tổng quan
        long totalCourses = courseRepository.countByInstructor_UserId(currentUserId);
        long activeCourses = courseRepository.countByInstructor_UserIdAndStatus(currentUserId, CourseStatus.APPROVED);
        long totalStudents = enrollmentRepository.countUniqueStudentsByInstructor(currentUserId);

        // 2. Tình hình đăng ký (Lấy enrollments trong 5 tháng gần nhất)
        List<Enrollment> enrollments = enrollmentRepository.findByInstructorId(currentUserId);
        Map<String, Integer> monthlyRegistrations = new HashMap<>();
        
        LocalDateTime now = LocalDateTime.now();
        for (int i = 4; i >= 0; i--) {
            LocalDateTime target = now.minusMonths(i);
            String monthLabel = "T" + target.getMonthValue();
            monthlyRegistrations.put(monthLabel, 0);
        }

        for (Enrollment e : enrollments) {
            if (e.getEnrollDate() != null) {
                LocalDateTime ed = e.getEnrollDate();
                if (ed.isAfter(now.minusMonths(5).withDayOfMonth(1))) {
                    String monthLabel = "T" + ed.getMonthValue();
                    if (monthlyRegistrations.containsKey(monthLabel)) {
                        monthlyRegistrations.put(monthLabel, monthlyRegistrations.get(monthLabel) + 1);
                    }
                }
            }
        }

        List<Map<String, Object>> registrationTrend = new ArrayList<>();
        for (int i = 4; i >= 0; i--) {
            LocalDateTime target = now.minusMonths(i);
            String monthLabel = "T" + target.getMonthValue();
            Map<String, Object> point = new HashMap<>();
            point.put("name", monthLabel);
            point.put("value", monthlyRegistrations.getOrDefault(monthLabel, 0));
            registrationTrend.add(point);
        }

        // 3. Khóa học của bạn
        List<Course> myCourses = courseRepository.findByInstructor_UserId(currentUserId);
        List<Map<String, Object>> courseList = myCourses.stream()
            .map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("key", c.getCourseId().toString());
                map.put("title", c.getTitle());
                map.put("category", c.getCategory() != null ? c.getCategory().getCategoryName() : "Không phân loại");
                map.put("status", c.getStatus().name());
                map.put("registered", enrollmentRepository.countByCourse_CourseId(c.getCourseId()));
                
                String thumb = null;
                if (c.getThumbnailFile() != null) {
                    try {
                        thumb = minioService.getPreSignedUrl(c.getThumbnailFile().getFilePath());
                    } catch (Exception ex) {}
                }
                map.put("thumb", thumb != null ? thumb : "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png");
                return map;
            })
            .sorted((a, b) -> Long.compare((Long)b.get("registered"), (Long)a.get("registered"))) // Sắp xếp theo đăng ký giảm dần
            .collect(Collectors.toList());

        // Đóng gói response
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("totalCourses", totalCourses);
        dashboardData.put("activeCourses", activeCourses);
        dashboardData.put("totalStudents", totalStudents);
        dashboardData.put("registrationTrend", registrationTrend);
        dashboardData.put("myCourses", courseList);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy thống kê dashboard giảng viên thành công");
        response.put("data", dashboardData);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/courses")
    public ResponseEntity<Map<String, Object>> getInstructorCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        com.example.elearning.dto.response.PageResponseDto<CourseAdminItemDto> data = 
            courseService.getInstructorCourses(currentUserId, page, size, status, keyword);
            
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách khóa học giảng viên thành công");
        response.put("data", data);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/courses")
    public ResponseEntity<Map<String, Object>> createCourse(
            @jakarta.validation.Valid @RequestBody com.example.elearning.dto.request.CourseCreateRequestDto request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        com.example.elearning.dto.response.CourseDetailResponseDto data = courseService.createCourse(request, currentUserId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Tạo khóa học thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<Map<String, Object>> updateCourse(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody com.example.elearning.dto.request.CourseUpdateRequestDto request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        com.example.elearning.dto.response.CourseDetailResponseDto data = courseService.updateCourse(id, request, currentUserId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Cập nhật khóa học thành công");
        response.put("data", data);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Map<String, Object>> deleteCourse(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        courseService.deleteCourse(id, currentUserId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Xóa khóa học thành công");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/courses/{id}/students")
    public ResponseEntity<Map<String, Object>> getCourseStudents(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        java.util.List<com.example.elearning.dto.response.CourseStudentDto> students = courseService.getCourseStudents(id, currentUserId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách học viên thành công");
        response.put("data", students);

        return ResponseEntity.ok(response);
    }

    private Long extractUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtTokenProvider.getUserIdFromJwtToken(token);
        }
        return null;
    }
}
