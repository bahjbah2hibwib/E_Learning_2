package com.example.elearning.mapper;

import com.example.elearning.dto.request.UserRegisterRequestDto;
import com.example.elearning.dto.request.AdminUserCreateRequestDto;
import com.example.elearning.dto.request.AdminUserUpdateRequestDto;
import com.example.elearning.dto.response.LoginResponseDto.UserLoginDto;
import com.example.elearning.dto.response.UserItemResponseDto;
import com.example.elearning.dto.response.UserRegisterResponseDto;
import com.example.elearning.dto.response.AdminUserCreateResponseDto;
import com.example.elearning.dto.response.UserDetailResponseDto;
import com.example.elearning.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "avatarFile", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toEntity(UserRegisterRequestDto requestDto);

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "avatarFile", ignore = true) // Cần tự query DB để lấy avatarFile
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(AdminUserCreateRequestDto requestDto);

    UserRegisterResponseDto toResponseDto(User user);

    @Mapping(source = "avatarFile.fileId", target = "avatarFileId")
    UserLoginDto toUserLoginDto(User user);

    @Mapping(target = "avatarUrl", ignore = true)
    UserItemResponseDto toUserItemResponseDto(User user);

    @Mapping(source = "avatarFile.fileId", target = "avatarFileId")
    AdminUserCreateResponseDto toAdminUserCreateResponseDto(User user);

    // Lưu ý: avatarUrl sẽ được set thủ công bằng MinioService ở tầng Service, ở đây ta chỉ ignore hoặc map tự động các trường cùng tên
    @Mapping(target = "avatarUrl", ignore = true)
    UserDetailResponseDto toUserDetailResponseDto(User user);

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "avatarFile", ignore = true) // Sẽ được xử lý riêng ở Service
    @Mapping(target = "passwordHash", ignore = true) // Sẽ được mã hóa và set ở Service nếu có thay đổi
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateUserFromAdminDto(AdminUserUpdateRequestDto requestDto, @MappingTarget User user);
}
