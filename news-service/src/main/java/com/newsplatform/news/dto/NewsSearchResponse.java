package com.newsplatform.news.dto;

import java.time.Instant;

public record NewsSearchResponse(
    Long id,
    String title,
    String description,
    String url,
    Instant publishedAt,
    SourceDto source,
    Double searchScore
) {
}
