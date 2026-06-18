package com.example.elearning.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.example.elearning.model.enums.VideoType;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "videos", schema = "elearning")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "video_id")
    private Long videoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(name = "video_type", nullable = false, length = 20)
    private VideoType videoType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_file_id")
    private FileEntity videoFile;

    @Column(name = "youtube_url", length = 500)
    private String youtubeUrl;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
