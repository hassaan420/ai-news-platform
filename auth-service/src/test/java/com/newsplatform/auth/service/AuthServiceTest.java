package com.newsplatform.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.newsplatform.auth.dto.request.LoginRequestDto;
import com.newsplatform.auth.dto.request.RefreshTokenRequestDto;
import com.newsplatform.auth.dto.request.RegisterRequestDto;
import com.newsplatform.auth.dto.response.LoginResponseDto;
import com.newsplatform.auth.dto.response.TokenResponseDto;
import com.newsplatform.auth.dto.response.UserResponseDto;
import com.newsplatform.auth.entity.RefreshToken;
import com.newsplatform.auth.entity.User;
import com.newsplatform.auth.model.Role;
import com.newsplatform.auth.repository.RefreshTokenRepository;
import com.newsplatform.auth.repository.UserRepository;
import com.newsplatform.auth.security.JwtTokenProvider;
import com.newsplatform.auth.service.impl.AuthServiceImpl;
import com.newsplatform.common.exception.ConflictException;
import com.newsplatform.common.exception.UnauthorizedException;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private RefreshTokenRepository refreshTokenRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @Mock
  private JwtTokenProvider jwtTokenProvider;

  private AuthService authService;

  @BeforeEach
  void setUp() {
    authService = new AuthServiceImpl(
        userRepository,
        refreshTokenRepository,
        passwordEncoder,
        jwtTokenProvider,
        604800000L
    );
  }

  @Test
  void shouldRegisterNewUserSuccessfully() {
    RegisterRequestDto request = new RegisterRequestDto("John Doe", "john@example.com", "secret123");
    when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
    when(passwordEncoder.encode("secret123")).thenReturn("encodedPassword");

    User savedUser = new User("John Doe", "john@example.com", "encodedPassword", Role.ROLE_USER);
    savedUser.setId(1L);
    when(userRepository.save(any(User.class))).thenReturn(savedUser);

    UserResponseDto response = authService.register(request);

    assertNotNull(response);
    assertEquals(1L, response.id());
    assertEquals("john@example.com", response.email());
    assertEquals(Role.ROLE_USER, response.role());
  }

  @Test
  void shouldThrowConflictExceptionWhenEmailExists() {
    RegisterRequestDto request = new RegisterRequestDto("John Doe", "john@example.com", "secret123");
    when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

    assertThrows(ConflictException.class, () -> authService.register(request));
  }

  @Test
  void shouldLoginSuccessfully() {
    LoginRequestDto request = new LoginRequestDto("john@example.com", "secret123");
    User user = new User("John Doe", "john@example.com", "encodedPassword", Role.ROLE_USER);
    user.setId(1L);

    when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("secret123", "encodedPassword")).thenReturn(true);
    when(jwtTokenProvider.generateAccessToken(user)).thenReturn("mock.jwt.token");
    when(jwtTokenProvider.getExpirationMs()).thenReturn(900000L);
    // Act
    LoginResponseDto response = authService.login(request);

    assertNotNull(response);
    assertEquals("mock.jwt.token", response.accessToken());
    assertNotNull(response.refreshToken());
    assertEquals(900, response.expiresIn());
  }

  @Test
  void shouldThrowUnauthorizedExceptionOnInvalidPassword() {
    LoginRequestDto request = new LoginRequestDto("john@example.com", "wrongpassword");
    User user = new User("John Doe", "john@example.com", "encodedPassword", Role.ROLE_USER);

    when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("wrongpassword", "encodedPassword")).thenReturn(false);

    assertThrows(UnauthorizedException.class, () -> authService.login(request));
  }

  @Test
  void shouldRotateRefreshTokenSuccessfully() {
    RefreshTokenRequestDto request = new RefreshTokenRequestDto("valid-refresh-token");
    User user = new User("John Doe", "john@example.com", "encodedPassword", Role.ROLE_USER);
    user.setId(1L);

    RefreshToken refreshToken = new RefreshToken(user, "valid-refresh-token", Instant.now().plusSeconds(3600));
    when(refreshTokenRepository.findByToken("valid-refresh-token")).thenReturn(Optional.of(refreshToken));
    when(jwtTokenProvider.generateAccessToken(user)).thenReturn("new.jwt.token");
    when(jwtTokenProvider.getExpirationMs()).thenReturn(900000L);
    // Act
    LoginResponseDto response = authService.refreshToken(request);

    assertNotNull(response);
    assertEquals("new.jwt.token", response.accessToken());
    assertTrue(refreshToken.isRevoked(), "Old refresh token should be marked revoked");
  }

  private void assertTrue(boolean condition, String message) {
    org.junit.jupiter.api.Assertions.assertTrue(condition, message);
  }
}
