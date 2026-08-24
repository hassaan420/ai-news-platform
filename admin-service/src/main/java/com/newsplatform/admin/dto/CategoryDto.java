package com.newsplatform.admin.dto;

import java.time.Instant;

public record CategoryDto(
        Long id,
        String title,
        String slug,
        String icon,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {}
