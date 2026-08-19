package com.newsplatform.news.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "verification_sources")
public class VerificationSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_id", nullable = false)
    private ArticleVerification verification;

    @Column(name = "source_name", nullable = false, length = 200)
    private String sourceName;

    @Column(nullable = false, length = 1000)
    private String url;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "similarity_score")
    private Double similarityScore;

    @Column(length = 50)
    private String relationship; // e.g. DIRECT_ORIGINAL, SYNDICATED, SIMILAR, CONFLICTING

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ArticleVerification getVerification() { return verification; }
    public void setVerification(ArticleVerification verification) { this.verification = verification; }
    public String getSourceName() { return sourceName; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }
}
