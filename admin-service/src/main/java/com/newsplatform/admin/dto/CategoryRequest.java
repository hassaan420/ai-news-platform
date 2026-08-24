package com.newsplatform.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 80, message = "Title cannot exceed 80 characters")
        String title,

        @Size(max = 100, message = "Slug cannot exceed 100 characters")
        String slug,

        @Size(max = 100, message = "Icon cannot exceed 100 characters")
        String icon,

        Boolean active
) {}
