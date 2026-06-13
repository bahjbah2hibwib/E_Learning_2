package com.example.elearning.service;

import com.example.elearning.dto.request.LoginRequestDto;
import com.example.elearning.dto.request.UserRegisterRequestDto;
import com.example.elearning.dto.response.LoginResponseDto;
import com.example.elearning.dto.response.UserRegisterResponseDto;

public interface AuthService {
    UserRegisterResponseDto registerUser(UserRegisterRequestDto requestDto);
    
    LoginResponseDto login(LoginRequestDto requestDto);
}
