package com.newsplatform.news.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating or updating a Source.
 */
public record SourceRequest(
        @NotBlank(message = "Provider is required")
        @Size(max = 50, message = "Provider must not exceed 50 characters")
        String provider,

        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must not exceed 100 characters")
        String name,

        String apiKey,

        @NotBlank(message = "Endpoint is required")
        @Size(max = 500, message = "Endpoint must not exceed 500 characters")
        String endpoint,

        String status
) {}
