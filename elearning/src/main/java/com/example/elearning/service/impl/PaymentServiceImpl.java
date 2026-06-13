package com.example.elearning.service.impl;

import com.example.elearning.dto.response.PageResponseDto;
import com.example.elearning.dto.response.PaymentAdminItemDto;
import com.example.elearning.dto.response.PaymentDetailResponseDto;
import com.example.elearning.exception.AccessDeniedException;
import com.example.elearning.mapper.PaymentMapper;
import com.example.elearning.model.Payment;
import com.example.elearning.model.enums.PaymentStatus;
import com.example.elearning.repository.PaymentRepository;
import com.example.elearning.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.elearning.dto.response.PaymentStatsDto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final com.example.elearning.service.MinioService minioService;

    @Override
    public PageResponseDto<PaymentAdminItemDto> getAdminPayments(int page, int size, String keyword, String status, String startDate, String endDate, String currentRole) {
        // Kiểm tra quyền
        boolean isAdmin = "ROLE_ADMIN".equals(currentRole);
        boolean isSuperAdmin = "ROLE_SUPER_ADMIN".equals(currentRole);
        if (!isAdmin && !isSuperAdmin) {
            throw new AccessDeniedException(
                    "Chỉ Quản trị viên mới có quyền xem danh sách giao dịch toàn hệ thống.",
                    "FORBIDDEN_ACCESS"
            );
        }

        // Tạo Pageable sắp xếp mới nhất
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Lọc trạng thái
        PaymentStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                statusEnum = PaymentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Bỏ qua nếu ko hợp lệ
            }
        }

        // Keyword
        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        // Ngày bắt đầu / kết thúc
        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            if (startDate != null && !startDate.trim().isEmpty()) {
                startDateTime = LocalDate.parse(startDate, formatter).atStartOfDay();
            }
            if (endDate != null && !endDate.trim().isEmpty()) {
                endDateTime = LocalDate.parse(endDate, formatter).atTime(23, 59, 59);
            }
        } catch (DateTimeParseException e) {
            // Bỏ qua nếu format sai
        }

        // Truy vấn DB
        Page<Payment> paymentPage = paymentRepository.searchPayments(searchKeyword, statusEnum, startDateTime, endDateTime, pageable);

        // Map sang DTO
        List<PaymentAdminItemDto> content = paymentPage.getContent().stream()
                .map(paymentMapper::toPaymentAdminItemDto)
                .collect(Collectors.toList());

        return PageResponseDto.<PaymentAdminItemDto>builder()
                .content(content)
                .pageNo(paymentPage.getNumber())
                .pageSize(paymentPage.getSize())
                .totalElements(paymentPage.getTotalElements())
                .totalPages(paymentPage.getTotalPages())
                .last(paymentPage.isLast())
                .build();
    }

    @Override
    public PaymentStatsDto getPaymentStats(String currentRole) {
        boolean isAdmin = "ROLE_ADMIN".equals(currentRole);
        boolean isSuperAdmin = "ROLE_SUPER_ADMIN".equals(currentRole);
        if (!isAdmin && !isSuperAdmin) {
            throw new AccessDeniedException("Chỉ Quản trị viên mới có quyền xem thống kê giao dịch.", "FORBIDDEN_ACCESS");
        }

        BigDecimal totalRevenue = paymentRepository.calculateTotalRevenue();
        long successCount = paymentRepository.countByPaymentStatus(PaymentStatus.SUCCESS);
        long pendingCount = paymentRepository.countByPaymentStatus(PaymentStatus.PENDING);
        long refundedCount = paymentRepository.countByPaymentStatus(PaymentStatus.REFUNDED);

        return PaymentStatsDto.builder()
                .totalRevenue(totalRevenue)
                .successCount(successCount)
                .pendingCount(pendingCount)
                .refundedCount(refundedCount)
                .build();
    }

    @Override
    public PaymentDetailResponseDto getPaymentDetail(Long id, String currentRole) {
        boolean isAdmin = "ROLE_ADMIN".equals(currentRole);
        boolean isSuperAdmin = "ROLE_SUPER_ADMIN".equals(currentRole);
        if (!isAdmin && !isSuperAdmin) {
            throw new AccessDeniedException("Chỉ Quản trị viên mới có quyền xem chi tiết giao dịch.", "FORBIDDEN_ACCESS");
        }

        Payment payment = paymentRepository.findPaymentDetailById(id)
                .orElseThrow(() -> new com.example.elearning.exception.PaymentNotFoundException(
                        "Không tìm thấy thông tin giao dịch trên hệ thống.", "PAYMENT_NOT_FOUND"));

        PaymentDetailResponseDto responseDto = paymentMapper.toPaymentDetailResponseDto(payment);
        
        try {
            String billUrl = minioService.getPreSignedUrl("uploads/857965a8-2d78-4cac-bd93-9f131569d964.png");
            if (responseDto.getTransactionInfo() != null) {
                responseDto.getTransactionInfo().setBillImageUrl(billUrl);
            }
        } catch (Exception e) {
            // log error if needed
        }

        return responseDto;
    }
}
