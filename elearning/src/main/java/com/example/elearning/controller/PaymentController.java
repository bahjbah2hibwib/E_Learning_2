package com.example.elearning.controller;

import com.example.elearning.dto.request.PaymentRequestDto;
import com.example.elearning.dto.response.MoMoCreatePaymentResponseDto;
import com.example.elearning.dto.response.PageResponseDto;
import com.example.elearning.dto.response.PaymentAdminItemDto;
import com.example.elearning.dto.response.PaymentDetailResponseDto;
import com.example.elearning.dto.response.PaymentStatsDto;
import com.example.elearning.service.MoMoPaymentService;
import com.example.elearning.service.NotificationService;
import com.example.elearning.service.PaymentService;
import com.example.elearning.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final MoMoPaymentService moMoPaymentService;
    private final PaymentService paymentService;
    private final UserService userService;
    private final NotificationService notificationService;

    // --- Admin Endpoints ---

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
            
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentRole = null;
        if (auth != null && auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
            currentRole = auth.getAuthorities().iterator().next().getAuthority();
        }

        PageResponseDto<PaymentAdminItemDto> data = paymentService.getAdminPayments(page, size, keyword, status, startDate, endDate, currentRole);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPaymentStats() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentRole = null;
        if (auth != null && auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
            currentRole = auth.getAuthorities().iterator().next().getAuthority();
        }

        PaymentStatsDto data = paymentService.getPaymentStats(currentRole);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPaymentDetail(@PathVariable Long id) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentRole = null;
        if (auth != null && auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
            currentRole = auth.getAuthorities().iterator().next().getAuthority();
        }

        PaymentDetailResponseDto data = paymentService.getPaymentDetail(id, currentRole);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    // --- MoMo Endpoints ---

    @PostMapping("/momo/create")
    public ResponseEntity<?> createMoMoPayment(
            @RequestBody PaymentRequestDto request,
            org.springframework.security.core.Authentication auth) {
        try {
            if (auth == null || !(auth.getPrincipal() instanceof Long)) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Vui lòng đăng nhập"));
            }
            Long userId = (Long) auth.getPrincipal();
            MoMoCreatePaymentResponseDto response = moMoPaymentService.createPaymentRequest(
                    request.getCourseId(), 
                    userId, 
                    request.getAmount()
            );
            
            if (response == null || response.getResultCode() != 0 || response.getPayUrl() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "MoMo từ chối thanh toán: " + (response != null ? response.getMessage() : "Unknown")
                ));
            }
            
            java.util.Map<String, Object> responseBody = new java.util.HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Tạo link thanh toán thành công");
            responseBody.put("payUrl", response.getPayUrl());

            return ResponseEntity.ok(responseBody);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            String errorResponse = e.getResponseBodyAsString();
            String errorMessage = "Giao dịch bị từ chối bởi MoMo.";
            try {
                com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(errorResponse);
                if (root.has("message")) {
                    errorMessage = root.get("message").asText();
                }
            } catch (Exception ex) {
                // Ignore parse error
            }
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", errorMessage
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi hệ thống khi tạo thanh toán: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/momo/ipn")
    public ResponseEntity<?> handleMoMoIpn(@RequestBody Map<String, Object> payload) {
        System.out.println("Nhận IPN từ MoMo: " + payload);
        
        Integer resultCode = (Integer) payload.get("resultCode");
        String extraData = (String) payload.get("extraData"); // userId=1;courseId=2
        
        if (resultCode != null && resultCode == 0 && extraData != null) {
            System.out.println("Thanh toán thành công. Thông tin: " + extraData);
            
            Long userId = null;
            Long courseId = null;
            String[] parts = extraData.split(";");
            for (String part : parts) {
                if (part.startsWith("userId=")) userId = Long.valueOf(part.split("=")[1]);
                if (part.startsWith("courseId=")) courseId = Long.valueOf(part.split("=")[1]);
            }
            
            if (userId != null && courseId != null) {
                try {
                    userService.enrollCourse(userId, courseId);
                    
                    String message = "Học viên (ID: " + userId + ") vừa thanh toán thành công khóa học (ID: " + courseId + ")";
                    notificationService.sendNotificationToRole(com.example.elearning.model.enums.UserRole.ROLE_SUPER_ADMIN, "Thanh toán mới", message, "PAYMENT_SUCCESS");
                    notificationService.sendNotificationToRole(com.example.elearning.model.enums.UserRole.ROLE_ADMIN, "Thanh toán mới", message, "PAYMENT_SUCCESS");
                } catch (Exception e) {
                    System.out.println("Lỗi khi xử lý IPN: " + e.getMessage());
                }
            }
        }

        return ResponseEntity.noContent().build();
    }
}
