package com.newsplatform.news.controller;

import com.newsplatform.news.dto.NewsResponse;
import com.newsplatform.news.dto.NewsSearchResponse;
import com.newsplatform.news.dto.NewsSummaryResponse;
import com.newsplatform.common.dto.PagedResponse;
import com.newsplatform.news.service.ArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/news")
@Tag(name = "Public News API", description = "Endpoints for fetching and searching news articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    @Operation(summary = "Get all news articles paginated")
    public ResponseEntity<PagedResponse<NewsSummaryResponse>> getArticles(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(articleService.getArticles(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a news article by ID")
    public ResponseEntity<NewsResponse> getArticleById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(articleService.getArticleById(id));
    }

    @GetMapping("/latest")
    @Operation(summary = "Get latest news articles")
    public ResponseEntity<PagedResponse<NewsSummaryResponse>> getLatestArticles(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(articleService.getLatestArticles(pageable));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending news articles")
    public ResponseEntity<PagedResponse<NewsSummaryResponse>> getTrendingArticles(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(articleService.getTrendingArticles(pageable));
    }

    @GetMapping("/category/{slug}")
    @Operation(summary = "Get news articles by category slug")
    public ResponseEntity<PagedResponse<NewsSummaryResponse>> getArticlesByCategorySlug(
            @PathVariable("slug") String slug, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(articleService.getArticlesByCategorySlug(slug, pageable));
    }

    @GetMapping("/source/{sourceId}")
    @Operation(summary = "Get news articles by source")
    public ResponseEntity<PagedResponse<NewsSummaryResponse>> getArticlesBySource(
            @PathVariable("sourceId") Long sourceId, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(articleService.getArticlesBySource(sourceId, pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Search news articles by keyword")
    public ResponseEntity<PagedResponse<NewsSearchResponse>> searchArticles(
            @RequestParam("keyword") String keyword, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(articleService.searchArticles(keyword, pageable));
    }
}
