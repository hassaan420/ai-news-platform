package com.newsplatform.news.dto;

public record SourceDto(
    Long id,
    String provider,
    String name,
    String endpoint,
    String status
) implements java.io.Serializable {}
