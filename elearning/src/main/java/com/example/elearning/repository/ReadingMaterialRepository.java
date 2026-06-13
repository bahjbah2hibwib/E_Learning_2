package com.example.elearning.repository;

import com.example.elearning.model.ReadingMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReadingMaterialRepository extends JpaRepository<ReadingMaterial, Long> {
    List<ReadingMaterial> findByLesson_LessonId(Long lessonId);
}
