package com.newsplatform.auth.service.impl;

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
import com.newsplatform.auth.service.AuthService;
import com.newsplatform.common.exception.ConflictException;
import com.newsplatform.common.exception.UnauthorizedException;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AuthService business logic.
 * Handles registration, login, JWT token issuance, refresh token single-use rotation, and logout.
 */
@Service
public class AuthServiceImpl implements AuthService {

  private final UserRepository userRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;
  private final long refreshExpirationMs;

  public AuthServiceImpl(
      UserRepository userRepository,
      RefreshTokenRepository refreshTokenRepository,
      PasswordEncoder passwordEncoder,
      JwtTokenProvider jwtTokenProvider,
      @Value("${jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs) {
    this.userRepository = userRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtTokenProvider = jwtTokenProvider;
    this.refreshExpirationMs = refreshExpirationMs;
  }

  @Override
  @Transactional
  public UserResponseDto register(RegisterRequestDto request) {
    if (userRepository.existsByEmail(request.email())) {
      throw new ConflictException("User with email '" + request.email() + "' already exists");
    }

    String encodedPassword = passwordEncoder.encode(request.password());
    User user = new User(request.name(), request.email(), encodedPassword, Role.ROLE_USER);
    User savedUser = userRepository.save(user);

    return new UserResponseDto(
        savedUser.getId(),
        savedUser.getName(),
        savedUser.getEmail(),
        savedUser.getRole()
    );
  }

  @Override
  @Transactional
  public LoginResponseDto login(LoginRequestDto request) {
    User user = userRepository.findByEmail(request.email())
        .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), user.getPassword())) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.isEnabled()) {
      throw new UnauthorizedException("User account is disabled");
    }

    return createTokenPair(user);
  }

  @Override
  @Transactional
  public LoginResponseDto refreshToken(RefreshTokenRequestDto request) {
    RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
        .orElseThrow(() -> new UnauthorizedException("Invalid or revoked refresh token"));

    if (refreshToken.isRevoked() || refreshToken.isExpired()) {
      throw new UnauthorizedException("Refresh token is expired or revoked");
    }

    User user = refreshToken.getUser();
    refreshToken.setRevoked(true);
    refreshTokenRepository.save(refreshToken);

    return createTokenPair(user);
  }

  @Override
  @Transactional
  public void logout(RefreshTokenRequestDto request) {
    refreshTokenRepository.findByToken(request.refreshToken())
        .ifPresent(token -> {
          token.setRevoked(true);
          refreshTokenRepository.save(token);
        });
  }

  @Override
  @Transactional(readOnly = true)
  public UserResponseDto getCurrentUser(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new UnauthorizedException("User not found"));
    return new UserResponseDto(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole()
    );
  }

  private LoginResponseDto createTokenPair(User user) {
    String accessToken = jwtTokenProvider.generateAccessToken(user);
    long expiresInSeconds = jwtTokenProvider.getExpirationMs() / 1000;

    String refreshTokenString = UUID.randomUUID().toString();
    Instant refreshExpiry = Instant.now().plusMillis(refreshExpirationMs);
    RefreshToken refreshToken = new RefreshToken(user, refreshTokenString, refreshExpiry);
    refreshTokenRepository.save(refreshToken);

    UserResponseDto userDto = new UserResponseDto(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole()
    );

    return new LoginResponseDto(accessToken, refreshTokenString, expiresInSeconds, userDto);
  }
}
