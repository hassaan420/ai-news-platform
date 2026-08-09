package com.newsplatform.common.dto;

/**
 * DTO record representing a single field-level validation error.
 */
public record FieldErrorDto(String field, String message) {
}
