package com.example.elearning.controller;

import com.example.elearning.dto.request.AdminUserCreateRequestDto;
import com.example.elearning.dto.request.AdminUserUpdateRequestDto;
import com.example.elearning.dto.response.AdminUserCreateResponseDto;
import com.example.elearning.dto.response.PageResponseDto;
import com.example.elearning.dto.response.UserItemResponseDto;
import com.example.elearning.security.JwtTokenProvider;
import com.example.elearning.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.example.elearning.websocket.OnlineUserManager onlineUserManager;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean status,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // Bước 1: Trích xuất role hiện tại từ SecurityContext
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentRole = null;
        if (auth != null && auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
            currentRole = auth.getAuthorities().iterator().next().getAuthority();
        }

        // Bước 2: Gọi Service xử lý nghiệp vụ
        PageResponseDto<UserItemResponseDto> data = userService.getAllUsers(page, size, keyword, role, status, currentRole);

        // Bước 3: Đóng gói phản hồi theo chuẩn JSON
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách người dùng thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createUserByAdmin(
            @Valid @RequestBody AdminUserCreateRequestDto requestDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // Bước 1: Trích xuất role hiện tại từ SecurityContext
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentRole = null;
        if (auth != null && auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
            currentRole = auth.getAuthorities().iterator().next().getAuthority();
        }

        // Bước 2: Gọi Service tạo user
        AdminUserCreateResponseDto data = userService.createUserByAdmin(requestDto, currentRole);

        // Bước 3: Đóng gói phản hồi chuẩn JSON (201 Created)
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Tạo tài khoản người dùng thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserDetails(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // Bước 1: Trích xuất thông tin người dùng hiện tại từ SecurityContext
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentRole = null;
        Long currentUserId = null;
        if (auth != null) {
            if (auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
                currentRole = auth.getAuthorities().iterator().next().getAuthority();
            }
            if (auth.getPrincipal() instanceof Long) {
                currentUserId = (Long) auth.getPrincipal();
            }
        }

        // Bước 2: Gọi Service lấy thông tin
        com.example.elearning.dto.response.UserDetailResponseDto data = userService.getUserDetails(id, currentRole, currentUserId);

        // Bước 3: Đóng gói phản hồi (200 OK)
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy thông tin người dùng thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUserByAdmin(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateRequestDto requestDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // Bước 1: Trích xuất role hiện tại từ SecurityContext (Chuẩn Spring Security)
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentRole = null;
        if (auth != null && auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
            currentRole = auth.getAuthorities().iterator().next().getAuthority();
        }

        // Bước 2: Gọi Service cập nhật user
        com.example.elearning.dto.response.UserDetailResponseDto data = userService.updateUserByAdmin(id, requestDto, currentRole);

        // Bước 3: Đóng gói phản hồi chuẩn JSON (200 OK)
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Cập nhật thông tin người dùng thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @Valid @RequestBody com.example.elearning.dto.request.UserProfileUpdateRequestDto requestDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = null;
        if (auth != null && auth.getPrincipal() instanceof Long) {
            currentUserId = (Long) auth.getPrincipal();
        }

        com.example.elearning.dto.response.UserDetailResponseDto data = userService.updateProfile(currentUserId, requestDto);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Cập nhật thông tin cá nhân thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        
        // Bước 1: Trích xuất role hiện tại từ SecurityContext
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentRole = null;
        if (auth != null && auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
            currentRole = auth.getAuthorities().iterator().next().getAuthority();
        }

        // Bước 2: Gọi Service lấy thống kê
        com.example.elearning.dto.response.UserStatsResponseDto data = userService.getUserStats(currentRole, startDate, endDate);

        // Bước 3: Đóng gói phản hồi
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy thống kê người dùng thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}/courses")
    public ResponseEntity<Map<String, Object>> getUserCourses(@PathVariable Long id) {
        java.util.List<com.example.elearning.dto.response.user_activity.UserCourseDto> data = userService.getUserCourses(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/{id}/courses/{courseId}/enroll")
    public ResponseEntity<Map<String, Object>> enrollCourse(
            @PathVariable Long id,
            @PathVariable Long courseId) {
        userService.enrollCourse(id, courseId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đăng ký khóa học thành công");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<Map<String, Object>> getUserPayments(@PathVariable Long id) {
        java.util.List<com.example.elearning.dto.response.user_activity.UserPaymentDto> data = userService.getUserPayments(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/online")
    public ResponseEntity<Map<String, Object>> getOnlineUsers() {
        java.util.List<Long> onlineUsers = onlineUserManager.getOnlineUsers();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách online thành công");
        response.put("data", onlineUsers);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}/student-dashboard")
    public ResponseEntity<Map<String, Object>> getStudentDashboard(@PathVariable Long id) {
        com.example.elearning.dto.response.StudentDashboardResponseDto data = userService.getStudentDashboard(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}/courses/{courseId}/learning-data")
    public ResponseEntity<Map<String, Object>> getLearningData(
            @PathVariable Long id, 
            @PathVariable Long courseId) {
        java.util.Map<String, Object> data = userService.getLearningData(id, courseId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/{id}/lessons/{lessonId}/complete")
    public ResponseEntity<Map<String, Object>> completeLesson(
            @PathVariable Long id, 
            @PathVariable Long lessonId) {
        userService.markLessonCompleted(id, lessonId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã đánh dấu hoàn thành bài học");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
