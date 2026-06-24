package com.example.elearning.service.impl;

import com.example.elearning.dto.request.LessonCreateRequestDto;
import com.example.elearning.dto.request.SectionCreateRequestDto;
import com.example.elearning.dto.response.CourseAdminDetailResponseDto;
import com.example.elearning.exception.AccessDeniedException;
import com.example.elearning.exception.ResourceNotFoundException;
import com.example.elearning.mapper.CourseMapper;
import com.example.elearning.model.Course;
import com.example.elearning.model.Lesson;
import com.example.elearning.model.Section;
import com.example.elearning.repository.CourseRepository;
import com.example.elearning.repository.LessonRepository;
import com.example.elearning.repository.SectionRepository;
import com.example.elearning.repository.VideoRepository;
import com.example.elearning.repository.FileEntityRepository;
import com.example.elearning.repository.LessonAssetRepository;
import com.example.elearning.service.CurriculumService;
import com.example.elearning.model.Video;
import com.example.elearning.model.LessonAsset;
import com.example.elearning.model.enums.VideoType;
import com.example.elearning.model.FileEntity;
import com.example.elearning.model.Quiz;
import com.example.elearning.model.Question;
import com.example.elearning.model.Answer;
import com.example.elearning.dto.request.VideoAddRequestDto;
import com.example.elearning.dto.request.DocumentAddRequestDto;
import com.example.elearning.dto.request.QuestionAddRequestDto;
import com.example.elearning.repository.QuizRepository;
import com.example.elearning.repository.QuestionRepository;
import com.example.elearning.repository.AnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CurriculumServiceImpl implements CurriculumService {

    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final LessonRepository lessonRepository;
    private final VideoRepository videoRepository;
    private final FileEntityRepository fileEntityRepository;
    private final LessonAssetRepository lessonAssetRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final CourseMapper courseMapper;

    @Override
    @Transactional
    @CacheEvict(value = {"publicCourses", "publicCourseDetail"}, allEntries = true)
    public CourseAdminDetailResponseDto.SectionDto createSection(Long courseId, SectionCreateRequestDto requestDto, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id: " + courseId));

        if (!course.getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được thêm chương", "FORBIDDEN_ACCESS");
        }

        int currentCount = sectionRepository.countByCourse_CourseId(courseId);

        Section section = Section.builder()
                .course(course)
                .title(requestDto.getTitle())
                .sectionOrder(currentCount + 1)
                .build();

        Section savedSection = sectionRepository.save(section);
        return courseMapper.toSectionDto(savedSection);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"publicCourses", "publicCourseDetail"}, allEntries = true)
    public CourseAdminDetailResponseDto.SectionDto updateSection(Long sectionId, SectionCreateRequestDto requestDto, Long userId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id: " + sectionId));

        if (!section.getCourse().getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được sửa chương", "FORBIDDEN_ACCESS");
        }

        if (requestDto.getTitle() != null && !requestDto.getTitle().trim().isEmpty()) {
            section.setTitle(requestDto.getTitle());
        }

        Section savedSection = sectionRepository.save(section);
        return courseMapper.toSectionDto(savedSection);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"publicCourses", "publicCourseDetail"}, allEntries = true)
    public CourseAdminDetailResponseDto.LessonDto createLesson(Long sectionId, LessonCreateRequestDto requestDto, Long userId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id: " + sectionId));

        if (!section.getCourse().getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được thêm bài giảng", "FORBIDDEN_ACCESS");
        }

        int currentCount = lessonRepository.countBySection_SectionId(sectionId);

        Lesson lesson = Lesson.builder()
                .section(section)
                .title(requestDto.getTitle())
                .lessonType(requestDto.getLessonType() != null ? requestDto.getLessonType() : "VIDEO")
                .lessonOrder(currentCount + 1)
                .build();

        Lesson savedLesson = lessonRepository.save(lesson);
        return courseMapper.toLessonDto(savedLesson);
    }

    @Override
    @Transactional
    public CourseAdminDetailResponseDto.LessonDto updateLesson(Long lessonId, com.example.elearning.dto.request.LessonUpdateRequestDto requestDto, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id: " + lessonId));

        if (!lesson.getSection().getCourse().getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được sửa bài giảng", "FORBIDDEN_ACCESS");
        }

        if (requestDto.getTitle() != null && !requestDto.getTitle().trim().isEmpty()) {
            lesson.setTitle(requestDto.getTitle());
        }
        if (requestDto.getDescription() != null) {
            lesson.setDescription(requestDto.getDescription());
        }

        Lesson savedLesson = lessonRepository.save(lesson);
        return courseMapper.toLessonDto(savedLesson);
    }

    @Override
    @Transactional
    public void deleteSection(Long sectionId, Long userId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id: " + sectionId));

        if (!section.getCourse().getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được xóa", "FORBIDDEN_ACCESS");
        }

        sectionRepository.delete(section);
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id: " + lessonId));

        if (!lesson.getSection().getCourse().getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được xóa", "FORBIDDEN_ACCESS");
        }

        lessonRepository.delete(lesson);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"publicCourses", "publicCourseDetail"}, allEntries = true)
    public CourseAdminDetailResponseDto.VideoDto addVideoToLesson(Long lessonId, VideoAddRequestDto requestDto, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id: " + lessonId));

        if (!lesson.getSection().getCourse().getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được sửa", "FORBIDDEN_ACCESS");
        }

        Video video = Video.builder()
                .lesson(lesson)
                .duration(requestDto.getDurationMinutes())
                .build();

        if ("YOUTUBE".equalsIgnoreCase(requestDto.getVideoType())) {
            video.setVideoType(VideoType.YOUTUBE);
            video.setYoutubeUrl(requestDto.getYoutubeUrl());
        } else {
            FileEntity file = fileEntityRepository.findById(requestDto.getFileId())
                    .orElseThrow(() -> new ResourceNotFoundException("File", "id: " + requestDto.getFileId()));
            video.setVideoType(VideoType.UPLOAD);
            video.setVideoFile(file);
        }

        Video savedVideo = videoRepository.save(video);
        
        CourseAdminDetailResponseDto.VideoDto dto = new CourseAdminDetailResponseDto.VideoDto();
        dto.setVideoId(savedVideo.getVideoId());
        
        if (savedVideo.getVideoType() == VideoType.YOUTUBE) {
            dto.setTitle("YouTube Video");
            dto.setVideoUrl(savedVideo.getYoutubeUrl());
        } else {
            dto.setTitle(savedVideo.getVideoFile().getFileName());
            dto.setVideoUrl(savedVideo.getVideoFile().getFilePath());
        }
        
        dto.setDurationMinutes(savedVideo.getDuration());
        return dto;
    }

    @Override
    @Transactional
    @CacheEvict(value = {"publicCourses", "publicCourseDetail"}, allEntries = true)
    public CourseAdminDetailResponseDto.DocumentDto addDocumentToLesson(Long lessonId, DocumentAddRequestDto requestDto, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id: " + lessonId));

        if (!lesson.getSection().getCourse().getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được sửa", "FORBIDDEN_ACCESS");
        }

        FileEntity file = fileEntityRepository.findById(requestDto.getFileId())
                .orElseThrow(() -> new ResourceNotFoundException("File", "id: " + requestDto.getFileId()));

        LessonAsset asset = LessonAsset.builder()
                .lesson(lesson)
                .file(file)
                .build();

        LessonAsset savedAsset = lessonAssetRepository.save(asset);

        CourseAdminDetailResponseDto.DocumentDto dto = new CourseAdminDetailResponseDto.DocumentDto();
        dto.setDocumentId(savedAsset.getAssetId());
        dto.setTitle(file.getFileName());
        dto.setFileUrl(file.getFilePath());
        dto.setFileName(file.getFileName());
        return dto;
    }

    @Override
    @Transactional
    public CourseAdminDetailResponseDto.QuestionDto addQuestionToLesson(Long lessonId, QuestionAddRequestDto requestDto, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id: " + lessonId));

        if (!lesson.getSection().getCourse().getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được sửa", "FORBIDDEN_ACCESS");
        }











































        // Tìm quiz của lesson, nếu chưa có thì tạo một cái mặc định
        java.util.List<Quiz> quizzes = quizRepository.findByLesson_LessonId(lessonId);
        Quiz quiz;
        if (quizzes.isEmpty()) {
            quiz = Quiz.builder()
                    .lesson(lesson)
                    .title("Bài tập trắc nghiệm")
                    .passingScore(50)
                    .build();
            quiz = quizRepository.save(quiz);
        } else {
            quiz = quizzes.get(0);
        }

        // Tạo câu hỏi
        Question question = Question.builder()
                .quiz(quiz)
                .questionText(requestDto.getQuestionText())
                .build();
        question = questionRepository.save(question);

        // Tạo các đáp án
        java.util.List<CourseAdminDetailResponseDto.AnswerDto> answerDtos = new java.util.ArrayList<>();
        for (QuestionAddRequestDto.AnswerAddRequestDto ansDto : requestDto.getAnswers()) {
            Answer answer = new Answer();
            answer.setQuestion(question);
            answer.setAnswerText(ansDto.getAnswerText());
            answer.setIsCorrect(ansDto.getIsCorrect());
            answer = answerRepository.save(answer);

            CourseAdminDetailResponseDto.AnswerDto ans = new CourseAdminDetailResponseDto.AnswerDto();
            ans.setAnswerId(answer.getAnswerId());
            ans.setAnswerText(answer.getAnswerText());
            ans.setIsCorrect(answer.getIsCorrect());
            answerDtos.add(ans);
        }

        // Trả về DTO
        return CourseAdminDetailResponseDto.QuestionDto.builder()
                .questionId(question.getQuestionId())
                .questionText(question.getQuestionText())
                .answers(answerDtos)
                .build();
    }
    @Override
    @Transactional
    public CourseAdminDetailResponseDto.QuestionDto updateQuestion(Long questionId, com.example.elearning.dto.request.QuestionUpdateRequestDto requestDto, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id: " + questionId));

        if (!question.getQuiz().getLesson().getSection().getCourse().getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được sửa", "FORBIDDEN_ACCESS");
        }

        question.setQuestionText(requestDto.getQuestionText());
        question = questionRepository.save(question);

        // Delete old answers
        java.util.List<Answer> oldAnswers = answerRepository.findByQuestion_QuestionId(questionId);
        answerRepository.deleteAll(oldAnswers);

        // Create new answers
        java.util.List<CourseAdminDetailResponseDto.AnswerDto> answerDtos = new java.util.ArrayList<>();
        for (com.example.elearning.dto.request.QuestionUpdateRequestDto.AnswerUpdateRequestDto ansDto : requestDto.getAnswers()) {
            Answer answer = new Answer();
            answer.setQuestion(question);
            answer.setAnswerText(ansDto.getAnswerText());
            answer.setIsCorrect(ansDto.getIsCorrect());
            answer = answerRepository.save(answer);

            CourseAdminDetailResponseDto.AnswerDto ans = new CourseAdminDetailResponseDto.AnswerDto();
            ans.setAnswerId(answer.getAnswerId());
            ans.setAnswerText(answer.getAnswerText());
            ans.setIsCorrect(answer.getIsCorrect());
            answerDtos.add(ans);
        }

        return CourseAdminDetailResponseDto.QuestionDto.builder()
                .questionId(question.getQuestionId())
                .questionText(question.getQuestionText())
                .answers(answerDtos)
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(value = {"publicCourses", "publicCourseDetail"}, allEntries = true)
    public void deleteQuestion(Long questionId, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id: " + questionId));

        if (!question.getQuiz().getLesson().getSection().getCourse().getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được xóa", "FORBIDDEN_ACCESS");
        }

        questionRepository.delete(question);
    }

    @Override
    @Transactional
    public void deleteVideo(Long videoId, Long userId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id: " + videoId));

        if (!video.getLesson().getSection().getCourse().getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được xóa", "FORBIDDEN_ACCESS");
        }

        videoRepository.delete(video);
    }

    @Override
    @Transactional
    public void deleteDocument(Long assetId, Long userId) {
        LessonAsset asset = lessonAssetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("LessonAsset", "id: " + assetId));

        if (!asset.getLesson().getSection().getCourse().getInstructor().getUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ giảng viên tạo khóa học mới được xóa", "FORBIDDEN_ACCESS");
        }

        lessonAssetRepository.delete(asset);
    }
}
