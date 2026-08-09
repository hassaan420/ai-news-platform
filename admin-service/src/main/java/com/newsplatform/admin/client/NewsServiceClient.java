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
}
