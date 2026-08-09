package com.newsplatform.news.controller;

import com.newsplatform.common.dto.PagedResponse;
import com.newsplatform.news.dto.NewsSummaryResponse;
import com.newsplatform.news.service.SavedArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/news")
@Tag(name = "Saved Articles API", description = "Endpoints for managing saved articles")
public class SavedArticleController {

    private final SavedArticleService savedArticleService;

    public SavedArticleController(SavedArticleService savedArticleService) {
        this.savedArticleService = savedArticleService;
    }

    @PostMapping("/{id}/save")
    @Operation(summary = "Save an article")
    public ResponseEntity<Void> saveArticle(@PathVariable("id") Long articleId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        savedArticleService.saveArticle(userId, articleId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/save")
    @Operation(summary = "Unsave an article")
    public ResponseEntity<Void> unsaveArticle(@PathVariable("id") Long articleId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        savedArticleService.unsaveArticle(userId, articleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/saved")
    @Operation(summary = "Get saved articles")
    public ResponseEntity<PagedResponse<NewsSummaryResponse>> getSavedArticles(
            @PageableDefault(size = 20) Pageable pageable) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(savedArticleService.getSavedArticles(userId, pageable));
    }

    private Long getCurrentUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser") || auth.getName().equals("internal-service")) {
            return null;
        }
        try {
            return Long.parseLong(auth.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
