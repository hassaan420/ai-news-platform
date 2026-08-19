package com.newsplatform.news.dto;

import java.time.Instant;
import java.util.List;

public record ArticleDto(
    Long id,
    String title,
    String description,
    String content,
    String image,
    String url,
    String author,
    String publisher,
    CategorySummaryDto category,
    SourceDto source,
    Instant publishedAt,
    List<ArticleSummaryDto> relatedArticles
) {}
