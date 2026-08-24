package com.newsplatform.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "category-service", url = "${feign.client.category-service.url:http://category-service:8083}")
public interface CategoryServiceClient {

    @GetMapping("/internal/admin/categories")
    List<com.newsplatform.admin.dto.CategoryDto> getAllCategories();

    @PostMapping("/internal/admin/categories")
    com.newsplatform.admin.dto.CategoryDto createCategory(@RequestBody com.newsplatform.admin.dto.CategoryRequest request);

    @PutMapping("/internal/admin/categories/{id}")
    com.newsplatform.admin.dto.CategoryDto updateCategory(@PathVariable("id") Long id, @RequestBody com.newsplatform.admin.dto.CategoryRequest request);

    @DeleteMapping("/internal/admin/categories/{id}")
    void deleteCategory(@PathVariable("id") Long id);
}
