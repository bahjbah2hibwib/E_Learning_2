package com.example.elearning.dto.request;

import lombok.Data;

@Data
public class VideoAddRequestDto {
    private Long fileId;
    
    private String youtubeUrl;
    
    private String videoType; // "UPLOAD" or "YOUTUBE"
    
    private Integer durationMinutes;
}
