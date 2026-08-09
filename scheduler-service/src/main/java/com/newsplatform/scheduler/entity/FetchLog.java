package com.newsplatform.scheduler.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "fetch_logs")
public class FetchLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "source_id", nullable = false)
  private Long sourceId;

  @Column(nullable = false, length = 20)
  private String status;

  @Column(name = "articles_fetched", nullable = false)
  private int articlesFetched = 0;

  @Column(name = "articles_stored", nullable = false)
  private int articlesStored = 0;

  @Column(name = "duplicates_skipped", nullable = false)
  private int duplicatesSkipped = 0;

  @Column(name = "error_message", length = 2000)
  private String errorMessage;

  @Column(name = "fetched_at", nullable = false)
  private Instant fetchedAt;

  @Column(name = "execution_time_ms", nullable = false)
  private int executionTimeMs;

  public FetchLog() {}

  // Getters and Setters

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public Long getSourceId() { return sourceId; }
  public void setSourceId(Long sourceId) { this.sourceId = sourceId; }

  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }

  public int getArticlesFetched() { return articlesFetched; }
  public void setArticlesFetched(int articlesFetched) { this.articlesFetched = articlesFetched; }

  public int getArticlesStored() { return articlesStored; }
  public void setArticlesStored(int articlesStored) { this.articlesStored = articlesStored; }

  public int getDuplicatesSkipped() { return duplicatesSkipped; }
  public void setDuplicatesSkipped(int duplicatesSkipped) { this.duplicatesSkipped = duplicatesSkipped; }

  public String getErrorMessage() { return errorMessage; }
  public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

  public Instant getFetchedAt() { return fetchedAt; }
  public void setFetchedAt(Instant fetchedAt) { this.fetchedAt = fetchedAt; }

  public int getExecutionTimeMs() { return executionTimeMs; }
  public void setExecutionTimeMs(int executionTimeMs) { this.executionTimeMs = executionTimeMs; }
}
