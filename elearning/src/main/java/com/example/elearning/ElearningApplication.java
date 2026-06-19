package com.example.elearning;

import java.lang.reflect.Array;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ElearningApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ElearningApplication.class, args);

    }

}
