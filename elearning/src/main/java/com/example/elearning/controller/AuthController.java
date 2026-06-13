package com.example.elearning.controller;

import com.example.elearning.dto.request.LoginRequestDto;
import com.example.elearning.dto.request.UserRegisterRequestDto;
import com.example.elearning.dto.response.LoginResponseDto;
import com.example.elearning.dto.response.UserRegisterResponseDto;
import com.example.elearning.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserRegisterRequestDto requestDto) {
        
        // Gọi tầng Service để xử lý nghiệp vụ đăng ký
        UserRegisterResponseDto data = authService.registerUser(requestDto);

        // Bọc dữ liệu trả về theo đúng chuẩn JSON trong Case 1 của register.md
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đăng ký tài khoản thành công");
        response.put("data", data);

        // Trả về HTTP Status 201 Created
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequestDto requestDto) {
        
        // Gọi tầng Service để xử lý nghiệp vụ đăng nhập (Sinh Token, kiểm tra mật khẩu...)
        LoginResponseDto data = authService.login(requestDto);

        // Bọc dữ liệu trả về theo đúng chuẩn JSON trong Case 1 của login.md
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đăng nhập thành công");
        response.put("data", data);

        // Trả về HTTP Status 200 OK
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
