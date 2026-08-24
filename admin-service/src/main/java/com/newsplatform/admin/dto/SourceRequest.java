package com.newsplatform.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SourceRequest(
        @NotBlank(message = "Provider is required")
        @Size(max = 50)
        String provider,

        @NotBlank(message = "Name is required")
        @Size(max = 100)
        String name,

        String apiKey,

        @NotBlank(message = "Endpoint is required")
        @Size(max = 500)
        String endpoint,

        String status
) {}
