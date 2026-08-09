package com.newsplatform.news.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_processing_queue")
public class AiProcessingQueue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, PROCESSING, COMPLETED, FAILED

    @Column(name = "task_type", nullable = false, length = 50)
    private String taskType; // NLP_ANALYSIS, SUMMARY

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "retry_count", nullable = false)
    private int retryCount = 0;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @PrePersist
    public void prePersist() { createdAt = Instant.now(); updatedAt = Instant.now(); }

    @PreUpdate
    public void preUpdate() { updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Article getArticle() { return article; }
    public void setArticle(Article article) { this.article = article; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTaskType() { return taskType; }
    public void setTaskType(String taskType) { this.taskType = taskType; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public int getRetryCount() { return retryCount; }
    public void setRetryCount(int retryCount) { this.retryCount = retryCount; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
