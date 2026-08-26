package com.newsplatform.category.dto;

import java.time.Instant;

public record CategoryDto(
    Long id,
    String title,
    String slug,
    String icon,
    boolean active,
    String keywords,
    int displayOrder,
    long articleCount,
    Instant createdAt,
    Instant updatedAt
) {}
