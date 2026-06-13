package com.example.elearning.repository;

import com.example.elearning.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByCourse_CourseIdOrderBySectionOrderAsc(Long courseId);
    boolean existsByCourse_CourseIdAndTitle(Long courseId, String title);
    int countByCourse_CourseId(Long courseId);
}
