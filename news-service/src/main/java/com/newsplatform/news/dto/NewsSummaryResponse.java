package com.newsplatform.news.dto;

import java.time.Instant;

public record NewsSummaryResponse(
    Long id,
    String title,
    String description,
    String image,
    String url,
    String author,
    Instant publishedAt,
    Long categoryId,
    SourceDto source,
    String summary,
    String sentiment,
    Double sentimentScore,
    Integer readingTime,
    String topicClassification,
    Double recommendationScore,
    Double trendingScore,
    Double aiConfidence,
    String processingStatus,
    Instant processedAt,
    java.util.List<String> keywords,
    java.util.List<String> tags
) implements java.io.Serializable {
}
