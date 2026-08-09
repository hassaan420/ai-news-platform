package com.newsplatform.auth.dto.response;

public record LoginResponseDto(
    String accessToken,
    String refreshToken,
    long expiresIn,
    UserResponseDto user
) {
}
