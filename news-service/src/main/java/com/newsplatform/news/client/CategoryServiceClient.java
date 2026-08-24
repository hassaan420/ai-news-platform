package com.newsplatform.news.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "category-service", url = "${feign.client.category-service.url:http://category-service:8083}")
public interface CategoryServiceClient {

    @GetMapping("/internal/categories/valid-ids")
    List<Long> getValidCategoryIds(@RequestHeader("Internal-Api-Key") String internalApiKey);

    @GetMapping("/api/categories")
    List<com.newsplatform.news.dto.CategoryDto> getAllCategories();
}
