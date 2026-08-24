package com.newsplatform.admin.controller;

import com.newsplatform.admin.client.CategoryServiceClient;
import com.newsplatform.admin.dto.CategoryDto;
import com.newsplatform.admin.dto.CategoryRequest;
import com.newsplatform.admin.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@Tag(name = "Admin Category API")
public class AdminCategoryController {

    private final CategoryServiceClient categoryServiceClient;
    private final AuditLogService auditLogService;

    public AdminCategoryController(CategoryServiceClient categoryServiceClient, AuditLogService auditLogService) {
        this.categoryServiceClient = categoryServiceClient;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @Operation(summary = "Get all active categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(categoryServiceClient.getAllCategories());
    }

    @PostMapping
    @Operation(summary = "Create a new category")
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryRequest request) {
        CategoryDto category = categoryServiceClient.createCategory(request);
        auditLogService.logAction("CREATE_CATEGORY", "Category", String.valueOf(category.id()), "Created category: " + category.title());
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing category")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        CategoryDto category = categoryServiceClient.updateCategory(id, request);
        auditLogService.logAction("UPDATE_CATEGORY", "Category", String.valueOf(id), "Updated category: " + category.title());
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryServiceClient.deleteCategory(id);
        auditLogService.logAction("DELETE_CATEGORY", "Category", String.valueOf(id), "Deleted category");
        return ResponseEntity.noContent().build();
    }
}
