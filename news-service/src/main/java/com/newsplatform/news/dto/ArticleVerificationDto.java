package com.newsplatform.news.dto;

import java.time.Instant;
import java.util.List;

import java.io.Serializable;

public record ArticleVerificationDto(
    Long id,
    String status,
    int verificationScore,
    int sourcesFound,
    int independentSources,
    Instant lastVerifiedAt,
    List<VerificationSourceDto> sources,
    List<VerificationConflictDto> conflicts
) implements Serializable {}
