package com.newsplatform.news.dto;

import java.time.Instant;

/** Response DTO for Source — excludes sensitive apiKey field. */
public record SourceDto(
    Long id,
    String provider,
    String name,
    String endpoint,
    String status,
    String url,
    int scrapingFrequency,
    String parserType,
    Instant lastScrapedTime,
    String lastScrapeStatus,
    long totalArticlesScraped,
    Instant createdAt,
    Instant updatedAt
) implements java.io.Serializable {}
