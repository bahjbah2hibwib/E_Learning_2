package com.example.elearning.service.impl;

import com.example.elearning.dto.request.AdminUserCreateRequestDto;
import com.example.elearning.dto.request.AdminUserUpdateRequestDto;
import com.example.elearning.dto.response.AdminUserCreateResponseDto;
import com.example.elearning.dto.response.PageResponseDto;
import com.example.elearning.dto.response.UserItemResponseDto;
import com.example.elearning.dto.response.UserDetailResponseDto;
import com.example.elearning.dto.response.UserStatsResponseDto;
import com.example.elearning.exception.AccessDeniedException;
import com.example.elearning.exception.ResourceNotFoundException;
import com.example.elearning.exception.UserNotFoundException;
import com.example.elearning.exception.UserAlreadyExistsException;
import com.example.elearning.mapper.UserMapper;
import com.example.elearning.model.FileEntity;
import com.example.elearning.model.User;
import com.example.elearning.model.enums.UserRole;
import com.example.elearning.repository.FileRepository;
import com.example.elearning.repository.UserRepository;
import com.example.elearning.service.MinioService;
import com.example.elearning.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final FileRepository fileRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final MinioService minioService;

    private final com.example.elearning.repository.EnrollmentRepository enrollmentRepository;
    private final com.example.elearning.repository.PaymentRepository paymentRepository;
    private final com.example.elearning.repository.LessonRepository lessonRepository;
    private final com.example.elearning.repository.LessonProgressRepository lessonProgressRepository;
    private final com.example.elearning.repository.CourseRepository courseRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private com.example.elearning.service.CourseService courseService;

    @Override
    public PageResponseDto<UserItemResponseDto> getAllUsers(int page, int size, String keyword, String roleStr, Boolean status, String currentRole) {
        
        // Step 1: Kiểm tra quyền (Chỉ ADMIN hoặc SUPER_ADMIN mới được xem)
        boolean isAdmin = "ROLE_ADMIN".equals(currentRole);
        boolean isSuperAdmin = "ROLE_SUPER_ADMIN".equals(currentRole);
        
        if (!isAdmin && !isSuperAdmin) {
            throw new AccessDeniedException(
                    "Bạn không có quyền thực hiện thao tác này. Chỉ Admin mới được phép xem danh sách người dùng.",
                    "FORBIDDEN_ACCESS"
            );
        }

        // Tạo đối tượng Pageable (trang bắt đầu từ 0)
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));

        // Chuẩn bị Role enum nếu có lọc theo role
        UserRole roleEnum = null;
        if (roleStr != null && !roleStr.trim().isEmpty()) {
            try {
                roleEnum = UserRole.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                // Nếu FE truyền sai role thì bỏ qua lọc
            }
        }

        // Xử lý keyword: nếu chuỗi rỗng thì cho thành null để SQL dễ bắt
        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        // Step 2: Tìm kiếm & Phân trang trong DB
        Page<User> userPage = userRepository.searchUsers(searchKeyword, roleEnum, status, pageable);

        // Step 3: Mapping kết quả sang DTO
        List<UserItemResponseDto> content = userPage.getContent().stream()
                .map(user -> {
                    UserItemResponseDto dto = userMapper.toUserItemResponseDto(user);
                    if (user.getAvatarFile() != null) {
                        try {
                            String url = minioService.getPreSignedUrl(user.getAvatarFile().getFilePath());
                            dto.setAvatarUrl(url);
                        } catch (Exception e) {
                            // Bỏ qua nếu lỗi lấy URL (có thể log lại)
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        // Bọc vào PageResponseDto
        return PageResponseDto.<UserItemResponseDto>builder()
                .content(content)
                .pageNo(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public AdminUserCreateResponseDto createUserByAdmin(AdminUserCreateRequestDto requestDto, String currentRole) {
        // Step 1: Kiểm tra quyền
        boolean isAdmin = "ROLE_ADMIN".equals(currentRole);
        boolean isSuperAdmin = "ROLE_SUPER_ADMIN".equals(currentRole);

        if (!isAdmin && !isSuperAdmin) {
            throw new AccessDeniedException(
                    "Chỉ Admin mới có quyền tạo người dùng.",
                    "FORBIDDEN_ACCESS"
            );
        }

        // Nếu người đang thao tác là ADMIN, nhưng lại muốn tạo ADMIN hoặc SUPER_ADMIN -> Chặn!
        if (isAdmin && (requestDto.getRole().equals("ROLE_ADMIN") || requestDto.getRole().equals("ROLE_SUPER_ADMIN"))) {
            throw new AccessDeniedException(
                    "Bạn không có quyền tạo tài khoản Quản trị viên!", 
                    "FORBIDDEN_ACCESS"
            );
        }

        // Step 2: Validate trùng lặp
        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new UserAlreadyExistsException("Email đã tồn tại trên hệ thống.", "USER_ALREADY_EXISTS");
        }
        if (requestDto.getPhone() != null && userRepository.existsByPhone(requestDto.getPhone())) {
            throw new UserAlreadyExistsException("Số điện thoại đã tồn tại trên hệ thống.", "USER_ALREADY_EXISTS");
        }

        // Kiểm tra file ảnh đại diện nếu có
        FileEntity avatarFile = null;
        if (requestDto.getAvatarFileId() != null) {
            avatarFile = fileRepository.findById(requestDto.getAvatarFileId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy file ảnh với ID: " + requestDto.getAvatarFileId(),
                            "FILE_NOT_FOUND"
                    ));
        }

        // Step 3: Map từ DTO sang Entity
        User newUser = userMapper.toEntity(requestDto);
        newUser.setPasswordHash(passwordEncoder.encode(requestDto.getPassword()));
        
        if (requestDto.getStatus() == null) {
            newUser.setStatus(true); // Mặc định là Hoạt động
        }
        
        if (avatarFile != null) {
            newUser.setAvatarFile(avatarFile);
        }

        // Step 4: Lưu xuống DB
        User savedUser = userRepository.save(newUser);

        // Step 5: Trả về kết quả
        return userMapper.toAdminUserCreateResponseDto(savedUser);
    }

    @Override
    public UserDetailResponseDto getUserDetails(Long id, String currentRole, Long currentUserId) {
        // Step 1: Kiểm tra quyền
        // Chỉ ADMIN, SUPER_ADMIN hoặc chính User đó mới được quyền xem chi tiết
        boolean isAdmin = "ROLE_ADMIN".equals(currentRole);
        boolean isSuperAdmin = "ROLE_SUPER_ADMIN".equals(currentRole);
        
        if (!isAdmin && !isSuperAdmin && !id.equals(currentUserId)) {
            throw new AccessDeniedException(
                    "Bạn không có quyền xem thông tin của người dùng này.",
                    "FORBIDDEN_ACCESS"
            );
        }

        // Step 2: Tìm kiếm User trong DB
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(
                        "Không tìm thấy người dùng với ID đã cung cấp. Vui lòng kiểm tra lại.",
                        "USER_NOT_FOUND"
                ));

        // Step 3: Mapping sang DTO
        UserDetailResponseDto responseDto = userMapper.toUserDetailResponseDto(user);

        // Tạo Pre-signed URL cho avatar (nếu có)
        if (user.getAvatarFile() != null) {
            try {
                String avatarUrl = minioService.getPreSignedUrl(user.getAvatarFile().getFilePath());
                responseDto.setAvatarUrl(avatarUrl);
            } catch (Exception e) {
                // Bỏ qua nếu lỗi lấy URL
            }
        }

        return responseDto;
    }

    @Override
    @Transactional
    public UserDetailResponseDto updateUserByAdmin(Long id, AdminUserUpdateRequestDto requestDto, String currentRole) {
        // Bước 1: Kiểm tra quyền
        boolean isAdmin = "ROLE_ADMIN".equals(currentRole);
        boolean isSuperAdmin = "ROLE_SUPER_ADMIN".equals(currentRole);
        
        if (!isAdmin && !isSuperAdmin) {
            throw new AccessDeniedException(
                    "Chỉ Quản trị viên mới có quyền cập nhật thông tin người dùng.",
                    "FORBIDDEN_ACCESS"
            );
        }

        // Bước 2: Kiểm tra User tồn tại
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(
                        "Không tìm thấy người dùng với ID: " + id,
                        "USER_NOT_FOUND"
                ));

        // Quy tắc Super Admin: Cấm ADMIN sửa thông tin hoặc khóa ADMIN khác/SUPER_ADMIN
        if (isAdmin && (user.getRole().name().equals("ROLE_ADMIN") || user.getRole().name().equals("ROLE_SUPER_ADMIN"))) {
            throw new AccessDeniedException(
                    "Bạn không có quyền thay đổi thông tin hoặc khóa tài khoản của Quản trị viên khác!", 
                    "FORBIDDEN_ACCESS"
            );
        }

        // Quy tắc Super Admin: Cấm ADMIN nâng cấp user thành ADMIN hoặc SUPER_ADMIN
        if (isAdmin && requestDto.getRole() != null && 
           (requestDto.getRole().equals("ROLE_ADMIN") || requestDto.getRole().equals("ROLE_SUPER_ADMIN"))) {
            throw new AccessDeniedException(
                    "Bạn không có quyền thăng cấp tài khoản thành Quản trị viên!", 
                    "FORBIDDEN_ACCESS"
            );
        }

        // Bước 3: Kiểm tra trùng lặp dữ liệu (loại trừ chính user này)
        if (userRepository.existsByEmailAndUserIdNot(requestDto.getEmail(), id)) {
            throw new UserAlreadyExistsException("Email này đã được sử dụng bởi một người dùng khác.", "USER_ALREADY_EXISTS");
        }

        if (requestDto.getPhone() != null && !requestDto.getPhone().trim().isEmpty()) {
            if (userRepository.existsByPhoneAndUserIdNot(requestDto.getPhone(), id)) {
                throw new UserAlreadyExistsException("Số điện thoại này đã được sử dụng bởi một người dùng khác.", "USER_ALREADY_EXISTS");
            }
        }

        // Bước 4: Cập nhật dữ liệu từ DTO sang Entity
        userMapper.updateUserFromAdminDto(requestDto, user);

        // Xử lý avatar nếu có thay đổi
        if (requestDto.getAvatarFileId() != null) {
            FileEntity avatarFile = fileRepository.findById(requestDto.getAvatarFileId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy file ảnh đại diện", "RESOURCE_NOT_FOUND"));
            user.setAvatarFile(avatarFile);
        }

        // Xử lý mật khẩu nếu có truyền lên
        if (requestDto.getPassword() != null && !requestDto.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(requestDto.getPassword()));
        }

        // Bước 5: Lưu xuống DB
        userRepository.save(user);

        // Bước 6: Đóng gói Response
        UserDetailResponseDto responseDto = userMapper.toUserDetailResponseDto(user);
        
        if (user.getAvatarFile() != null) {
            try {
                String avatarUrl = minioService.getPreSignedUrl(user.getAvatarFile().getFilePath());
                responseDto.setAvatarUrl(avatarUrl);
            } catch (Exception e) {
                // Bỏ qua nếu lỗi
            }
        }

        return responseDto;
    }

    @Override
    public UserStatsResponseDto getUserStats(String currentRole) {
        // Kiểm tra quyền
        boolean isAdmin = "ROLE_ADMIN".equals(currentRole);
        boolean isSuperAdmin = "ROLE_SUPER_ADMIN".equals(currentRole);
        
        if (!isAdmin && !isSuperAdmin) {
            throw new AccessDeniedException(
                    "Chỉ Quản trị viên mới có quyền xem thống kê.",
                    "FORBIDDEN_ACCESS"
            );
        }

        long total = userRepository.count();
        long activeStudents = userRepository.countByRoleAndStatus(UserRole.ROLE_STUDENT, true);
        long totalInstructors = userRepository.countByRole(UserRole.ROLE_INSTRUCTOR);
        // Thống kê đăng ký mới trong vòng 30 ngày qua
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long newUsers = userRepository.countByCreatedAtAfter(thirtyDaysAgo);

        return UserStatsResponseDto.builder()
                .total(total)
                .activeStudents(activeStudents)
                .totalInstructors(totalInstructors)
                .newUsers(newUsers)
                .build();
    }

    @Override
    public List<com.example.elearning.dto.response.user_activity.UserCourseDto> getUserCourses(Long userId) {
        // Kiểm tra user có tồn tại không
        userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng", "USER_NOT_FOUND"));
        
        List<com.example.elearning.model.Enrollment> enrollments = enrollmentRepository.findByStudent_UserId(userId);
        
        return enrollments.stream().map(e -> com.example.elearning.dto.response.user_activity.UserCourseDto.builder()
                .courseId(e.getCourse().getCourseId())
                .courseName(e.getCourse().getTitle())
                .status(e.getStatus() != null ? e.getStatus().name() : null)
                .enrollDate(e.getEnrollDate() != null ? e.getEnrollDate().toString() : "")
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void enrollCourse(Long studentId, Long courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy học viên", "USER_NOT_FOUND"));
        
        com.example.elearning.model.Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
                
        if (enrollmentRepository.existsByStudent_UserIdAndCourse_CourseId(studentId, courseId)) {
            throw new RuntimeException("Bạn đã đăng ký khóa học này rồi");
        }
        
        com.example.elearning.model.Enrollment enrollment = com.example.elearning.model.Enrollment.builder()
                .student(student)
                .course(course)
                .status(com.example.elearning.model.enums.EnrollmentStatus.ACTIVE)
                .enrollDate(java.time.LocalDateTime.now())
                .build();
        
        enrollmentRepository.save(enrollment);
    }

    @Override
    public List<com.example.elearning.dto.response.user_activity.UserPaymentDto> getUserPayments(Long userId) {
        userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng", "USER_NOT_FOUND"));
        
        List<com.example.elearning.model.Payment> payments = paymentRepository.findByStudent_UserId(userId);
        
        return payments.stream().map(p -> com.example.elearning.dto.response.user_activity.UserPaymentDto.builder()
                .paymentId(p.getPaymentId())
                .transactionId(p.getTransactionCode())
                .amount(p.getAmount())
                .status(p.getPaymentStatus() != null ? p.getPaymentStatus().name() : null)
                .paymentDate(p.getPaidAt() != null ? p.getPaidAt().toString() : (p.getCreatedAt() != null ? p.getCreatedAt().toString() : ""))
                .build()
        ).collect(Collectors.toList());
    }

    public com.example.elearning.dto.response.StudentDashboardResponseDto getStudentDashboard(Long studentId) {
        userRepository.findById(studentId).orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng", "USER_NOT_FOUND"));

        List<com.example.elearning.model.Enrollment> enrollments = enrollmentRepository.findByStudent_UserId(studentId);
        
        int totalEnrolled = enrollments.size();
        long totalCompletedLessons = lessonProgressRepository.countCompletedLessonsByUser(studentId);

        List<com.example.elearning.dto.response.StudentDashboardResponseDto.MyCourseDto> myCourses = enrollments.stream().map(e -> {
            String thumbUrl = e.getCourse().getThumbnailFile() != null ? 
                    minioService.getPreSignedUrl(e.getCourse().getThumbnailFile().getFilePath()) : null;
                    
            long totalLessonsInCourse = lessonRepository.countByCourseId(e.getCourse().getCourseId());
            long completedLessons = lessonProgressRepository.countCompletedLessonsByUserAndCourse(studentId, e.getCourse().getCourseId());
            int progress = totalLessonsInCourse > 0 ? (int) ((completedLessons * 100) / totalLessonsInCourse) : 0;

            return com.example.elearning.dto.response.StudentDashboardResponseDto.MyCourseDto.builder()
                    .courseId(e.getCourse().getCourseId())
                    .courseName(e.getCourse().getTitle())
                    .categoryName(e.getCourse().getCategory() != null ? e.getCourse().getCategory().getCategoryName() : "Khác")
                    .thumbnailUrl(thumbUrl)
                    .progressPercentage(progress)
                    .build();
        }).collect(Collectors.toList());

        com.example.elearning.dto.response.StudentDashboardResponseDto.LearningCourseDto learningCourse = null;
        if (!myCourses.isEmpty()) {
            // Pick course with highest progress but not 100%, else pick the first one
            com.example.elearning.dto.response.StudentDashboardResponseDto.MyCourseDto selectedCourse = myCourses.stream()
                    .filter(c -> c.getProgressPercentage() < 100)
                    .max(java.util.Comparator.comparingInt(com.example.elearning.dto.response.StudentDashboardResponseDto.MyCourseDto::getProgressPercentage))
                    .orElse(myCourses.get(0));

            learningCourse = com.example.elearning.dto.response.StudentDashboardResponseDto.LearningCourseDto.builder()
                    .courseId(selectedCourse.getCourseId())
                    .courseName(selectedCourse.getCourseName())
                    .categoryName(selectedCourse.getCategoryName())
                    .thumbnailUrl(selectedCourse.getThumbnailUrl())
                    .currentChapter("Tiếp tục học") // Placeholder cho current chapter
                    .progressPercentage(selectedCourse.getProgressPercentage())
                    .build();
        }

        return com.example.elearning.dto.response.StudentDashboardResponseDto.builder()
                .learningCourse(learningCourse)
                .totalEnrolled(totalEnrolled)
                .totalCompletedLessons((int) totalCompletedLessons)
                .myCourses(myCourses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getLearningData(Long userId, Long courseId) {
        userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng", "USER_NOT_FOUND"));
        
        // Verify enrollment
        com.example.elearning.model.Enrollment enrollment = enrollmentRepository.findByStudent_UserIdAndCourse_CourseId(userId, courseId)
                .orElseThrow(() -> new com.example.elearning.exception.AccessDeniedException("Bạn chưa đăng ký khóa học này", "NOT_ENROLLED"));

        // Get Course Curriculum
        com.example.elearning.dto.response.CourseAdminDetailResponseDto courseDetail = courseService.getPublicCourseDetail(courseId);

        // Get completed lessons
        java.util.List<com.example.elearning.model.LessonProgress> progressList = lessonProgressRepository.findByStudent_UserIdAndLesson_Section_Course_CourseId(userId, courseId);
        
        java.util.List<Long> completedLessonIds = progressList.stream()
                .filter(com.example.elearning.model.LessonProgress::getIsCompleted)
                .map(lp -> lp.getLesson().getLessonId())
                .collect(Collectors.toList());

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("course", courseDetail);
        result.put("completedLessonIds", completedLessonIds);

        return result;
    }

    @Override
    @Transactional
    public void markLessonCompleted(Long userId, Long lessonId) {
        userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng", "USER_NOT_FOUND"));
        com.example.elearning.model.Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new com.example.elearning.exception.ResourceNotFoundException("Không tìm thấy bài học", "LESSON_NOT_FOUND"));

        // Verify enrollment
        Long courseId = lesson.getSection().getCourse().getCourseId();
        enrollmentRepository.findByStudent_UserIdAndCourse_CourseId(userId, courseId)
                .orElseThrow(() -> new com.example.elearning.exception.AccessDeniedException("Bạn chưa đăng ký khóa học này", "NOT_ENROLLED"));

        com.example.elearning.model.LessonProgress progress = lessonProgressRepository.findByStudent_UserIdAndLesson_LessonId(userId, lessonId)
                .orElseGet(() -> {
                    com.example.elearning.model.LessonProgress newProgress = new com.example.elearning.model.LessonProgress();
                    newProgress.setStudent(userRepository.findById(userId).get());
                    newProgress.setLesson(lesson);
                    newProgress.setIsCompleted(false);
                    return newProgress;
                });

        if (!progress.getIsCompleted()) {
            progress.setIsCompleted(true);
            progress.setCompletedAt(java.time.LocalDateTime.now());
            lessonProgressRepository.save(progress);
        }
    }
}
