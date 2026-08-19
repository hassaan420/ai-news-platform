package com.newsplatform.news.dto;

public record VerificationConflictDto(
    Long id,
    String claimText,
    String conflictingSourceUrl
) implements java.io.Serializable {}
