package com.newsplatform.auth.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.newsplatform.auth.entity.User;
import com.newsplatform.auth.model.Role;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {

  private static final String TEST_SECRET = "test_secret_key_must_be_at_least_32_characters_long_string";
  private static final long TEST_EXPIRATION_MS = 900000; // 15 minutes

  private JwtTokenProvider jwtTokenProvider;
  private User testUser;

  @BeforeEach
  void setUp() {
    jwtTokenProvider = new JwtTokenProvider(TEST_SECRET, TEST_EXPIRATION_MS);
    testUser = new User("Test User", "test@example.com", "password", Role.ROLE_USER);
    testUser.setId(42L);
  }

  @Test
  void shouldGenerateAndValidateToken() {
    String token = jwtTokenProvider.generateAccessToken(testUser);

    assertNotNull(token);
    assertTrue(jwtTokenProvider.validateToken(token));

    Claims claims = jwtTokenProvider.parseClaims(token);
    assertEquals("42", claims.getSubject());
    assertEquals("test@example.com", claims.get("email"));
    assertEquals("ROLE_USER", claims.get("role"));
  }

  @Test
  void shouldRejectInvalidToken() {
    String invalidToken = "invalid.jwt.token";

    assertFalse(jwtTokenProvider.validateToken(invalidToken));
  }

  @Test
  void shouldRejectTamperedToken() {
    String token = jwtTokenProvider.generateAccessToken(testUser);
    String tamperedToken = token + "tamper";

    assertFalse(jwtTokenProvider.validateToken(tamperedToken));
  }
}
