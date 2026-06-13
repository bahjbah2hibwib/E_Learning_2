package com.example.elearning.service.impl;

import com.example.elearning.dto.request.CourseStatusUpdateRequestDto;
import com.example.elearning.dto.response.CourseAdminItemDto;
import com.example.elearning.dto.response.CourseAdminDetailResponseDto;
import com.example.elearning.dto.response.CourseDetailResponseDto;
import com.example.elearning.dto.response.PageResponseDto;
import com.example.elearning.exception.AccessDeniedException;
import com.example.elearning.exception.CourseNotFoundException;
import com.example.elearning.mapper.CourseMapper;
import com.example.elearning.model.Course;
import com.example.elearning.model.Lesson;
import com.example.elearning.model.enums.CourseStatus;
import com.example.elearning.repository.CourseRepository;
import com.example.elearning.repository.EnrollmentRepository;
import com.example.elearning.repository.LessonRepository;
import com.example.elearning.repository.VideoRepository;
import com.example.elearning.repository.ReadingMaterialRepository;
import com.example.elearning.repository.QuizRepository;
import com.example.elearning.repository.QuestionRepository;
import com.example.elearning.repository.AnswerRepository;
import com.example.elearning.model.Video;
import com.example.elearning.model.ReadingMaterial;
import com.example.elearning.model.Quiz;
import com.example.elearning.model.Question;
import com.example.elearning.model.Answer;
import com.example.elearning.repository.PaymentRepository;
import com.example.elearning.service.CourseService;
import com.example.elearning.service.MinioService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final VideoRepository videoRepository;
    private final ReadingMaterialRepository readingMaterialRepository;
    private final com.example.elearning.repository.QuizRepository quizRepository;
    private final com.example.elearning.repository.QuestionRepository questionRepository;
    private final com.example.elearning.repository.AnswerRepository answerRepository;
    private final PaymentRepository paymentRepository;
    private final CourseMapper courseMapper;
    private final MinioService minioService;
    private final com.example.elearning.repository.UserRepository userRepository;
    private final com.example.elearning.repository.CategoryRepository categoryRepository;
    private final com.example.elearning.repository.FileEntityRepository fileEntityRepository;
    private final com.example.elearning.repository.NotificationRepository notificationRepository;
    private final com.example.elearning.repository.SystemActivityRepository systemActivityRepository;
    private final com.example.elearning.repository.SectionRepository sectionRepository;
    private final com.example.elearning.repository.LessonAssetRepository lessonAssetRepository;

    @Override
    public PageResponseDto<CourseAdminItemDto> getAdminCourses(int page, int size, String status, String keyword, String currentRole) {
        // Bước 1: Kiểm tra quyền
        boolean isAdmin = "ROLE_ADMIN".equals(currentRole);
        boolean isSuperAdmin = "ROLE_SUPER_ADMIN".equals(currentRole);
        if (!isAdmin && !isSuperAdmin) {
            throw new AccessDeniedException(
                    "Chỉ Quản trị viên mới có quyền xem toàn bộ danh sách khóa học.",
                    "FORBIDDEN_ACCESS"
            );
        }

        // Bước 2: Chuẩn bị phân trang và bộ lọc
        Pageable pageable = PageRequest.of(page, size);

        CourseStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                statusEnum = CourseStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Bỏ qua lọc theo status nếu giá trị không hợp lệ
            }
        }

        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        // Bước 3: Tìm kiếm trong DB
        Page<Course> coursePage = courseRepository.searchAdminCourses(null, statusEnum, searchKeyword, pageable);

        // Bước 4: Ánh xạ kết quả sang DTO
        List<CourseAdminItemDto> content = coursePage.getContent().stream()
                .map(course -> {
                    CourseAdminItemDto dto = courseMapper.toCourseAdminItemDto(course);
                    
                    // Set status string explicitly if mapping is raw
                    dto.setStatus(course.getStatus() != null ? course.getStatus().name() : null);

                    // Lấy số lượng học viên đăng ký
                    long totalStudents = enrollmentRepository.countByCourse_CourseId(course.getCourseId());
                    dto.setTotalStudents(totalStudents);

                    // Lấy số lượng người đã trả tiền và doanh thu
                    long paidStudents = paymentRepository.countPaidStudentsByCourse(course.getCourseId());
                    dto.setPaidStudents(paidStudents);
                    java.math.BigDecimal rev = paymentRepository.calculateTotalRevenueByCourse(course.getCourseId());
                    dto.setTotalRevenue(rev != null ? rev : java.math.BigDecimal.ZERO);

                    // Lấy URL ảnh thumbnail từ MinIO
                    if (course.getThumbnailFile() != null) {
                        try {
                            String url = minioService.getPreSignedUrl(course.getThumbnailFile().getFilePath());
                            dto.setThumbnailUrl(url);
                        } catch (Exception e) {
                            // Nếu lỗi (vd file ko tồn tại trên minio) thì bỏ qua, trả về null
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        // Bọc vào PageResponseDto
        return PageResponseDto.<CourseAdminItemDto>builder()
                .content(content)
                .pageNo(coursePage.getNumber())
                .pageSize(coursePage.getSize())
                .totalElements(coursePage.getTotalElements())
                .totalPages(coursePage.getTotalPages())
                .last(coursePage.isLast())
                .build();
    }

    @Override
    public PageResponseDto<CourseAdminItemDto> getPublicCourses(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<Course> coursePage = courseRepository.searchAdminCourses(null, CourseStatus.APPROVED, searchKeyword, pageable);

        List<CourseAdminItemDto> content = coursePage.getContent().stream()
                .map(course -> {
                    CourseAdminItemDto dto = courseMapper.toCourseAdminItemDto(course);
                    dto.setStatus(course.getStatus() != null ? course.getStatus().name() : null);

                    long totalStudents = enrollmentRepository.countByCourse_CourseId(course.getCourseId());
                    dto.setTotalStudents(totalStudents);

                    dto.setPaidStudents(0L);
                    dto.setTotalRevenue(java.math.BigDecimal.ZERO);

                    if (course.getThumbnailFile() != null) {
                        try {
                            String url = minioService.getPreSignedUrl(course.getThumbnailFile().getFilePath());
                            dto.setThumbnailUrl(url);
                        } catch (Exception e) {
                            dto.setThumbnailUrl(null);
                        }
                    } else {
                        dto.setThumbnailUrl(null);
                    }

                    if (course.getInstructor() != null) {
                        dto.setInstructorName(course.getInstructor().getFullName());
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        return PageResponseDto.<CourseAdminItemDto>builder()
                .content(content)
                .pageNo(coursePage.getNumber())
                .pageSize(coursePage.getSize())
                .totalElements(coursePage.getTotalElements())
                .totalPages(coursePage.getTotalPages())
                .last(coursePage.isLast())
                .build();
    }

    @Override
    public CourseDetailResponseDto updateCourseStatus(Long courseId, CourseStatusUpdateRequestDto request, String currentRole) {
        // Step 1: Kiểm tra xác thực
        boolean isAdmin = "ROLE_ADMIN".equals(currentRole);
        boolean isSuperAdmin = "ROLE_SUPER_ADMIN".equals(currentRole);
        if (!isAdmin && !isSuperAdmin) {
            throw new AccessDeniedException(
                    "Bạn không có quyền thực hiện hành động này",
                    "FORBIDDEN_ACCESS"
            );
        }

        // Step 2: Tìm khóa học
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException(
                        "Không tìm thấy khóa học trên hệ thống. Dữ liệu có thể đã bị xóa.",
                        "COURSE_NOT_FOUND"
                ));

        // Step 3: Cập nhật trạng thái
        course.setStatus(CourseStatus.valueOf(request.getStatus()));
        // updatedAt tự động được set bằng @PreUpdate trong BaseEntity

        // Step 4: Lưu xuống DB
        Course updatedCourse = courseRepository.save(course);

        // Step 5: Mapping trả về
        return courseMapper.toCourseDetailResponseDto(updatedCourse);
    }

    @Override
    public CourseAdminDetailResponseDto getPublicCourseDetail(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException(
                        "Khóa học không tồn tại hoặc đã bị xóa khỏi hệ thống.",
                        "COURSE_NOT_FOUND"
                ));

        if (course.getStatus() != CourseStatus.APPROVED) {
            throw new AccessDeniedException(
                    "Khóa học này chưa được công khai",
                    "COURSE_NOT_APPROVED"
            );
        }

        List<com.example.elearning.model.Section> sections = sectionRepository.findByCourse_CourseIdOrderBySectionOrderAsc(courseId);
        CourseAdminDetailResponseDto responseDto = courseMapper.toCourseAdminDetailResponseDto(course, sections);

        if (responseDto.getSections() != null) {
            for (CourseAdminDetailResponseDto.SectionDto sectionDto : responseDto.getSections()) {
                if (sectionDto.getLessons() != null) {
                    for (CourseAdminDetailResponseDto.LessonDto lessonDto : sectionDto.getLessons()) {
                        Long lessonId = lessonDto.getLessonId();

                        // Videos
                        List<Video> videos = videoRepository.findByLesson_LessonId(lessonId);
                        lessonDto.setVideoCount(videos.size());
                        lessonDto.setVideos(videos.stream().map(v -> CourseAdminDetailResponseDto.VideoDto.builder()
                                .videoId(v.getVideoId())
                                .title(v.getVideoFile() != null ? v.getVideoFile().getFileName() : "Video bài giảng")
                                .videoUrl(v.getVideoFile() != null ? minioService.getPreSignedUrl(v.getVideoFile().getFilePath()) : null)
                                .durationMinutes(v.getDuration() != null ? v.getDuration() : 0)
                                .build()).collect(Collectors.toList()));
                        
                        int totalDuration = videos.stream().mapToInt(v -> v.getDuration() != null ? v.getDuration() : 0).sum();
                        lessonDto.setDurationMinutes(totalDuration);

                        // Documents
                        List<com.example.elearning.model.LessonAsset> materials = lessonAssetRepository.findByLesson_LessonId(lessonId);
                        lessonDto.setDocumentCount(materials.size());
                        lessonDto.setDocuments(materials.stream().map(m -> CourseAdminDetailResponseDto.DocumentDto.builder()
                                .documentId(m.getAssetId())
                                .title(m.getFile() != null ? m.getFile().getFileName() : "Tài liệu đính kèm")
                                .fileUrl(m.getFile() != null ? minioService.getPreSignedUrl(m.getFile().getFilePath()) : null)
                                .fileName(m.getFile() != null ? m.getFile().getFileName() : null)
                                .build()).collect(Collectors.toList()));

                        // Quizzes
                        List<Quiz> quizzes = quizRepository.findByLesson_LessonId(lessonId);
                        lessonDto.setQuizCount(quizzes.size());
                        lessonDto.setQuizzes(quizzes.stream().map(q -> {
                            List<Question> questions = questionRepository.findByQuiz_QuizId(q.getQuizId());
                            return CourseAdminDetailResponseDto.QuizDto.builder()
                                    .quizId(q.getQuizId())
                                    .title(q.getTitle())
                                    .questions(questions.stream().map(question -> {
                                        List<Answer> answers = answerRepository.findByQuestion_QuestionId(question.getQuestionId());
                                        return CourseAdminDetailResponseDto.QuestionDto.builder()
                                                .questionId(question.getQuestionId())
                                                .questionText(question.getQuestionText())
                                                .answers(answers.stream().map(a -> CourseAdminDetailResponseDto.AnswerDto.builder()
                                                        .answerId(a.getAnswerId())
                                                        .answerText(a.getAnswerText())
                                                        .isCorrect(a.getIsCorrect())
                                                        .build()).collect(Collectors.toList()))
                                                .build();
                                    }).collect(Collectors.toList()))
                                    .build();
                        }).collect(Collectors.toList()));
                    }
                }
            }
        }

        if (course.getThumbnailFile() != null) {
            try {
                String url = minioService.getPreSignedUrl(course.getThumbnailFile().getFilePath());
                responseDto.setThumbnailUrl(url);
            } catch (Exception e) {
            }
        }
        
        long totalStudents = enrollmentRepository.countByCourse_CourseId(courseId);
        responseDto.setTotalStudents(totalStudents);

        if (course.getInstructor() != null) {
            responseDto.setInstructorName(course.getInstructor().getFullName());
        }

        return responseDto;
    }

    @Override
    public CourseAdminDetailResponseDto getCourseDetail(Long courseId, String currentRole, Long currentUserId) {
        // Lấy khóa học
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException(
                        "Khóa học không tồn tại hoặc đã bị xóa khỏi hệ thống.",
                        "COURSE_NOT_FOUND"
                ));

        // Kiểm tra quyền: Phải là Admin hoặc là Giảng viên tạo ra khóa học này
        boolean isAdmin = "ROLE_ADMIN".equals(currentRole);
        boolean isSuperAdmin = "ROLE_SUPER_ADMIN".equals(currentRole);
        boolean isOwner = course.getInstructor().getUserId().equals(currentUserId);
        
        if (!isAdmin && !isSuperAdmin && !isOwner) {
            throw new AccessDeniedException(
                    "Bạn không có quyền xem chi tiết khóa học này",
                    "FORBIDDEN_ACCESS"
            );
        }

        // Lấy danh sách chương học
        List<com.example.elearning.model.Section> sections = sectionRepository.findByCourse_CourseIdOrderBySectionOrderAsc(courseId);

        // Ánh xạ sang DTO
        CourseAdminDetailResponseDto responseDto = courseMapper.toCourseAdminDetailResponseDto(course, sections);

        // Map extra data manually for each lesson in each section
        if (responseDto.getSections() != null) {
            for (CourseAdminDetailResponseDto.SectionDto sectionDto : responseDto.getSections()) {
                if (sectionDto.getLessons() != null) {
                    for (CourseAdminDetailResponseDto.LessonDto lessonDto : sectionDto.getLessons()) {
                        Long lessonId = lessonDto.getLessonId();

                        // Videos
                        List<Video> videos = videoRepository.findByLesson_LessonId(lessonId);
                        lessonDto.setVideoCount(videos.size());
                        lessonDto.setVideos(videos.stream().map(v -> CourseAdminDetailResponseDto.VideoDto.builder()
                                .videoId(v.getVideoId())
                                .title(v.getVideoFile() != null ? v.getVideoFile().getFileName() : "Video bài giảng")
                                .videoUrl(v.getVideoFile() != null ? minioService.getPreSignedUrl(v.getVideoFile().getFilePath()) : null)
                                .durationMinutes(v.getDuration() != null ? v.getDuration() : 0)
                                .build()).collect(Collectors.toList()));
                        
                        // Set total lesson duration
                        int totalDuration = videos.stream().mapToInt(v -> v.getDuration() != null ? v.getDuration() : 0).sum();
                        lessonDto.setDurationMinutes(totalDuration);

                        // Documents / Reading Materials
                        List<com.example.elearning.model.LessonAsset> materials = lessonAssetRepository.findByLesson_LessonId(lessonId);
                        lessonDto.setDocumentCount(materials.size());
                        lessonDto.setDocuments(materials.stream().map(m -> CourseAdminDetailResponseDto.DocumentDto.builder()
                                .documentId(m.getAssetId())
                                .title(m.getFile() != null ? m.getFile().getFileName() : "Tài liệu đính kèm")
                                .fileUrl(m.getFile() != null ? minioService.getPreSignedUrl(m.getFile().getFilePath()) : null)
                                .fileName(m.getFile() != null ? m.getFile().getFileName() : null)
                                .build()).collect(Collectors.toList()));

                        // Quizzes
                        List<Quiz> quizzes = quizRepository.findByLesson_LessonId(lessonId);
                        lessonDto.setQuizCount(quizzes.size());
                        lessonDto.setQuizzes(quizzes.stream().map(q -> {
                            List<Question> questions = questionRepository.findByQuiz_QuizId(q.getQuizId());
                            return CourseAdminDetailResponseDto.QuizDto.builder()
                                    .quizId(q.getQuizId())
                                    .title(q.getTitle())
                                    .questions(questions.stream().map(question -> {
                                        List<Answer> answers = answerRepository.findByQuestion_QuestionId(question.getQuestionId());
                                        return CourseAdminDetailResponseDto.QuestionDto.builder()
                                                .questionId(question.getQuestionId())
                                                .questionText(question.getQuestionText())
                                                .answers(answers.stream().map(a -> CourseAdminDetailResponseDto.AnswerDto.builder()
                                                        .answerId(a.getAnswerId())
                                                        .answerText(a.getAnswerText())
                                                        .isCorrect(a.getIsCorrect())
                                                        .build()).collect(Collectors.toList()))
                                                .build();
                                    }).collect(Collectors.toList()))
                                    .build();
                        }).collect(Collectors.toList()));
                        // Xóa phần mock duration để giữ giá trị được tính toán từ các video
                    }
                }
            }
        }

        // Lấy URL ảnh thumbnail từ MinIO
        if (course.getThumbnailFile() != null) {
            try {
                String url = minioService.getPreSignedUrl(course.getThumbnailFile().getFilePath());
                responseDto.setThumbnailUrl(url);
            } catch (Exception e) {
                // Bỏ qua lỗi Minio
            }
        }

        return responseDto;
    }

    @Override
    public PageResponseDto<CourseAdminItemDto> getInstructorCourses(Long instructorId, int page, int size, String status, String keyword) {
        Pageable pageable = PageRequest.of(page, size);

        CourseStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                statusEnum = CourseStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
            }
        }

        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<Course> coursePage = courseRepository.searchAdminCourses(instructorId, statusEnum, searchKeyword, pageable);

        List<CourseAdminItemDto> content = coursePage.getContent().stream()
                .map(course -> {
                    CourseAdminItemDto dto = courseMapper.toCourseAdminItemDto(course);
                    dto.setStatus(course.getStatus() != null ? course.getStatus().name() : null);

                    long totalStudents = enrollmentRepository.countByCourse_CourseId(course.getCourseId());
                    dto.setTotalStudents(totalStudents);

                    long paidStudents = paymentRepository.countPaidStudentsByCourse(course.getCourseId());
                    dto.setPaidStudents(paidStudents);
                    java.math.BigDecimal rev = paymentRepository.calculateTotalRevenueByCourse(course.getCourseId());
                    dto.setTotalRevenue(rev != null ? rev : java.math.BigDecimal.ZERO);

                    if (course.getThumbnailFile() != null) {
                        try {
                            String url = minioService.getPreSignedUrl(course.getThumbnailFile().getFilePath());
                            dto.setThumbnailUrl(url);
                        } catch (Exception e) {}
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        return PageResponseDto.<CourseAdminItemDto>builder()
                .content(content)
                .pageNo(coursePage.getNumber())
                .pageSize(coursePage.getSize())
                .totalElements(coursePage.getTotalElements())
                .totalPages(coursePage.getTotalPages())
                .last(coursePage.isLast())
                .build();
    }

    @Override
    @Transactional
    public CourseDetailResponseDto createCourse(com.example.elearning.dto.request.CourseCreateRequestDto request, Long instructorId) {
        com.example.elearning.model.User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new com.example.elearning.exception.ResourceNotFoundException("Không tìm thấy Instructor", "INSTRUCTOR_NOT_FOUND"));

        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setWhatYouWillLearn(request.getWhatYouWillLearn());
        course.setPrice(request.getPrice());
        course.setIsFree(request.getPrice() == null || request.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0);
        
        if (request.getStatus() != null) {
            CourseStatus newStatus = CourseStatus.valueOf(request.getStatus().toUpperCase());
            if (newStatus == CourseStatus.APPROVED) {
                throw new IllegalArgumentException("Giảng viên không có quyền tự duyệt khóa học. Vui lòng chọn 'Bản nháp' hoặc 'Chờ duyệt'.");
            }
            course.setStatus(newStatus);
        } else {
            course.setStatus(CourseStatus.DRAFT);
        }
        
        course.setInstructor(instructor);

        if (request.getCategoryId() != null) {
            com.example.elearning.model.Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new com.example.elearning.exception.ResourceNotFoundException("Không tìm thấy Category", "CATEGORY_NOT_FOUND"));
            course.setCategory(category);
        }

        if (request.getThumbnailFileId() != null) {
            com.example.elearning.model.FileEntity file = fileEntityRepository.findById(request.getThumbnailFileId())
                    .orElseThrow(() -> new com.example.elearning.exception.ResourceNotFoundException("Không tìm thấy File", "FILE_NOT_FOUND"));
            course.setThumbnailFile(file);
        }

        course = courseRepository.save(course);

        // Gửi thông báo cho Admin nếu trạng thái là PENDING
        if (course.getStatus() == CourseStatus.PENDING) {
            sendAdminNotification(course, instructor);
        }

        return courseMapper.toCourseDetailResponseDto(course);
    }

    @Override
    @Transactional
    public CourseDetailResponseDto updateCourse(Long courseId, com.example.elearning.dto.request.CourseUpdateRequestDto request, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new com.example.elearning.exception.ResourceNotFoundException("Không tìm thấy khóa học", "COURSE_NOT_FOUND"));

        if (!course.getInstructor().getUserId().equals(instructorId)) {
            throw new com.example.elearning.exception.AccessDeniedException("Bạn không có quyền sửa khóa học này", "ACCESS_DENIED");
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setWhatYouWillLearn(request.getWhatYouWillLearn());
        course.setPrice(request.getPrice());
        course.setIsFree(request.getPrice() == null || request.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0);
        
        if (request.getStatus() != null) {
            CourseStatus newStatus = CourseStatus.valueOf(request.getStatus().toUpperCase());
            if (newStatus == CourseStatus.APPROVED && course.getStatus() != CourseStatus.APPROVED) {
                throw new IllegalArgumentException("Giảng viên không có quyền tự duyệt khóa học. Vui lòng chọn 'Chờ duyệt'.");
            }
            course.setStatus(newStatus);
        }

        if (request.getCategoryId() != null) {
            com.example.elearning.model.Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new com.example.elearning.exception.ResourceNotFoundException("Không tìm thấy Category", "CATEGORY_NOT_FOUND"));
            course.setCategory(category);
        }

        if (request.getThumbnailFileId() != null) {
            com.example.elearning.model.FileEntity file = fileEntityRepository.findById(request.getThumbnailFileId())
                    .orElseThrow(() -> new com.example.elearning.exception.ResourceNotFoundException("Không tìm thấy File", "FILE_NOT_FOUND"));
            course.setThumbnailFile(file);
        }

        course = courseRepository.save(course);

        // Gửi thông báo nếu khóa học được đổi sang PENDING
        if (request.getStatus() != null && course.getStatus() == CourseStatus.PENDING) {
            sendAdminNotification(course, course.getInstructor());
        }

        return courseMapper.toCourseDetailResponseDto(course);
    }

    @Override
    @Transactional
    public void deleteCourse(Long courseId, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new com.example.elearning.exception.ResourceNotFoundException("Không tìm thấy khóa học", "COURSE_NOT_FOUND"));

        if (!course.getInstructor().getUserId().equals(instructorId)) {
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền xóa khóa học này");
        }

        // Kiểm tra xem đã có ai đăng ký chưa
        long count = enrollmentRepository.countByCourse_CourseId(courseId);
        if (count > 0) {
            throw new RuntimeException("Không thể xóa khóa học đã có học viên đăng ký. Vui lòng chuyển trạng thái sang Đã ẩn.");
        }

        courseRepository.delete(course);
    }

    @Override
    @Transactional
    public java.util.List<com.example.elearning.dto.response.CourseStudentDto> getCourseStudents(Long courseId, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new com.example.elearning.exception.ResourceNotFoundException("Không tìm thấy khóa học", "COURSE_NOT_FOUND"));

        if (!course.getInstructor().getUserId().equals(instructorId)) {
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền xem thống kê khóa học này");
        }

        return enrollmentRepository.findByCourse_CourseId(courseId).stream().map(e -> {
            com.example.elearning.dto.response.CourseStudentDto dto = new com.example.elearning.dto.response.CourseStudentDto();
            dto.setStudentId(e.getStudent().getUserId());
            dto.setFullName(e.getStudent().getFullName());
            dto.setEmail(e.getStudent().getEmail());
            dto.setEnrollDate(e.getEnrollDate());
            dto.setStatus(e.getStatus() != null ? e.getStatus().name() : "ACTIVE");
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }

    private void sendAdminNotification(Course course, com.example.elearning.model.User instructor) {
        // Tạo SystemActivity
        com.example.elearning.model.SystemActivity activity = com.example.elearning.model.SystemActivity.builder()
                .actor(instructor)
                .actionType("COURSE_PENDING_APPROVAL")
                .targetId(course.getCourseId())
                .targetType("COURSE")
                .metadata("{\"courseTitle\":\"" + course.getTitle() + "\"}")
                .build();
        activity = systemActivityRepository.save(activity);

        // Lấy danh sách Admin
        List<com.example.elearning.model.User> admins = userRepository.findByRole(com.example.elearning.model.enums.UserRole.ROLE_ADMIN);
        List<com.example.elearning.model.User> superAdmins = userRepository.findByRole(com.example.elearning.model.enums.UserRole.ROLE_SUPER_ADMIN);
        
        List<com.example.elearning.model.User> allAdmins = new java.util.ArrayList<>();
        allAdmins.addAll(admins);
        allAdmins.addAll(superAdmins);

        // Tạo Notification cho từng Admin
        for (com.example.elearning.model.User admin : allAdmins) {
            com.example.elearning.model.Notification notification = com.example.elearning.model.Notification.builder()
                    .user(admin)
                    .activity(activity)
                    .title("Khóa học chờ duyệt mới")
                    .message("Giảng viên " + instructor.getFullName() + " vừa yêu cầu duyệt khóa học: " + course.getTitle())
                    .type("COURSE_APPROVAL_REQUEST")
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }
    }
}
