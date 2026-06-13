package com.example.elearning.repository;

import com.example.elearning.model.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(lp) FROM LessonProgress lp WHERE lp.student.userId = :userId AND lp.isCompleted = true")
    long countCompletedLessonsByUser(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(lp) FROM LessonProgress lp WHERE lp.student.userId = :userId AND lp.isCompleted = true AND lp.lesson.section.course.courseId = :courseId")
    long countCompletedLessonsByUserAndCourse(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("courseId") Long courseId);

    java.util.Optional<LessonProgress> findByStudent_UserIdAndLesson_LessonId(Long studentId, Long lessonId);

    java.util.List<LessonProgress> findByStudent_UserIdAndLesson_Section_Course_CourseId(Long studentId, Long courseId);
}
