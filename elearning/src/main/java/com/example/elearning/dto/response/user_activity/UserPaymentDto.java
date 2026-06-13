package com.example.elearning.dto.response.user_activity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPaymentDto {
    private Long paymentId;
    private String transactionId;
    private BigDecimal amount;
    private String status;
    private String paymentDate;
}
