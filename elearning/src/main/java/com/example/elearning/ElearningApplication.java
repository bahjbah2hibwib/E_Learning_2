package com.example.elearning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableCaching
public class ElearningApplication {
    
    public static void main(String[] args) {
        // Thiết lập TimeZone mặc định cho toàn bộ ứng dụng JVM (Khắc phục lỗi Asia/Saigon của PostgreSQL)
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(ElearningApplication.class, args);
    }

}
