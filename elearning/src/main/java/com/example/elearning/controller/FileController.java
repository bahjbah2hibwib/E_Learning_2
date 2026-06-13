package com.example.elearning.controller;

import com.example.elearning.model.FileEntity;
import com.example.elearning.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final MinioService minioService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        // Tạm thời chưa yêu cầu Auth để tiện test, nếu muốn có thể check JWT ở đây sau
        
        FileEntity savedFile = minioService.uploadFile(file);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Upload file thành công");
        response.put("data", savedFile); // Trả về toàn bộ thông tin FileEntity để Frontend lấy fileId

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    @GetMapping("/presigned-url")
    public ResponseEntity<Map<String, Object>> getPresignedUrl(
            @RequestParam("fileName") String fileName,
            @RequestParam("contentType") String contentType) {
        
        Map<String, String> data = minioService.generatePresignedUploadUrl(fileName, contentType);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Tạo Presigned URL thành công");
        response.put("data", data);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmUpload(@RequestBody Map<String, Object> payload) {
        String originalFilename = (String) payload.get("originalFilename");
        String objectName = (String) payload.get("objectName");
        String contentType = (String) payload.get("contentType");
        Number fileSize = (Number) payload.get("fileSize");

        FileEntity savedFile = minioService.confirmUpload(
                originalFilename, 
                objectName, 
                contentType, 
                fileSize != null ? fileSize.longValue() : 0L
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Xác nhận upload thành công");
        
        Map<String, Object> data = new HashMap<>();
        data.put("fileId", savedFile.getFileId());
        data.put("fileName", savedFile.getFileName());
        data.put("filePath", savedFile.getFilePath());
        data.put("fileUrl", minioService.getPreSignedUrl(savedFile.getFilePath()));

        response.put("data", data);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
