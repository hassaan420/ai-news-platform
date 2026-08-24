package com.newsplatform.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequestDto(
    @NotBlank(message = "Name cannot be blank")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    String name,

    @Size(max = 280, message = "Bio must not exceed 280 characters")
    String bio
) {
}
