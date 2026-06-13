package com.example.elearning.repository;

import com.example.elearning.model.LessonAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonAssetRepository extends JpaRepository<LessonAsset, Long> {
    List<LessonAsset> findByLesson_LessonId(Long lessonId);
}
