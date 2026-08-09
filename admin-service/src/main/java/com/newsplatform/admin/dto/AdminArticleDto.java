package com.newsplatform.admin.dto;

import java.time.Instant;

public record AdminArticleDto(
    Long id,
    String title,
    String source,
    String category,
    String author,
    Instant publishedAt,
    String summary,
    String sentiment,
    Double sentimentScore,
    boolean featured,
    boolean hidden
) {
}
