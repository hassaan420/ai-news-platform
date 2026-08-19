package com.newsplatform.scheduler.provider.impl;

import com.newsplatform.scheduler.provider.NewsProvider;
import com.newsplatform.scheduler.provider.dto.MediastackResponse;
import com.newsplatform.scheduler.provider.dto.NormalizedArticle;
import com.newsplatform.scheduler.provider.exception.ProviderUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class MediastackProvider implements NewsProvider {

    private static final Logger log = LoggerFactory.getLogger(MediastackProvider.class);

    @Value("${MEDIASTACK_KEY:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public MediastackProvider() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String getProviderName() {
        return "Mediastack";
    }

    @Override
    public Long getSourceId() {
        return 4L; // Matches V6 migration
    }

    @Override
    public int getPriority() {
        return 3;
    }

    @Override
    public List<NormalizedArticle> fetchNews(String categorySlug, Long categoryId, java.time.Instant fromTime) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ProviderUnavailableException("Mediastack key is missing.");
        }

        String url;
        if (fromTime != null) {
            String fromDate = java.time.LocalDate.ofInstant(fromTime, java.time.ZoneOffset.UTC).toString();
            String toDate = java.time.LocalDate.now(java.time.ZoneOffset.UTC).toString();
            url = String.format("http://api.mediastack.com/v1/news?categories=%s&languages=en&date=%s,%s&access_key=%s", categorySlug, fromDate, toDate, apiKey);
        } else {
            url = String.format("http://api.mediastack.com/v1/news?categories=%s&languages=en&access_key=%s", categorySlug, apiKey);
        }
        log.info("Fetching from Mediastack for category: {} (fromTime={})", categorySlug, fromTime);
        
        MediastackResponse response;
        try {
            response = restTemplate.getForObject(url, MediastackResponse.class);
        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new ProviderUnavailableException("Mediastack rate limit exceeded.", e);
        } catch (Exception e) {
            throw new ProviderUnavailableException("Failed to fetch from Mediastack: " + e.getMessage(), e);
        }

        if (response == null || response.getData() == null) {
            throw new ProviderUnavailableException("Mediastack response was invalid or data was null");
        }

        List<NormalizedArticle> mappedArticles = new ArrayList<>();

        for (MediastackResponse.Article item : response.getData()) {
            String title = item.getTitle();
            if (title == null || title.isBlank()) continue;
            
            NormalizedArticle article = new NormalizedArticle();
            article.setTitle(title);
            article.setDescription(item.getDescription() != null ? item.getDescription() : "");
            article.setContent(article.getDescription()); // Mediastack free doesn't give full content
            
            String articleUrl = item.getUrl();
            String uuid = UUID.randomUUID().toString();
            if (articleUrl != null) {
                try {
                    java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
                    byte[] hashBytes = md.digest(articleUrl.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                    StringBuilder sb = new StringBuilder();
                    for (byte b : hashBytes) sb.append(String.format("%02x", b));
                    uuid = sb.toString();
                } catch (Exception e) {}
            }
            article.setUrl(articleUrl != null ? articleUrl : "https://mediastack.com/" + uuid);
            article.setImage(item.getImage() != null ? item.getImage() : "");
            
            String author = item.getAuthor();
            article.setAuthor(author != null ? author : "");
            
            String publisher = item.getSource();
            article.setPublisher(publisher != null ? publisher : "");
            
            article.setSourceId(getSourceId());
            article.setCategoryId(categoryId);
            article.setLanguage("en");
            article.setPublishedAt(item.getPublishedAt() != null ? item.getPublishedAt() : Instant.now().toString());
            article.setHash(uuid);
            
            mappedArticles.add(article);
        }
        
        return mappedArticles;
    }

    @Override
    public List<NormalizedArticle> fetchNews(String categorySlug, Long categoryId) {
        return fetchNews(categorySlug, categoryId, null);
    }

    @Override
    public List<NormalizedArticle> searchNews(String query) {
        if (apiKey == null || apiKey.isBlank()) return List.of();
        
        try {
            // Mediastack search does not support domain filtering by raw domain string (e.g. "bbc.com").
            // Its source filtering uses proprietary internal source IDs obtainable only via /v1/sources,
            // which cannot be mapped from bare domain strings at search time without an additional API call.
            // The interface default for searchNews(String, List<String>) falls back to this method.
            String encodedQuery = java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8.toString());
            String url = String.format("http://api.mediastack.com/v1/news?keywords=%s&languages=en&limit=10&access_key=%s", encodedQuery, apiKey);
            log.info("Searching Mediastack for query: {}", query);
            
            MediastackResponse response = restTemplate.getForObject(url, MediastackResponse.class);
            if (response == null || response.getData() == null) return List.of();
            
            List<NormalizedArticle> mappedArticles = new ArrayList<>();
            for (MediastackResponse.Article item : response.getData()) {
                String title = item.getTitle();
                if (title == null || title.isBlank()) continue;
                
                NormalizedArticle article = new NormalizedArticle();
                article.setTitle(title);
                article.setDescription(item.getDescription() != null ? item.getDescription() : "");
                article.setContent(article.getDescription());
                
                String articleUrl = item.getUrl();
                String uuid = UUID.randomUUID().toString();
                if (articleUrl != null) {
                    try {
                        java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
                        byte[] hashBytes = md.digest(articleUrl.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                        StringBuilder sb = new StringBuilder();
                        for (byte b : hashBytes) sb.append(String.format("%02x", b));
                        uuid = sb.toString();
                    } catch (Exception e) {}
                }
                article.setUrl(articleUrl != null ? articleUrl : "https://mediastack.com/" + uuid);
                article.setImage(item.getImage() != null ? item.getImage() : "");
                
                article.setAuthor(item.getAuthor() != null ? item.getAuthor() : "");
                String publisher = item.getSource();
                article.setPublisher(publisher != null ? publisher : "");
                
                article.setSourceId(getSourceId());
                article.setCategoryId(null);
                article.setLanguage("en");
                article.setPublishedAt(item.getPublishedAt() != null ? item.getPublishedAt() : Instant.now().toString());
                article.setHash(uuid);
                
                mappedArticles.add(article);
            }
            return mappedArticles;
        } catch (Exception e) {
            log.error("Failed to search Mediastack", e);
            return List.of();
        }
    }
}
