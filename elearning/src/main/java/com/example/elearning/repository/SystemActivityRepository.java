package com.example.elearning.repository;

import com.example.elearning.model.SystemActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemActivityRepository extends JpaRepository<SystemActivity, Long> {
}
