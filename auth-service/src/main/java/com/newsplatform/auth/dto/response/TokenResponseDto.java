package com.newsplatform.auth.dto.response;

/**
 * Token pair response DTO record per API_SPEC.md §4.4.
 */
public record TokenResponseDto(
    String accessToken,
    String refreshToken,
    long expiresIn,
    UserResponseDto user
) {
}
