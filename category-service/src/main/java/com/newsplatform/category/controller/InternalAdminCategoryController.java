package com.newsplatform.category.controller;

import com.newsplatform.category.dto.CategoryDto;
import com.newsplatform.category.dto.CategoryRequest;
import com.newsplatform.category.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal/admin/categories")
@Tag(name = "Internal Admin Category API", description = "Endpoints for admin category management via admin-service")
public class InternalAdminCategoryController {

    private final CategoryService categoryService;

    public InternalAdminCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "Get all active categories for admin")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllActiveCategories());
    }

    @PostMapping
    @Operation(summary = "Create a new category (Internal Admin)")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing category (Internal Admin)")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable("id") Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category (Internal Admin)")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
