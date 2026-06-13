package com.example.elearning.service;

import com.example.elearning.model.FileEntity;
import org.springframework.web.multipart.MultipartFile;

public interface MinioService {
    FileEntity uploadFile(MultipartFile file);
    String getPreSignedUrl(String objectName);
    java.util.Map<String, String> generatePresignedUploadUrl(String originalFilename, String contentType);
    FileEntity confirmUpload(String originalFilename, String objectName, String contentType, Long fileSize);
}
