package com.example.elearning.repository;

import com.example.elearning.model.enums.UserRole;
import com.example.elearning.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByEmailAndUserIdNot(String email, Long userId);
    boolean existsByPhoneAndUserIdNot(String phone, Long userId);

    long countByRoleAndStatus(UserRole role, Boolean status);
    long countByRole(UserRole role);
    long countByCreatedAtAfter(LocalDateTime date);
    long countByRoleAndCreatedAtAfter(UserRole role, LocalDateTime date);
    long countByRoleAndCreatedAtBetween(UserRole role, LocalDateTime startDate, LocalDateTime endDate);
    java.util.List<User> findByRole(UserRole role);

    @Query("SELECT u FROM User u WHERE " +
           "(:keyword = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR u.email LIKE CONCAT('%', :keyword, '%') OR u.phone LIKE CONCAT('%', :keyword, '%')) " +
           "AND (u.role IN :roles) " +
           "AND (u.status IN :statuses)")
    Page<User> searchUsers(@Param("keyword") String keyword, 
                           @Param("roles") java.util.List<UserRole> roles, 
                           @Param("statuses") java.util.List<Boolean> statuses, 
                           Pageable pageable);
}
