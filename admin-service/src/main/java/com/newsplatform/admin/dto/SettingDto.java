package com.newsplatform.admin.dto;

import java.time.Instant;

public record SettingDto(
    Long id,
    String settingKey,
    String settingValue,
    Instant createdAt,
    Instant updatedAt
) {}
