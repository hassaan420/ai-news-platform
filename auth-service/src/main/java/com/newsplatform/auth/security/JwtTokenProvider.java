package com.newsplatform.auth.security;

import com.newsplatform.auth.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * JWT token provider for token generation, validation, and claim parsing.
 * Implements HS256 JWT signature algorithm per SECURITY.md §1.
 */
@Component
public class JwtTokenProvider {

  private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

  private final SecretKey secretKey;
  private final long expirationMs;

  public JwtTokenProvider(
      @Value("${jwt.secret}") String secret,
      @Value("${jwt.expiration-ms:900000}") long expirationMs) {
    this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMs = expirationMs;
  }

  /**
   * Generates a signed JWT access token containing sub, email, and role claims.
   */
  public String generateAccessToken(User user) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + expirationMs);

    return Jwts.builder()
        .subject(String.valueOf(user.getId()))
        .claim("email", user.getEmail())
        .claim("role", user.getRole().name())
        .issuedAt(now)
        .expiration(expiryDate)
        .signWith(secretKey)
        .compact();
  }

  /**
   * Validates JWT token signature and expiration.
   */
  public boolean validateToken(String token) {
    try {
      Jwts.parser()
          .verifyWith(secretKey)
          .build()
          .parseSignedClaims(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      log.warn("Invalid or expired JWT token: {}", e.getMessage());
      return false;
    }
  }

  /**
   * Parses claims from a valid JWT token.
   */
  public Claims parseClaims(String token) {
    return Jwts.parser()
        .verifyWith(secretKey)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  public long getExpirationMs() {
    return expirationMs;
  }
}
