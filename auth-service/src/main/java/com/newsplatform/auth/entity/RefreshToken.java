package com.newsplatform.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * RefreshToken entity corresponding to auth_db.refresh_tokens table per DATABASE_SCHEMA.md §2.2.
 */
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false, unique = true, length = 255)
  private String token;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(nullable = false)
  private boolean revoked = false;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  public RefreshToken() {
  }

  public RefreshToken(User user, String token, Instant expiresAt) {
    this.user = user;
    this.token = token;
    this.expiresAt = expiresAt;
    this.revoked = false;
  }

  @PrePersist
  protected void onCreate() {
    this.createdAt = Instant.now();
  }

  public boolean isExpired() {
    return Instant.now().isAfter(expiresAt);
  }

  // Getters and Setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  public Instant getExpiresAt() {
    return expiresAt;
  }

  public void setExpiresAt(Instant expiresAt) {
    this.expiresAt = expiresAt;
  }

  public boolean isRevoked() {
    return revoked;
  }

  public void setRevoked(boolean revoked) {
    this.revoked = revoked;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
