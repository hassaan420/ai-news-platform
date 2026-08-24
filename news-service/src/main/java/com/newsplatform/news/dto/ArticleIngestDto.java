package com.newsplatform.news.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record ArticleIngestDto(
    @NotBlank(message = "Title is required")
    String title,
    
    @NotBlank(message = "Description is required")
    String description,
    
    String content,
    String image,
    
    @NotBlank(message = "URL is required")
    String url,
    
    String author,
    
    @NotNull(message = "Source ID is required")
    Long sourceId,
    
    @NotBlank(message = "Category Slug is required")
    String categorySlug,
    
    @NotNull(message = "Published At is required")
    Instant publishedAt
) {}
