package com.example.elearning.controller;

import com.example.elearning.dto.response.PageResponseDto;
import com.example.elearning.dto.response.PaymentAdminItemDto;
import com.example.elearning.dto.response.PaymentDetailResponseDto;
import com.example.elearning.dto.response.PaymentStatsDto;
import com.example.elearning.security.JwtTokenProvider;
import com.example.elearning.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPaymentsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // Bước 1: Trích xuất role hiện tại từ JWT Token
        String currentRole = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Bỏ chữ "Bearer "
            currentRole = jwtTokenProvider.getRoleFromJwtToken(token);
        }

        // Bước 2: Gọi Service xử lý nghiệp vụ lấy danh sách thanh toán
        PageResponseDto<PaymentAdminItemDto> data = paymentService.getAdminPayments(page, size, keyword, status, startDate, endDate, currentRole);

        // Bước 3: Đóng gói phản hồi theo chuẩn JSON
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách giao dịch thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPaymentStats(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        String currentRole = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            currentRole = jwtTokenProvider.getRoleFromJwtToken(token);
        }

        PaymentStatsDto data = paymentService.getPaymentStats(currentRole);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy thống kê giao dịch thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPaymentDetail(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        String currentRole = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            currentRole = jwtTokenProvider.getRoleFromJwtToken(token);
        }

        PaymentDetailResponseDto data = paymentService.getPaymentDetail(id, currentRole);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy thông tin chi tiết giao dịch thành công");
        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
