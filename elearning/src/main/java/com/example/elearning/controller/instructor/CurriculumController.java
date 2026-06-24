package com.example.elearning.controller.instructor;

import com.example.elearning.dto.request.LessonCreateRequestDto;
import com.example.elearning.dto.request.SectionCreateRequestDto;
import com.example.elearning.dto.response.CourseAdminDetailResponseDto;
import com.example.elearning.service.CurriculumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/instructor")
@RequiredArgsConstructor
public class CurriculumController {

    private final CurriculumService curriculumService;

    @PostMapping("/courses/{courseId}/sections")
    public ResponseEntity<java.util.Map<String, Object>> createSection(
            @PathVariable Long courseId,
            @Valid @RequestBody SectionCreateRequestDto requestDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        CourseAdminDetailResponseDto.SectionDto section = curriculumService.createSection(courseId, requestDto, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Tạo chương học thành công");
        response.put("data", section);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/sections/{sectionId}")
    public ResponseEntity<java.util.Map<String, Object>> updateSection(
            @PathVariable Long sectionId,
            @Valid @RequestBody SectionCreateRequestDto requestDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        CourseAdminDetailResponseDto.SectionDto section = curriculumService.updateSection(sectionId, requestDto, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Cập nhật chương học thành công");
        response.put("data", section);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sections/{sectionId}/lessons")
    public ResponseEntity<java.util.Map<String, Object>> createLesson(
            @PathVariable Long sectionId,
            @Valid @RequestBody LessonCreateRequestDto requestDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        CourseAdminDetailResponseDto.LessonDto lesson = curriculumService.createLesson(sectionId, requestDto, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Tạo bài giảng thành công");
        response.put("data", lesson);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<java.util.Map<String, Object>> updateLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody com.example.elearning.dto.request.LessonUpdateRequestDto requestDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        CourseAdminDetailResponseDto.LessonDto lesson = curriculumService.updateLesson(lessonId, requestDto, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Cập nhật bài giảng thành công");
        response.put("data", lesson);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/sections/{sectionId}")
    public ResponseEntity<java.util.Map<String, Object>> deleteSection(
            @PathVariable Long sectionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        curriculumService.deleteSection(sectionId, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Xóa chương học thành công");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<java.util.Map<String, Object>> deleteLesson(
            @PathVariable Long lessonId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        curriculumService.deleteLesson(lessonId, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Xóa bài giảng thành công");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/lessons/{lessonId}/videos")
    public ResponseEntity<java.util.Map<String, Object>> addVideoToLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody com.example.elearning.dto.request.VideoAddRequestDto requestDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        CourseAdminDetailResponseDto.VideoDto video = curriculumService.addVideoToLesson(lessonId, requestDto, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Thêm video vào bài giảng thành công");
        response.put("data", video);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/lessons/{lessonId}/documents")
    public ResponseEntity<java.util.Map<String, Object>> addDocumentToLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody com.example.elearning.dto.request.DocumentAddRequestDto requestDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        CourseAdminDetailResponseDto.DocumentDto document = curriculumService.addDocumentToLesson(lessonId, requestDto, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Thêm tài liệu đính kèm thành công");
        response.put("data", document);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/lessons/{lessonId}/questions")
    public ResponseEntity<java.util.Map<String, Object>> addQuestionToLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody com.example.elearning.dto.request.QuestionAddRequestDto requestDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        CourseAdminDetailResponseDto.QuestionDto question = curriculumService.addQuestionToLesson(lessonId, requestDto, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Thêm câu hỏi trắc nghiệm thành công");
        response.put("data", question);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<java.util.Map<String, Object>> updateQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody com.example.elearning.dto.request.QuestionUpdateRequestDto requestDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        CourseAdminDetailResponseDto.QuestionDto question = curriculumService.updateQuestion(questionId, requestDto, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Cập nhật câu hỏi thành công");
        response.put("data", question);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<java.util.Map<String, Object>> deleteQuestion(
            @PathVariable Long questionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        curriculumService.deleteQuestion(questionId, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Xóa câu hỏi thành công");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/videos/{videoId}")
    public ResponseEntity<java.util.Map<String, Object>> deleteVideo(
            @PathVariable Long videoId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        curriculumService.deleteVideo(videoId, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Xóa video thành công");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/documents/{assetId}")
    public ResponseEntity<java.util.Map<String, Object>> deleteDocument(
            @PathVariable Long assetId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long currentUserId = extractUserId(authHeader);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        curriculumService.deleteDocument(assetId, currentUserId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Xóa tài liệu thành công");
        return ResponseEntity.ok(response);
    }

    private final com.example.elearning.security.JwtTokenProvider jwtTokenProvider;

    private Long extractUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtTokenProvider.getUserIdFromJwtToken(token);
        }
        return null;
    }
}
