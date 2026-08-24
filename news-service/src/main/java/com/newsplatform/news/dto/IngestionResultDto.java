package com.newsplatform.news.dto;

import java.util.List;

public record IngestionResultDto(
    int articlesFetched,
    int articlesStored,
    int duplicatesSkipped,
    List<String> errors
) {}
