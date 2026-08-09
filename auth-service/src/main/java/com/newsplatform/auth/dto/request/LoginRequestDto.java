package com.newsplatform.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Login request DTO record.
 */
public record LoginRequestDto(
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    String email,

    @NotBlank(message = "Password is required")
    String password
) {
}
