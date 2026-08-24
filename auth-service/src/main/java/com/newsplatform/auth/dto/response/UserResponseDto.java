package com.newsplatform.auth.dto.response;

import com.newsplatform.auth.model.Role;

/**
 * User registration / profile response DTO record per API_SPEC.md §4.4.
 */
public record UserResponseDto(
    Long id,
    String name,
    String email,
    Role role,
    String bio
) {
}
