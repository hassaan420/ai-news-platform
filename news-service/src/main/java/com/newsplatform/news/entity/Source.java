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
import java.io.Serializable;

@Entity
@Table(name = "sources")
public class Source implements Serializable {

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

  @Column(name = "url", length = 500)
  private String url;

  @Column(name = "scraping_frequency", nullable = false)
  private int scrapingFrequency = 60; // minutes

  @Column(name = "parser_type", length = 50)
  private String parserType = "RSS"; // RSS, API, HTML

  @Column(name = "last_scraped_time")
  private Instant lastScrapedTime;

  @Column(name = "last_scrape_status", length = 20)
  private String lastScrapeStatus = "PENDING";

  @Column(name = "total_articles_scraped")
  private long totalArticlesScraped = 0;

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

  public Source(String provider, String name, String apiKey, String endpoint, String status, String url, int scrapingFrequency, String parserType) {
    this.provider = provider;
    this.name = name;
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.status = status != null ? status : "ACTIVE";
    this.url = url;
    this.scrapingFrequency = scrapingFrequency;
    this.parserType = parserType != null ? parserType : "RSS";
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

  public String getUrl() { return url; }
  public void setUrl(String url) { this.url = url; }

  public int getScrapingFrequency() { return scrapingFrequency; }
  public void setScrapingFrequency(int scrapingFrequency) { this.scrapingFrequency = scrapingFrequency; }

  public String getParserType() { return parserType; }
  public void setParserType(String parserType) { this.parserType = parserType; }

  public Instant getLastScrapedTime() { return lastScrapedTime; }
  public void setLastScrapedTime(Instant lastScrapedTime) { this.lastScrapedTime = lastScrapedTime; }

  public String getLastScrapeStatus() { return lastScrapeStatus; }
  public void setLastScrapeStatus(String lastScrapeStatus) { this.lastScrapeStatus = lastScrapeStatus; }

  public long getTotalArticlesScraped() { return totalArticlesScraped; }
  public void setTotalArticlesScraped(long totalArticlesScraped) { this.totalArticlesScraped = totalArticlesScraped; }
}
