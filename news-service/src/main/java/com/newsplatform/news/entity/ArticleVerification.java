package com.newsplatform.news.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "article_verifications")
public class ArticleVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Column(nullable = false, length = 50)
    private String status; // STRONGLY_CORROBORATED, PARTIALLY_CORROBORATED, SINGLE_SOURCE, CONFLICTING_REPORTS, INSUFFICIENT_EVIDENCE

    @Column(name = "verification_score", nullable = false)
    private int verificationScore;

    @Column(name = "sources_found", nullable = false)
    private int sourcesFound;

    @Column(name = "independent_sources", nullable = false)
    private int independentSources;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "last_verified_at", nullable = false)
    private Instant lastVerifiedAt;

    @OneToMany(mappedBy = "verification", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VerificationSource> verificationSources = new ArrayList<>();

    @OneToMany(mappedBy = "verification", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VerificationConflict> verificationConflicts = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Article getArticle() { return article; }
    public void setArticle(Article article) { this.article = article; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getVerificationScore() { return verificationScore; }
    public void setVerificationScore(int verificationScore) { this.verificationScore = verificationScore; }
    public int getSourcesFound() { return sourcesFound; }
    public void setSourcesFound(int sourcesFound) { this.sourcesFound = sourcesFound; }
    public int getIndependentSources() { return independentSources; }
    public void setIndependentSources(int independentSources) { this.independentSources = independentSources; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getLastVerifiedAt() { return lastVerifiedAt; }
    public void setLastVerifiedAt(Instant lastVerifiedAt) { this.lastVerifiedAt = lastVerifiedAt; }
    public List<VerificationSource> getVerificationSources() { return verificationSources; }
    public void setVerificationSources(List<VerificationSource> verificationSources) { this.verificationSources = verificationSources; }
    public List<VerificationConflict> getVerificationConflicts() { return verificationConflicts; }
    public void setVerificationConflicts(List<VerificationConflict> verificationConflicts) { this.verificationConflicts = verificationConflicts; }
}
