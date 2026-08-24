package com.newsplatform.search.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "news-service", url = "${feign.client.news-service.url:http://news-service:8082}")
public interface NewsServiceClient {

    @GetMapping("/internal/articles/search")
    Object searchArticles(
        @RequestParam(value = "q") String q,
        @RequestParam(value = "category", required = false) String category,
        @RequestParam(value = "source", required = false) String source,
        @RequestParam(value = "author", required = false) String author,
        @RequestParam(value = "dateFrom", required = false) String dateFrom,
        @RequestParam(value = "dateTo", required = false) String dateTo,
        @RequestParam(value = "page", defaultValue = "0") int page,
        @RequestParam(value = "size", defaultValue = "20") int size,
        @RequestParam(value = "sortBy", defaultValue = "publishedAt") String sortBy,
        @RequestParam(value = "direction", defaultValue = "DESC") String direction
    );
}
