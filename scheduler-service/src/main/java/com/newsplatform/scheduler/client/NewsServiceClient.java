package com.newsplatform.scheduler.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Map;

@FeignClient(name = "news-service", url = "${feign.client.news-service.url:http://news-service:8082}")
public interface NewsServiceClient {

    @PostMapping("/internal/news/bulk")
    void saveBulkNews(
        @RequestHeader("Internal-Api-Key") String token, 
        @RequestBody List<Map<String, Object>> articles
    );
}
