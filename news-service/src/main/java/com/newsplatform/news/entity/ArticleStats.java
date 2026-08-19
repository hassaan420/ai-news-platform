package com.newsplatform.news.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.io.Serializable;

@Entity
@Table(name = "article_stats")
public class ArticleStats implements Serializable {
    @Id
    @Column(name = "article_id")
    private Long articleId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "article_id")
    private Article article;

    @Column(nullable = false)
    private Integer views = 0;

    @Column(nullable = false)
    private Integer bookmarks = 0;

    @Column(name = "trending_score", nullable = false)
    private Double trendingScore = 0.0;

    @Column(name = "last_calculated_at")
    private Instant lastCalculatedAt;

    public Long getArticleId() { return articleId; }
    public void setArticleId(Long articleId) { this.articleId = articleId; }
    public Article getArticle() { return article; }
    public void setArticle(Article article) { this.article = article; }
    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }
    public Integer getBookmarks() { return bookmarks; }
    public void setBookmarks(Integer bookmarks) { this.bookmarks = bookmarks; }
    public Double getTrendingScore() { return trendingScore; }
    public void setTrendingScore(Double trendingScore) { this.trendingScore = trendingScore; }
    public Instant getLastCalculatedAt() { return lastCalculatedAt; }
    public void setLastCalculatedAt(Instant lastCalculatedAt) { this.lastCalculatedAt = lastCalculatedAt; }
}
