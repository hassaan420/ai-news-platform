package com.newsplatform.auth.dto.response;

import com.newsplatform.auth.model.Role;
import java.time.Instant;

public record AdminUserResponseDto(
    Long id,
    String name,
    String email,
    Role role,
    boolean enabled,
    boolean deleted,
    Instant createdAt
) {
}
