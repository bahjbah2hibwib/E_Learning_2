package com.example.elearning.repository;

import com.example.elearning.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.elearning.model.enums.CourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c JOIN FETCH c.instructor i LEFT JOIN FETCH c.thumbnailFile f WHERE " +
           "(:instructorId IS NULL OR i.userId = :instructorId) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Course> searchAdminCourses(@Param("instructorId") Long instructorId, @Param("status") CourseStatus status, @Param("keyword") String keyword, Pageable pageable);

    long countByInstructor_UserId(Long userId);
    
    long countByInstructor_UserIdAndStatus(Long userId, CourseStatus status);
    
    java.util.List<Course> findByInstructor_UserId(Long userId);
}
