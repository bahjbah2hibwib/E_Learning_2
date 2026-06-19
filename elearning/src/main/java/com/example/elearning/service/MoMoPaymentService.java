package com.example.elearning.service;

import com.example.elearning.dto.response.MoMoCreatePaymentResponseDto;

public interface MoMoPaymentService {
    MoMoCreatePaymentResponseDto createPaymentRequest(Long courseId, Long userId, Long amount) throws Exception;
}
