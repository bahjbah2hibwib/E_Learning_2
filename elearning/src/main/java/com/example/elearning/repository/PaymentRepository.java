package com.example.elearning.repository;

import com.example.elearning.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.elearning.model.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    java.util.List<Payment> findByStudent_UserId(Long studentId);

    @Query(value = "SELECT p FROM Payment p JOIN FETCH p.student s JOIN FETCH p.course c WHERE " +
           "(:status IS NULL OR p.paymentStatus = :status) AND " +
           "(:keyword IS NULL OR LOWER(p.transactionCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:startDate IS NULL OR p.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR p.createdAt <= :endDate)",
           countQuery = "SELECT count(p) FROM Payment p JOIN p.student s JOIN p.course c WHERE " +
           "(:status IS NULL OR p.paymentStatus = :status) AND " +
           "(:keyword IS NULL OR LOWER(p.transactionCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:startDate IS NULL OR p.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR p.createdAt <= :endDate)")
    Page<Payment> searchPayments(@Param("keyword") String keyword, @Param("status") PaymentStatus status, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = 'SUCCESS'")
    java.math.BigDecimal calculateTotalRevenue();

    long countByPaymentStatus(PaymentStatus status);

    @Query("SELECT p FROM Payment p JOIN FETCH p.student JOIN FETCH p.course WHERE p.paymentId = :id")
    java.util.Optional<Payment> findPaymentDetailById(@Param("id") Long id);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.course.courseId = :courseId AND p.paymentStatus = 'SUCCESS'")
    java.math.BigDecimal calculateTotalRevenueByCourse(@Param("courseId") Long courseId);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.course.courseId = :courseId AND p.paymentStatus = 'SUCCESS'")
    long countPaidStudentsByCourse(@Param("courseId") Long courseId);
}
