package com.example.elearning.controller;

import com.example.elearning.model.*;
import com.example.elearning.model.enums.VideoType;
import com.example.elearning.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/demo-seeder")
@RequiredArgsConstructor
public class DemoSeederController {

    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final LessonRepository lessonRepository;
    private final VideoRepository videoRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    @GetMapping("/run")
    @Transactional
    @CacheEvict(value = {"publicCourses", "publicCourseDetail"}, allEntries = true)
    public ResponseEntity<?> seedAllCourses() {
        List<Course> courses = courseRepository.findAll();

        for (Course course : courses) {
            // Delete old sections to clean up (Cascade delete handles lessons, videos, etc.)
            List<Section> oldSections = sectionRepository.findByCourse_CourseIdOrderBySectionOrderAsc(course.getCourseId());
            sectionRepository.deleteAll(oldSections);

            // ================= SECTION 1 =================
            Section s1 = sectionRepository.save(Section.builder()
                    .course(course).title("Chương 1: Khởi động dự án & Kiến trúc hệ thống").sectionOrder(1).build());

            // Lesson 1.1
            Lesson l1_1 = lessonRepository.save(Lesson.builder()
                    .section(s1).title("Tổng quan khóa học và Cài đặt môi trường").lessonType("VIDEO").lessonOrder(1).build());
            videoRepository.save(Video.builder()
                    .lesson(l1_1).videoType(VideoType.YOUTUBE).youtubeUrl("https://www.youtube.com/watch?v=9SGDpanrc8U")
                    .duration(65).build());

            // Lesson 1.2
            Lesson l1_2 = lessonRepository.save(Lesson.builder()
                    .section(s1).title("Phân tích thiết kế Database cho hệ thống").lessonType("QUIZ").lessonOrder(2).build());
            videoRepository.save(Video.builder()
                    .lesson(l1_2).videoType(VideoType.YOUTUBE).youtubeUrl("https://www.youtube.com/watch?v=ztHopE5Wnpc")
                    .duration(45).build());
            
            Quiz q1 = quizRepository.save(Quiz.builder().lesson(l1_2).title("Kiểm tra kiến thức Database").build());
            Question q1_1 = questionRepository.save(Question.builder().quiz(q1).questionText("Đâu là mối quan hệ đúng giữa Khóa học và Giảng viên?").build());
            answerRepository.save(Answer.builder().question(q1_1).answerText("Quan hệ 1-1").isCorrect(false).build());
            answerRepository.save(Answer.builder().question(q1_1).answerText("Quan hệ Nhiều-Nhiều (N-N)").isCorrect(false).build());
            answerRepository.save(Answer.builder().question(q1_1).answerText("Quan hệ 1-Nhiều (1-N)").isCorrect(true).build());

            Question q1_2 = questionRepository.save(Question.builder().quiz(q1).questionText("Để tối ưu hiệu suất truy vấn trong Database, ta nên sử dụng kỹ thuật nào?").build());
            answerRepository.save(Answer.builder().question(q1_2).answerText("Viết mọi logic tính toán vào Database").isCorrect(false).build());
            answerRepository.save(Answer.builder().question(q1_2).answerText("Đánh Index (Chỉ mục) cho các trường hay tìm kiếm").isCorrect(true).build());
            answerRepository.save(Answer.builder().question(q1_2).answerText("Không dùng khóa ngoại (Foreign Key)").isCorrect(false).build());


            // ================= SECTION 2 =================
            Section s2 = sectionRepository.save(Section.builder()
                    .course(course).title("Chương 2: Xây dựng Backend với Spring Boot 3").sectionOrder(2).build());

            // Lesson 2.1
            Lesson l2_1 = lessonRepository.save(Lesson.builder()
                    .section(s2).title("Khởi tạo RESTful API và Spring Data JPA").lessonType("VIDEO").lessonOrder(1).build());
            videoRepository.save(Video.builder()
                    .lesson(l2_1).videoType(VideoType.YOUTUBE).youtubeUrl("https://www.youtube.com/watch?v=8SGI_WEzVug")
                    .duration(52).build());

            // Lesson 2.2
            Lesson l2_2 = lessonRepository.save(Lesson.builder()
                    .section(s2).title("Bảo mật ứng dụng với Spring Security & JWT").lessonType("QUIZ").lessonOrder(2).build());
            videoRepository.save(Video.builder()
                    .lesson(l2_2).videoType(VideoType.YOUTUBE).youtubeUrl("https://www.youtube.com/watch?v=her_7pa0vrg")
                    .duration(38).build());

            Quiz q2 = quizRepository.save(Quiz.builder().lesson(l2_2).title("Trắc nghiệm Spring Boot & Security").build());
            Question q2_1 = questionRepository.save(Question.builder().quiz(q2).questionText("Annotation nào dùng để đánh dấu một REST Controller?").build());
            answerRepository.save(Answer.builder().question(q2_1).answerText("@Controller").isCorrect(false).build());
            answerRepository.save(Answer.builder().question(q2_1).answerText("@RestController").isCorrect(true).build());
            answerRepository.save(Answer.builder().question(q2_1).answerText("@Service").isCorrect(false).build());

            Question q2_2 = questionRepository.save(Question.builder().quiz(q2).questionText("Giao thức nào phổ biến nhất để xác thực API hiện nay?").build());
            answerRepository.save(Answer.builder().question(q2_2).answerText("Session Cookie Auth").isCorrect(false).build());
            answerRepository.save(Answer.builder().question(q2_2).answerText("JWT (JSON Web Token)").isCorrect(true).build());
            answerRepository.save(Answer.builder().question(q2_2).answerText("Basic Auth").isCorrect(false).build());


            // ================= SECTION 3 =================
            Section s3 = sectionRepository.save(Section.builder()
                    .course(course).title("Chương 3: Xây dựng Frontend với ReactJS & Triển khai").sectionOrder(3).build());

            // Lesson 3.1
            Lesson l3_1 = lessonRepository.save(Lesson.builder()
                    .section(s3).title("Xây dựng giao diện với ReactJS và Ant Design").lessonType("VIDEO").lessonOrder(1).build());
            videoRepository.save(Video.builder()
                    .lesson(l3_1).videoType(VideoType.YOUTUBE).youtubeUrl("https://www.youtube.com/watch?v=w7ejDZ8SWv8")
                    .duration(72).build());

            // Lesson 3.2
            Lesson l3_2 = lessonRepository.save(Lesson.builder()
                    .section(s3).title("Kết nối API, xử lý Redux và Hoàn thiện dự án").lessonType("VIDEO").lessonOrder(2).build());
            videoRepository.save(Video.builder()
                    .lesson(l3_2).videoType(VideoType.YOUTUBE).youtubeUrl("https://www.youtube.com/watch?v=iVQqnoPtbu0")
                    .duration(50).build());
        }

        return ResponseEntity.ok("✅ Đã inject toàn bộ data chuẩn chỉ (Video YouTube, Quiz, Answers) cho tất cả khóa học thành công!");
    }
}
