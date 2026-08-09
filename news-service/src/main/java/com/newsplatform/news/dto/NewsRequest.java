package com.newsplatform.news.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record NewsRequest(
    @NotNull(message = "Source ID is required")
    Long sourceId,

    @NotNull(message = "Category ID is required")
    Long categoryId,

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title cannot exceed 500 characters")
    String title,

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    String description,

    String content,

    @Size(max = 1000, message = "Image URL cannot exceed 1000 characters")
    String image,

    @NotBlank(message = "URL is required")
    @Size(max = 1000, message = "URL cannot exceed 1000 characters")
    String url,

    @Size(max = 200, message = "Author cannot exceed 200 characters")
    String author,

    @NotBlank(message = "Language is required")
    @Size(max = 10, message = "Language cannot exceed 10 characters")
    String language,

    @NotNull(message = "Published At is required")
    Instant publishedAt,

    @NotBlank(message = "Hash is required")
    @Size(max = 64, message = "Hash cannot exceed 64 characters")
    String hash
) {
}
