package com.example.elearning.repository;

import com.example.elearning.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    long countByCourse_CourseId(Long courseId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT e.student.userId) FROM Enrollment e WHERE e.course.instructor.userId = :instructorId")
    long countUniqueStudentsByInstructor(@org.springframework.data.repository.query.Param("instructorId") Long instructorId);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Enrollment e JOIN FETCH e.course c WHERE c.instructor.userId = :instructorId")
    java.util.List<Enrollment> findByInstructorId(@org.springframework.data.repository.query.Param("instructorId") Long instructorId);

    java.util.List<Enrollment> findByStudent_UserId(Long studentId);
    java.util.List<Enrollment> findByCourse_CourseId(Long courseId);
    boolean existsByStudent_UserIdAndCourse_CourseId(Long studentId, Long courseId);
    java.util.Optional<Enrollment> findByStudent_UserIdAndCourse_CourseId(Long studentId, Long courseId);
}
