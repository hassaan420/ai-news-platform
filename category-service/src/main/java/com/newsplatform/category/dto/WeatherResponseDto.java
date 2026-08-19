package com.newsplatform.category.dto;

public record WeatherResponseDto(
    String city,
    Double temperatureCelsius,
    String condition,
    String description,
    String iconCode,
    Integer humidity,
    Double windSpeedKph
) {}
