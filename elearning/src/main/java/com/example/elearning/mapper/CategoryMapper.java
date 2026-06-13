package com.example.elearning.mapper;

import com.example.elearning.dto.response.CategoryResponseDto;
import com.example.elearning.model.Category;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    public CategoryResponseDto toDto(Category category) {
        if (category == null) return null;
        CategoryResponseDto dto = new CategoryResponseDto();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        return dto;
    }

    public List<CategoryResponseDto> toDtoList(List<Category> categories) {
        if (categories == null) return null;
        return categories.stream().map(this::toDto).collect(Collectors.toList());
    }
}
