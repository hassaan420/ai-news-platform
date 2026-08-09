package com.newsplatform.news.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_reading_history")
public class UserReadingHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Column(name = "read_at", updatable = false)
    private Instant readAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Article getArticle() { return article; }
    public void setArticle(Article article) { this.article = article; }
    public Instant getReadAt() { return readAt; }
    public void setReadAt(Instant readAt) { this.readAt = readAt; }
}
