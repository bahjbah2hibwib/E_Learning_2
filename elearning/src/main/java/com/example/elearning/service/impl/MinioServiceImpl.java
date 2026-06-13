package com.example.elearning.service.impl;

import com.example.elearning.model.FileEntity;
import com.example.elearning.repository.FileRepository;
import com.example.elearning.service.MinioService;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;
    private final FileRepository fileRepository;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Override
    public FileEntity uploadFile(MultipartFile file) {
        try {
            // 1. Kiểm tra và tạo bucket nếu chưa có
            boolean isExist = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!isExist) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }

            // 2. Tạo tên file ngẫu nhiên để tránh trùng lặp
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFileName = UUID.randomUUID().toString() + extension;
            
            // Có thể gom theo ngày hoặc loại (ví dụ: avatars/uuid.jpg)
            // Ở đây tạm lưu chung vào thư mục uploads/
            String objectName = "uploads/" + uniqueFileName;

            // 3. Upload file lên MinIO
            try (InputStream is = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectName)
                                .stream(is, file.getSize(), -1)
                                .contentType(file.getContentType())
                                .build()
                );
            }

            // 4. Lưu thông tin file vào Database
            FileEntity fileEntity = FileEntity.builder()
                    .fileName(originalFilename)
                    .filePath(objectName)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .build();
            
            return fileRepository.save(fileEntity);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi upload file lên MinIO: " + e.getMessage(), e);
        }
    }

    @Override
    public String getPreSignedUrl(String objectName) {
        try {
            boolean isExist = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!isExist) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }

            // Tạo link tải file tạm thời (ví dụ sống trong 1 giờ)
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(1, TimeUnit.HOURS)
                            .build()
            );
        } catch (Exception e) {
            // Nếu có lỗi, trả về null hoặc ném exception
            System.err.println("Không thể tạo Presigned URL: " + e.getMessage());
            return null;
        }
    }
    @Override
    public java.util.Map<String, String> generatePresignedUploadUrl(String originalFilename, String contentType) {
        try {
            boolean isExist = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!isExist) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }

            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFileName = UUID.randomUUID().toString() + extension;
            String objectName = "uploads/" + uniqueFileName;

            // Tạo Presigned URL cho thao tác PUT, thời hạn 15 phút
            String presignedUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.PUT)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(15, TimeUnit.MINUTES)
                            .build()
            );

            java.util.Map<String, String> result = new java.util.HashMap<>();
            result.put("presignedUrl", presignedUrl);
            result.put("objectName", objectName);
            result.put("originalFilename", originalFilename);
            result.put("contentType", contentType);

            return result;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo Presigned Upload URL: " + e.getMessage(), e);
        }
    }

    @Override
    public FileEntity confirmUpload(String originalFilename, String objectName, String contentType, Long fileSize) {
        FileEntity fileEntity = FileEntity.builder()
                .fileName(originalFilename)
                .filePath(objectName)
                .fileType(contentType)
                .fileSize(fileSize != null ? fileSize : 0L)
                .build();
        
        return fileRepository.save(fileEntity);
    }
}
