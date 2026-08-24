package com.newsplatform.admin.dto;

import java.time.Instant;

public record FetchLogDto(
        Long id,
        Long sourceId,
        String status,
        Integer articlesFetched,
        Integer articlesStored,
        Integer duplicatesSkipped,
        String errorMessage,
        Instant fetchedAt,
        Long executionTimeMs
) {}
