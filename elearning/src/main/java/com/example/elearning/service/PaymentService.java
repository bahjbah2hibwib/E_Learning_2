package com.example.elearning.service;

import com.example.elearning.dto.response.PageResponseDto;
import com.example.elearning.dto.response.PaymentAdminItemDto;

import com.example.elearning.dto.response.PaymentStatsDto;
import com.example.elearning.dto.response.PaymentDetailResponseDto;

public interface PaymentService {
    PageResponseDto<PaymentAdminItemDto> getAdminPayments(int page, int size, String keyword, String status, String startDate, String endDate, String currentRole);
    PaymentStatsDto getPaymentStats(String currentRole);
    PaymentDetailResponseDto getPaymentDetail(Long id, String currentRole);
}
