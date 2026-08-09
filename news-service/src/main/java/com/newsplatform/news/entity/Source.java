package com.newsplatform.news.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "sources")
public class Source {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 50)
  private String provider;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(name = "api_key", length = 255)
  private String apiKey;

  @Column(nullable = false, length = 500)
  private String endpoint;

  @Column(nullable = false, length = 20)
  private String status = "ACTIVE";

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  public Source() {}

  public Source(String provider, String name, String apiKey, String endpoint, String status) {
    this.provider = provider;
    this.name = name;
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.status = status != null ? status : "ACTIVE";
  }

  @PrePersist
  protected void onCreate() {
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = Instant.now();
  }

  // Getters and setters

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  
  public String getProvider() { return provider; }
  public void setProvider(String provider) { this.provider = provider; }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public String getApiKey() { return apiKey; }
  public void setApiKey(String apiKey) { this.apiKey = apiKey; }

  public String getEndpoint() { return endpoint; }
  public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }

  public Instant getCreatedAt() { return createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }
}
