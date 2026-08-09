package com.newsplatform.news.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "saved_articles")
public class SavedArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public SavedArticle() {}

    public SavedArticle(Long userId, Article article) {
        this.userId = userId;
        this.article = article;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Article getArticle() { return article; }
    public void setArticle(Article article) { this.article = article; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
