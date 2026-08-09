package com.newsplatform.news.dto;

import java.time.Instant;

public record ArticleSummaryDto(
    Long id,
    String title,
    String description,
    String image,
    String url,
    String author,
    CategorySummaryDto category,
    SourceDto source,
    Instant publishedAt
) {}
