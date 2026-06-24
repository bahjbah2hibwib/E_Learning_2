package com.example.elearning.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateRequestDto {

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ và tên không được vượt quá 100 ký tự")
    private String fullName;

    // Cho phép null (để giữ nguyên mật khẩu cũ), nhưng nếu có truyền thì phải >= 6 ký tự
    @Size(min = 6, max = 255, message = "Mật khẩu phải có từ 6 đến 255 ký tự")
    private String password;

    @Positive(message = "ID của file ảnh đại diện phải là số dương")
    private Long avatarFileId;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phone;

    @Past(message = "Ngày sinh phải là một ngày trong quá khứ")
    private LocalDate dateOfBirth;
}
