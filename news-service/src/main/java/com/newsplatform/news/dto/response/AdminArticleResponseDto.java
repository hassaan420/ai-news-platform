package com.newsplatform.news.dto.response;

import java.time.Instant;

public record AdminArticleResponseDto(
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
