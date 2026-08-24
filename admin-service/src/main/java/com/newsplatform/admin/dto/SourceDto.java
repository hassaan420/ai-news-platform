package com.newsplatform.admin.dto;

import java.time.Instant;

public record SourceDto(
        Long id,
        String provider,
        String name,
        String endpoint,
        String status,
        Instant createdAt,
        Instant updatedAt
) {}
