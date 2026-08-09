package com.newsplatform.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Token refresh / logout request DTO record.
 */
public record RefreshTokenRequestDto(
    @NotBlank(message = "Refresh token is required")
    String refreshToken
) {
}
