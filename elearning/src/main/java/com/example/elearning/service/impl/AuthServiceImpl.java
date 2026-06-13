package com.example.elearning.service.impl;

import com.example.elearning.dto.request.LoginRequestDto;
import com.example.elearning.dto.request.UserRegisterRequestDto;
import com.example.elearning.dto.response.LoginResponseDto;
import com.example.elearning.dto.response.UserRegisterResponseDto;
import com.example.elearning.exception.AccountLockedException;
import com.example.elearning.exception.InvalidCredentialsException;
import com.example.elearning.exception.UserAlreadyExistsException;
import com.example.elearning.mapper.UserMapper;
import com.example.elearning.model.User;
import com.example.elearning.model.Notification;
import com.example.elearning.model.SystemActivity;
import com.example.elearning.repository.NotificationRepository;
import com.example.elearning.repository.SystemActivityRepository;
import com.example.elearning.repository.UserRepository;
import com.example.elearning.security.JwtTokenProvider;
import com.example.elearning.service.AuthService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final SystemActivityRepository systemActivityRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public UserRegisterResponseDto registerUser(UserRegisterRequestDto requestDto) {
        // Step 2: Kiểm tra sự tồn tại của Email
        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new UserAlreadyExistsException(
                    "Email này đã được sử dụng. Vui lòng sử dụng email khác.", 
                    "EMAIL_ALREADY_EXISTS"
            );
        }

        // Kiểm tra sự tồn tại của Số điện thoại (Chỉ kiểm tra nếu có nhập)
        if (requestDto.getPhone() != null && !requestDto.getPhone().isEmpty() && userRepository.existsByPhone(requestDto.getPhone())) {
            throw new UserAlreadyExistsException(
                    "Số điện thoại này đã được sử dụng. Vui lòng sử dụng số điện thoại khác.", 
                    "PHONE_ALREADY_EXISTS"
            );
        }

        // Step 3: Ánh xạ từ DTO sang Entity
        User user = userMapper.toEntity(requestDto);

        // Bắt buộc mã hóa mật khẩu bằng BCrypt
        user.setPasswordHash(passwordEncoder.encode(requestDto.getPassword()));

        // Tự động gán cứng giá trị vai trò mặc định là Học viên
        user.setRole(com.example.elearning.model.enums.UserRole.ROLE_STUDENT);

        // Tự động gán giá trị status = TRUE cho tài khoản mới
        user.setStatus(true);

        // Step 4: Lưu xuống DB
        User savedUser = userRepository.save(user);

        // --- TỰ ĐỘNG GHI LOG VÀ BẮN THÔNG BÁO CHO ADMIN ---
        try {
            SystemActivity activity = SystemActivity.builder()
                    .actor(savedUser)
                    .actionType("REGISTER")
                    .targetId(savedUser.getUserId())
                    .targetType("USER")
                    .metadata("{\"email\":\"" + savedUser.getEmail() + "\"}")
                    .build();
            SystemActivity savedActivity = systemActivityRepository.save(activity);

            List<User> admins = userRepository.findByRole(com.example.elearning.model.enums.UserRole.ROLE_ADMIN);
            for (User admin : admins) {
                Notification notif = Notification.builder()
                        .user(admin)
                        .activity(savedActivity)
                        .title("🎉 Tài khoản mới")
                        .message("Học viên <b>" + savedUser.getFullName() + "</b> vừa đăng ký tài khoản thành công.")
                        .type("NEW_USER_ALERT")
                        .isRead(false)
                        .build();
                notificationRepository.save(notif);
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi tạo thông báo: " + e.getMessage());
        }

        // Step 5: Ánh xạ kết quả trả về ResponseDTO
        return userMapper.toResponseDto(savedUser);
    }

    @Override
    public LoginResponseDto login(LoginRequestDto requestDto) {
        // Step 2: Tìm kiếm người dùng
        User user = userRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException(
                        "Email không chính xác. Vui lòng thử lại.",
                        "INVALID_CREDENTIALS"
                ));

        // Step 3: Kiểm tra trạng thái tài khoản
        if (!user.getStatus()) {
            throw new AccountLockedException(
                    "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để được hỗ trợ.",
                    "ACCOUNT_LOCKED"
            );
        }

        // Step 4: Xác thực mật khẩu
        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException(
                    "Mật khẩu không chính xác. Vui lòng thử lại.",
                    "INVALID_CREDENTIALS"
            );
        }


        // Step 5: Sinh JWT Token và Map kết quả
        String token = jwtTokenProvider.generateToken(user);

        return LoginResponseDto.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpiration())
                .user(userMapper.toUserLoginDto(user))
                .build();
    }
}
