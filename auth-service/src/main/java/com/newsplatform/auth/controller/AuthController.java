package com.newsplatform.auth.controller;

import com.newsplatform.auth.dto.request.LoginRequestDto;
import com.newsplatform.auth.dto.request.RefreshTokenRequestDto;
import com.newsplatform.auth.dto.request.RegisterRequestDto;
import com.newsplatform.auth.dto.request.UpdateProfileRequestDto;
import com.newsplatform.auth.dto.response.LoginResponseDto;
import com.newsplatform.auth.dto.response.TokenResponseDto;
import com.newsplatform.auth.dto.response.UserResponseDto;
import com.newsplatform.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for authentication endpoints per API_SPEC.md §4.4.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User registration, login, token refresh, and logout operations")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  @Operation(summary = "Register a new user", description = "Creates a new user account with ROLE_USER")
  public ResponseEntity<UserResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
    UserResponseDto user = authService.register(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(user);
  }

  @PostMapping("/login")
  @Operation(summary = "Log in user", description = "Authenticates user credentials and returns JWT access and refresh token pair")
  public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
    LoginResponseDto tokenPair = authService.login(request);
    return ResponseEntity.ok(tokenPair);
  }

  @PostMapping("/refresh")
  @Operation(summary = "Refresh access token", description = "Rotates single-use refresh token and issues new JWT access token")
  public ResponseEntity<LoginResponseDto> refresh(@Valid @RequestBody RefreshTokenRequestDto request) {
    LoginResponseDto tokenPair = authService.refreshToken(request);
    return ResponseEntity.ok(tokenPair);
  }

  @PostMapping("/logout")
  @Operation(summary = "Log out user", description = "Revokes the specified refresh token")
  public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequestDto request) {
    authService.logout(request);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/me")
  @Operation(summary = "Get current user profile")
  public ResponseEntity<UserResponseDto> getCurrentUser() {
    org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser") || auth.getName().equals("internal-service")) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    try {
      Long userId = Long.parseLong(auth.getName());
      return ResponseEntity.ok(authService.getCurrentUser(userId));
    } catch (NumberFormatException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
  }

  @PutMapping("/me")
  @Operation(summary = "Update current user profile")
  public ResponseEntity<UserResponseDto> updateProfile(@Valid @RequestBody UpdateProfileRequestDto request) {
    org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser") || auth.getName().equals("internal-service")) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    try {
      Long userId = Long.parseLong(auth.getName());
      return ResponseEntity.ok(authService.updateProfile(userId, request));
    } catch (NumberFormatException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
  }
}
