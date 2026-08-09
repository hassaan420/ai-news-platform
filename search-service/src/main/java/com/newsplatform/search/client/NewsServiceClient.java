package com.newsplatform.search.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "news-service", url = "${feign.client.news-service.url:http://news-service:8082}")
public interface NewsServiceClient {

    @GetMapping("/api/news/search")
    Object searchArticles(
        @RequestParam(value = "keyword", required = false) String keyword,
        @RequestParam(value = "page", defaultValue = "0") int page,
        @RequestParam(value = "size", defaultValue = "20") int size,
        @RequestParam(value = "sortBy", defaultValue = "publishedAt") String sortBy,
        @RequestParam(value = "direction", defaultValue = "DESC") String direction
    );
}
