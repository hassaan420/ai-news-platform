package com.newsplatform.news.dto;

import java.time.Instant;
import java.util.List;

public record NewsResponse(
    Long id,
    String title,
    String description,
    String content,
    String image,
    String url,
    String author,
    String language,
    Instant publishedAt,
    String hash,
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
    List<String> keywords,
    List<String> tags,
    List<NewsSummaryResponse> relatedArticles
) {
}
