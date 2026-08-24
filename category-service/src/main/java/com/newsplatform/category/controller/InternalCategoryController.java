package com.newsplatform.category.controller;

import com.newsplatform.category.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/internal/categories")
@Tag(name = "Internal Category API", description = "Internal endpoints for category service")
public class InternalCategoryController {

    private final CategoryService categoryService;

    public InternalCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/valid-ids")
    @Operation(summary = "Get all valid active category IDs")
    public ResponseEntity<List<Long>> getValidCategoryIds() {
        return ResponseEntity.ok(categoryService.getValidCategoryIds());
    }
}
