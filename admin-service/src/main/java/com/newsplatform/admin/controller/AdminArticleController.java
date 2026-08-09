package com.newsplatform.admin.controller;

import com.newsplatform.admin.client.NewsServiceClient;
import com.newsplatform.admin.dto.AdminArticleDto;
import com.newsplatform.admin.dto.PagedResponse;
import com.newsplatform.admin.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/articles")
@Tag(name = "Admin Article Management API")
public class AdminArticleController {

    private final NewsServiceClient newsServiceClient;
    private final AuditLogService auditLogService;

    public AdminArticleController(NewsServiceClient newsServiceClient, AuditLogService auditLogService) {
        this.newsServiceClient = newsServiceClient;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @Operation(summary = "Get paginated articles")
    public ResponseEntity<PagedResponse<AdminArticleDto>> getArticles(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "publishedAt") String sortBy,
            @RequestParam(value = "direction", defaultValue = "DESC") String direction) {
        return ResponseEntity.ok(newsServiceClient.getArticles(page, size, sortBy, direction));
    }

    @PutMapping("/{id}/feature")
    @Operation(summary = "Feature/unfeature article")
    public ResponseEntity<AdminArticleDto> featureArticle(@PathVariable Long id, @RequestParam("featured") boolean featured) {
        AdminArticleDto article = newsServiceClient.featureArticle(id, featured);
        auditLogService.logAction("FEATURE_ARTICLE", "Article", String.valueOf(id), "Set featured to " + featured);
        return ResponseEntity.ok(article);
    }

    @PutMapping("/{id}/hide")
    @Operation(summary = "Hide/unhide article")
    public ResponseEntity<AdminArticleDto> hideArticle(@PathVariable Long id, @RequestParam("hidden") boolean hidden) {
        AdminArticleDto article = newsServiceClient.hideArticle(id, hidden);
        auditLogService.logAction("HIDE_ARTICLE", "Article", String.valueOf(id), "Set hidden to " + hidden);
        return ResponseEntity.ok(article);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete article")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        newsServiceClient.deleteArticle(id);
        auditLogService.logAction("DELETE_ARTICLE", "Article", String.valueOf(id), "Deleted article");
        return ResponseEntity.noContent().build();
    }
}
