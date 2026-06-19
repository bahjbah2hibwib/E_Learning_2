package com.example.elearning.dto.request;

import lombok.Data;

@Data
public class PaymentRequestDto {
    private Long courseId;
    private Long amount;
}
