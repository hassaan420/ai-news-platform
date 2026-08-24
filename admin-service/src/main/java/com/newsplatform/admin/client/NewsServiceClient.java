package com.newsplatform.admin.client;

import com.newsplatform.admin.dto.AdminArticleDto;
import com.newsplatform.admin.dto.PagedResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "news-service", url = "${feign.client.news-service.url:http://news-service:8082}")
public interface NewsServiceClient {
    @GetMapping("/internal/admin/articles/count")
    long getArticleCount();

    @GetMapping("/api/news/admin/ai/analytics")
    java.util.Map<String, Object> getAiAnalytics();

    @GetMapping("/internal/admin/articles")
    PagedResponse<AdminArticleDto> getArticles(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sortBy") String sortBy,
            @RequestParam("direction") String direction);

    @PutMapping("/internal/admin/articles/{id}/feature")
    AdminArticleDto featureArticle(@PathVariable("id") Long id, @RequestParam("featured") boolean featured);

    @PutMapping("/internal/admin/articles/{id}/hide")
    AdminArticleDto hideArticle(@PathVariable("id") Long id, @RequestParam("hidden") boolean hidden);

    @DeleteMapping("/internal/admin/articles/{id}")
    void deleteArticle(@PathVariable("id") Long id);

    @GetMapping("/internal/admin/sources")
    PagedResponse<com.newsplatform.admin.dto.SourceDto> getSources(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sortBy") String sortBy,
            @RequestParam("direction") String direction,
            @RequestParam(value = "status", required = false) String status);

    @PostMapping("/internal/admin/sources")
    com.newsplatform.admin.dto.SourceDto createSource(@RequestBody com.newsplatform.admin.dto.SourceRequest request);

    @PutMapping("/internal/admin/sources/{id}")
    com.newsplatform.admin.dto.SourceDto updateSource(@PathVariable("id") Long id, @RequestBody com.newsplatform.admin.dto.SourceRequest request);

    @DeleteMapping("/internal/admin/sources/{id}")
    void deleteSource(@PathVariable("id") Long id);

    @GetMapping("/internal/fetch-logs")
    PagedResponse<com.newsplatform.admin.dto.FetchLogDto> getFetchLogs(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sortBy") String sortBy,
            @RequestParam("direction") String direction,
            @RequestParam(value = "status", required = false) String status);
}
