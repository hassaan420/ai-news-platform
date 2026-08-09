package com.newsplatform.news.dto;

import java.time.Instant;

public record FetchLogDto(
    Long id,
    Long sourceId,
    String status,
    int articlesFetched,
    int articlesStored,
    int duplicatesSkipped,
    String errorMessage,
    Instant fetchedAt,
    int executionTimeMs
) {}
