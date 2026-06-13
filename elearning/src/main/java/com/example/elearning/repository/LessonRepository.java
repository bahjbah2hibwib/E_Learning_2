package com.example.elearning.repository;

import com.example.elearning.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findBySection_SectionIdOrderByLessonOrderAsc(Long sectionId);
    int countBySection_SectionId(Long sectionId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(l) FROM Lesson l WHERE l.section.course.courseId = :courseId")
    long countByCourseId(@org.springframework.data.repository.query.Param("courseId") Long courseId);
}
