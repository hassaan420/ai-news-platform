package com.newsplatform.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

/**
 * Standard API error response envelope per API_SPEC.md §2.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponseDto(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path,
    List<FieldErrorDto> fieldErrors
) {
  public static ErrorResponseDto of(int status, String error, String message, String path) {
    return new ErrorResponseDto(Instant.now(), status, error, message, path, null);
  }

  public static ErrorResponseDto of(int status, String error, String message, String path, List<FieldErrorDto> fieldErrors) {
    return new ErrorResponseDto(Instant.now(), status, error, message, path, fieldErrors);
  }
}
