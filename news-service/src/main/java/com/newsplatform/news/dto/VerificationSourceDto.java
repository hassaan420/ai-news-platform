package com.newsplatform.news.dto;

import java.io.Serializable;
import java.time.Instant;

public record VerificationSourceDto(
    Long id,
    String sourceName,
    String url,
    Instant publishedAt,
    Double similarityScore,
    String relationship
) implements Serializable {}
