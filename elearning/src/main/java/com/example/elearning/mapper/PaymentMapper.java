package com.example.elearning.mapper;

import com.example.elearning.dto.response.PaymentAdminItemDto;
import com.example.elearning.dto.response.PaymentDetailResponseDto;
import com.example.elearning.model.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(source = "student.fullName", target = "studentName")
    @Mapping(source = "course.title", target = "courseName")
    @Mapping(source = "createdAt", target = "transactionDate")
    PaymentAdminItemDto toPaymentAdminItemDto(Payment payment);

    default PaymentDetailResponseDto toPaymentDetailResponseDto(Payment payment) {
        if (payment == null) {
            return null;
        }

        PaymentDetailResponseDto.TransactionInfo transactionInfo = PaymentDetailResponseDto.TransactionInfo.builder()
                .transactionCode(payment.getTransactionCode())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus() != null ? payment.getPaymentStatus().name() : null)
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .build();

        PaymentDetailResponseDto.StudentInfo studentInfo = null;
        if (payment.getStudent() != null) {
            studentInfo = PaymentDetailResponseDto.StudentInfo.builder()
                    .studentId(payment.getStudent().getUserId())
                    .fullName(payment.getStudent().getFullName())
                    .email(payment.getStudent().getEmail())
                    .build();
        }

        PaymentDetailResponseDto.CourseInfo courseInfo = null;
        if (payment.getCourse() != null) {
            courseInfo = PaymentDetailResponseDto.CourseInfo.builder()
                    .courseId(payment.getCourse().getCourseId())
                    .title(payment.getCourse().getTitle())
                    .build();
        }

        return PaymentDetailResponseDto.builder()
                .paymentId(payment.getPaymentId())
                .transactionInfo(transactionInfo)
                .studentInfo(studentInfo)
                .courseInfo(courseInfo)
                .build();
    }
}
