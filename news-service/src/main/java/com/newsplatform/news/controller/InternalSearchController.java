package com.newsplatform.news.controller;

import com.newsplatform.news.dto.NewsSearchResponse;
import com.newsplatform.common.dto.PagedResponse;
import com.newsplatform.news.service.ArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/articles")
@Tag(name = "Internal Article API", description = "Endpoints for inter-service article operations")
public class InternalSearchController {

    private final ArticleService articleService;

    public InternalSearchController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping("/search")
    @Operation(summary = "Search articles (internal use)")
    public ResponseEntity<PagedResponse<NewsSearchResponse>> searchArticles(
            @RequestParam String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @PageableDefault(size = 20) Pageable pageable) {
        
        return ResponseEntity.ok(articleService.searchArticles(q, category, source, author, dateFrom, dateTo, pageable));
    }
}
