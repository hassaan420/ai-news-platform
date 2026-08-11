package com.newsplatform.news.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.CascadeType;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "articles")
public class Article {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "source_id", nullable = false)
  private Source source;

  @Column(name = "category_id", nullable = false)
  private Long categoryId; // Logical FK to category_db.categories

  @Column(nullable = false, length = 500)
  private String title;

  @Column(length = 1000)
  private String description;

  @Column(columnDefinition = "TEXT")
  private String content;

  @Column(length = 1000)
  private String image;

  @Column(nullable = false, length = 1000)
  private String url;

  @Column(length = 200)
  private String author;

  @Column(nullable = false, length = 10)
  private String language = "en";

  @Column(name = "published_at", nullable = false)
  private Instant publishedAt;

  @Column(nullable = false, unique = true, length = 64)
  private String hash;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  // AI Fields (Phase 9)
  @Column(columnDefinition = "TEXT")
  private String summary;

  @Column(length = 20)
  private String sentiment;

  @Column(name = "sentiment_score")
  private Double sentimentScore;

  @Column(nullable = false)
  private boolean featured = false;

  @Column(nullable = false)
  private boolean hidden = false;

  public Article() {}

  @PrePersist
  protected void onCreate() {
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = Instant.now();
  }

  // Getters and Setters

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public Source getSource() { return source; }
  public void setSource(Source source) { this.source = source; }

  public Long getCategoryId() { return categoryId; }
  public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }

  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }

  public String getContent() { return content; }
  public void setContent(String content) { this.content = content; }

  public String getImage() { return image; }
  public void setImage(String image) { this.image = image; }

  public String getUrl() { return url; }
  public void setUrl(String url) { this.url = url; }

  public String getAuthor() { return author; }
  public void setAuthor(String author) { this.author = author; }

  public String getLanguage() { return language; }
  public void setLanguage(String language) { this.language = language; }

  public Instant getPublishedAt() { return publishedAt; }
  public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }

  public String getHash() { return hash; }
  public void setHash(String hash) { this.hash = hash; }

  public Instant getCreatedAt() { return createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }

  public String getSummary() { return summary; }
  public void setSummary(String summary) { this.summary = summary; }

  public String getSentiment() { return sentiment; }
  public void setSentiment(String sentiment) { this.sentiment = sentiment; }

  public Double getSentimentScore() { return sentimentScore; }
  public void setSentimentScore(Double sentimentScore) { this.sentimentScore = sentimentScore; }

  public boolean isFeatured() { return featured; }
  public void setFeatured(boolean featured) { this.featured = featured; }

  public boolean isHidden() { return hidden; }
  public void setHidden(boolean hidden) { this.hidden = hidden; }

  @Column(name = "reading_time")
  private Integer readingTime;

  @Column(name = "topic_classification", length = 100)
  private String topicClassification;

  @Column(name = "recommendation_score")
  private Double recommendationScore;

  @Column(name = "trending_score")
  private Double trendingScore;

  @Column(name = "ai_confidence")
  private Double aiConfidence;

  @Column(name = "processing_status", length = 20)
  private String processingStatus = "PENDING";

  @Column(name = "processed_at")
  private Instant processedAt;

  public Integer getReadingTime() { return readingTime; }
  public void setReadingTime(Integer readingTime) { this.readingTime = readingTime; }

  public String getTopicClassification() { return topicClassification; }
  public void setTopicClassification(String topicClassification) { this.topicClassification = topicClassification; }

  public Double getRecommendationScore() { return recommendationScore; }
  public void setRecommendationScore(Double recommendationScore) { this.recommendationScore = recommendationScore; }

  public Double getTrendingScore() { return trendingScore; }
  public void setTrendingScore(Double trendingScore) { this.trendingScore = trendingScore; }

  public Double getAiConfidence() { return aiConfidence; }
  public void setAiConfidence(Double aiConfidence) { this.aiConfidence = aiConfidence; }

  public String getProcessingStatus() { return processingStatus; }
  public void setProcessingStatus(String processingStatus) { this.processingStatus = processingStatus; }

  public Instant getProcessedAt() { return processedAt; }
  public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }

  @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<ArticleKeyword> keywords;

  @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<ArticleTag> tags;

  public List<ArticleKeyword> getKeywords() { return keywords; }
  public void setKeywords(List<ArticleKeyword> keywords) { this.keywords = keywords; }

  public List<ArticleTag> getTags() { return tags; }
  public void setTags(List<ArticleTag> tags) { this.tags = tags; }

  @OneToOne(mappedBy = "article", fetch = FetchType.LAZY)
  private ArticleStats stats;

  public ArticleStats getStats() { return stats; }
  public void setStats(ArticleStats stats) { this.stats = stats; }
}
