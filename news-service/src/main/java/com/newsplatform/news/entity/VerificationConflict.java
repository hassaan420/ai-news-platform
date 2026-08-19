package com.newsplatform.news.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "verification_conflicts")
public class VerificationConflict {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_id", nullable = false)
    private ArticleVerification verification;

    @Column(name = "claim_text", nullable = false, columnDefinition = "TEXT")
    private String claimText;

    @Column(name = "conflicting_source_url", length = 1000)
    private String conflictingSourceUrl;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ArticleVerification getVerification() { return verification; }
    public void setVerification(ArticleVerification verification) { this.verification = verification; }
    public String getClaimText() { return claimText; }
    public void setClaimText(String claimText) { this.claimText = claimText; }
    public String getConflictingSourceUrl() { return conflictingSourceUrl; }
    public void setConflictingSourceUrl(String conflictingSourceUrl) { this.conflictingSourceUrl = conflictingSourceUrl; }
}
