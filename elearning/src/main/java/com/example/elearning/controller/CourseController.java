package com.example.elearning.controller;

import com.example.elearning.dto.request.CourseStatusUpdateRequestDto;
import com.example.elearning.dto.response.CourseAdminDetailResponseDto;
import com.example.elearning.dto.response.CourseAdminItemDto;
import com.example.elearning.dto.response.CourseDetailResponseDto;
import com.example.elearning.dto.response.PageResponseDto;
import com.example.elearning.security.JwtTokenProvider;
import com.example.elearning.service.CourseService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCoursesForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // Bước 1: Trích xuất role hiện tại từ JWT Token
        String currentRole = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Bỏ chữ "Bearer "
            currentRole = jwtTokenProvider.getRoleFromJwtToken(token);
        }

        // Bước 2: Gọi Service xử lý nghiệp vụ lấy danh sách khóa học
        PageResponseDto<CourseAdminItemDto> data = courseService.getAdminCourses(page, size, status, keyword, currentRole);

        // Bước 3: Đóng gói phản hồi theo chuẩn JSON
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách khóa học thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/public")
    public ResponseEntity<Map<String, Object>> getPublicCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {

        PageResponseDto<CourseAdminItemDto> data = courseService.getPublicCourses(page, size, keyword);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách khóa học công khai thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<Map<String, Object>> getPublicCourseDetail(@PathVariable Long id) {
        CourseAdminDetailResponseDto data = courseService.getPublicCourseDetail(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy chi tiết khóa học công khai thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateCourseStatus(
            @PathVariable Long id,
            @Valid @RequestBody CourseStatusUpdateRequestDto request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // Bước 1: Trích xuất role hiện tại từ JWT Token
        String currentRole = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Bỏ chữ "Bearer "
            currentRole = jwtTokenProvider.getRoleFromJwtToken(token);
        }

        // Bước 2: Gọi Service xử lý nghiệp vụ cập nhật trạng thái
        CourseDetailResponseDto data = courseService.updateCourseStatus(id, request, currentRole);

        // Bước 3: Đóng gói phản hồi theo chuẩn JSON
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Cập nhật trạng thái khóa học thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCourseDetail(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // Bước 1: Trích xuất role và userId từ JWT Token
        String currentRole = null;
        Long currentUserId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Bỏ chữ "Bearer "
            currentRole = jwtTokenProvider.getRoleFromJwtToken(token);
            currentUserId = jwtTokenProvider.getUserIdFromJwtToken(token);
        }

        // Bước 2: Gọi Service xử lý nghiệp vụ
        CourseAdminDetailResponseDto data = courseService.getCourseDetail(id, currentRole, currentUserId);

        // Bước 3: Đóng gói phản hồi
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy thông tin chi tiết khóa học thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
