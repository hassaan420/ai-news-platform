package com.newsplatform.admin.dto;

import java.time.Instant;

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
) {}
