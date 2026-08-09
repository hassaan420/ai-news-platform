package com.newsplatform.admin.dto;

import java.time.Instant;

public record AdminUserDto(
    Long id,
    String name,
    String email,
    String role,
    boolean enabled,
    boolean deleted,
    Instant createdAt
) {
}
