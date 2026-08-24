package com.newsplatform.category.service;

import com.newsplatform.category.dto.CategoryDto;
import com.newsplatform.category.dto.CategoryRequest;
import com.newsplatform.common.dto.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    CategoryDto getCategoryById(Long id);
    CategoryDto getCategoryBySlug(String slug);
    PagedResponse<CategoryDto> getAllCategories(Pageable pageable);
    List<CategoryDto> getAllActiveCategories();
    List<Long> getValidCategoryIds();
    CategoryDto createCategory(CategoryRequest request);
    CategoryDto updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
}
