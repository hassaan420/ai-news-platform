package com.newsplatform.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Registration request DTO record.
 */
public record RegisterRequestDto(
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Size(max = 190, message = "Email cannot exceed 190 characters")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters long")
    String password
) {
}
