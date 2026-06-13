package com.example.elearning.controller;

import com.example.elearning.dto.response.CategoryResponseDto;
import com.example.elearning.mapper.CategoryMapper;
import com.example.elearning.model.Category;
import com.example.elearning.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryResponseDto> data = categoryMapper.toDtoList(categories);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách danh mục thành công");
        response.put("data", data);

        return ResponseEntity.ok(response);
    }
}
