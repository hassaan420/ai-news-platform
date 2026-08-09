package com.newsplatform.category.controller;

import com.newsplatform.category.dto.CategoryDto;
import com.newsplatform.category.dto.CategoryRequest;
import com.newsplatform.common.dto.PagedResponse;
import com.newsplatform.category.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Category API", description = "Endpoints for managing categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "Get all categories paginated")
    public ResponseEntity<PagedResponse<CategoryDto>> getAllCategories(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(categoryService.getAllCategories(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get category by slug")
    public ResponseEntity<CategoryDto> getCategoryBySlug(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(categoryService.getCategoryBySlug(slug));
    }

    @PostMapping
    @Operation(summary = "Create a new category (Admin/Internal only)")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing category (Admin/Internal only)")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable("id") Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category (Admin/Internal only)")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
