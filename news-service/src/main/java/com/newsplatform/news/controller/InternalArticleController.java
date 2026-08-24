package com.newsplatform.news.controller;

import com.newsplatform.news.dto.NewsRequest;
import com.newsplatform.news.dto.NewsResponse;
import com.newsplatform.news.dto.ArticleIngestDto;
import com.newsplatform.news.dto.IngestionResultDto;
import com.newsplatform.news.service.ArticleService;
import com.newsplatform.news.service.IngestionPipelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal/news")
@Tag(name = "Internal News API", description = "Endpoints for news ingestion and management")
public class InternalArticleController {

    private final ArticleService articleService;
    private final IngestionPipelineService ingestionPipelineService;

    public InternalArticleController(ArticleService articleService, IngestionPipelineService ingestionPipelineService) {
        this.articleService = articleService;
        this.ingestionPipelineService = ingestionPipelineService;
    }

    @PostMapping("/ingest")
    @Operation(summary = "Ingest articles from scheduler")
    public ResponseEntity<IngestionResultDto> ingestArticles(@Valid @RequestBody List<ArticleIngestDto> requests) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ingestionPipelineService.ingestArticles(requests));
    }

    @PostMapping
    @Operation(summary = "Create a single news article")
    public ResponseEntity<NewsResponse> createInternalNews(@Valid @RequestBody NewsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(articleService.createInternalNews(request));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Create multiple news articles")
    public ResponseEntity<List<NewsResponse>> createInternalNewsBulk(@Valid @RequestBody List<NewsRequest> requests) {
        return ResponseEntity.status(HttpStatus.CREATED).body(articleService.createInternalNewsBulk(requests));
    }

    @PostMapping("/deduplicate")
    @Operation(summary = "Trigger article deduplication process")
    public ResponseEntity<String> deduplicateNews() {
        int count = articleService.deduplicateNews();
        return ResponseEntity.ok("Deduplication completed. Removed " + count + " duplicates.");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an article")
    public ResponseEntity<Void> deleteInternalNews(@PathVariable("id") Long id) {
        articleService.deleteInternalNews(id);
        return ResponseEntity.noContent().build();
    }
}
