package com.example.elearning.dto.response;

import lombok.Data;

@Data
public class MoMoCreatePaymentResponseDto {
    private String partnerCode;
    private String orderId;
    private String requestId;
    private Long amount;
    private Long responseTime;
    private String message;
    private Integer resultCode;
    private String payUrl;
    private String shortLink;
}
