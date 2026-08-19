package com.newsplatform.news.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.ArticleVerification;
import com.newsplatform.news.entity.VerificationConflict;
import com.newsplatform.news.entity.VerificationSource;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.ArticleVerificationRepository;
import com.newsplatform.news.dto.NormalizedArticle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ArticleVerificationService {

    private static final Logger log = LoggerFactory.getLogger(ArticleVerificationService.class);

    private final ArticleRepository articleRepository;
    private final ArticleVerificationRepository verificationRepository;
    private final AiService aiService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${SCHEDULER_SERVICE_URL:http://scheduler-service:8085}")
    private String schedulerServiceUrl;

    @Value("${INTERNAL_API_KEY:}")
    private String internalApiKey;

    public ArticleVerificationService(ArticleRepository articleRepository,
                                      ArticleVerificationRepository verificationRepository,
                                      AiService aiService,
                                      ObjectMapper objectMapper) {
        this.articleRepository = articleRepository;
        this.verificationRepository = verificationRepository;
        this.aiService = aiService;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public void runVerification(Long articleId) {
        log.info("Starting verification for article ID: {}", articleId);
        
        Optional<Article> articleOpt = articleRepository.findById(articleId);
        if (articleOpt.isEmpty()) {
            log.warn("Article ID {} not found for verification.", articleId);
            return;
        }
        Article article = articleOpt.get();

        // Construct search query
        String query = article.getTitle();
        if (query == null || query.isBlank()) {
            log.warn("Article ID {} has no title for searching.", articleId);
            return;
        }
        
        // Remove publisher/provider from query to avoid biasing results
        query = query.replaceAll("(?i)(Reuters|AP|BBC|CNN|The Guardian|Al Jazeera)", "").trim();

        // Fetch external articles
        List<NormalizedArticle> externalArticles = fetchExternalArticles(query);

        // Filter duplicates (same publisher or URL or hash)
        List<NormalizedArticle> independentSources = filterIndependentSources(article, externalArticles);

        // Call AI for comparison
        GeminiAiProvider.CorroborationAnalysis analysis = aiService.verifyCorroboration(article.getContent(), independentSources);

        // Build entities
        ArticleVerification verification = verificationRepository.findByArticleId(articleId).orElse(new ArticleVerification());
        verification.setArticle(article);
        verification.setStatus(analysis.status());
        verification.setVerificationScore(analysis.score());
        verification.setSourcesFound(externalArticles.size());
        verification.setIndependentSources(independentSources.size());
        verification.setLastVerifiedAt(Instant.now());

        // Clear existing sources and conflicts
        verification.getVerificationSources().clear();
        verification.getVerificationConflicts().clear();

        // Add verified sources
        for (NormalizedArticle extSrc : independentSources) {
            VerificationSource src = new VerificationSource();
            src.setVerification(verification);
            src.setSourceName(extSrc.getPublisher() != null && !extSrc.getPublisher().isBlank() ? extSrc.getPublisher() : "Unknown");
            src.setUrl(extSrc.getUrl());
            try {
                src.setPublishedAt(Instant.parse(extSrc.getPublishedAt()));
            } catch (Exception e) {}
            // Determine relationship - simplified for now
            src.setRelationship("SIMILAR");
            verification.getVerificationSources().add(src);
        }

        // Add conflicts
        if (analysis.conflicts() != null) {
            for (GeminiAiProvider.ConflictResult cr : analysis.conflicts()) {
                VerificationConflict conflict = new VerificationConflict();
                conflict.setVerification(verification);
                conflict.setClaimText(cr.claim());
                conflict.setConflictingSourceUrl(cr.sourceUrl());
                verification.getVerificationConflicts().add(conflict);
            }
        }

        verificationRepository.save(verification);
        log.info("Verification for article ID {} complete. Status: {}, Score: {}", articleId, verification.getStatus(), verification.getVerificationScore());
    }

    private List<NormalizedArticle> fetchExternalArticles(String query) {
        try {
            String url = schedulerServiceUrl + "/api/scheduler/search?q=" + java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8.toString());
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            if (internalApiKey != null && !internalApiKey.isBlank()) {
                headers.set("Internal-Api-Key", internalApiKey);
            }
            org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);
            org.springframework.http.ResponseEntity<List> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, List.class);
            List<?> rawList = response.getBody();
            if (rawList != null) {
                return objectMapper.convertValue(rawList, new TypeReference<List<NormalizedArticle>>() {});
            }
        } catch (Exception e) {
            log.error("Failed to fetch external articles for verification: {}", e.getMessage());
        }
        return new ArrayList<>();
    }

    private List<NormalizedArticle> filterIndependentSources(Article original, List<NormalizedArticle> externalArticles) {
        List<NormalizedArticle> filtered = new ArrayList<>();
        List<String> seenUrls = new ArrayList<>();
        if (original.getUrl() != null) seenUrls.add(original.getUrl());

        for (NormalizedArticle article : externalArticles) {
            if (article.getUrl() == null || seenUrls.contains(article.getUrl())) continue;
            
            // Skip if publisher is the exact same as original (not an independent source)
            if (original.getPublisher() != null && original.getPublisher().equalsIgnoreCase(article.getPublisher())) {
                continue;
            }
            
            // Limit to max 5 sources to save AI tokens and prevent too large payload
            if (filtered.size() >= 5) break;

            filtered.add(article);
            seenUrls.add(article.getUrl());
        }
        return filtered;
    }
}
