package com.newsplatform.scheduler.provider.impl;

import com.newsplatform.scheduler.provider.NewsProvider;
import com.newsplatform.scheduler.provider.dto.GNewsResponse;
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
public class GNewsProvider implements NewsProvider {

    private static final Logger log = LoggerFactory.getLogger(GNewsProvider.class);

    @Value("${GNEWS_KEY:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public GNewsProvider() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String getProviderName() {
        return "GNews";
    }

    @Override
    public Long getSourceId() {
        return 2L; // Matches V6 migration
    }

    @Override
    public int getPriority() {
        return 4; // Lowest priority
    }

    @Override
    public List<NormalizedArticle> fetchNews(String categorySlug, Long categoryId, java.time.Instant fromTime) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ProviderUnavailableException("GNews key is missing.");
        }

        String url;
        if (fromTime != null) {
            String fromStr = java.time.format.DateTimeFormatter.ISO_INSTANT.format(fromTime);
            url = String.format("https://gnews.io/api/v4/top-headlines?category=%s&lang=en&from=%s&apikey=%s", categorySlug, fromStr, apiKey);
        } else {
            url = String.format("https://gnews.io/api/v4/top-headlines?category=%s&lang=en&apikey=%s", categorySlug, apiKey);
        }
        log.info("Fetching from GNews for category: {} (fromTime={})", categorySlug, fromTime);
        
        GNewsResponse response;
        try {
            response = restTemplate.getForObject(url, GNewsResponse.class);
        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new ProviderUnavailableException("GNews rate limit exceeded.", e);
        } catch (Exception e) {
            throw new ProviderUnavailableException("Failed to fetch from GNews: " + e.getMessage(), e);
        }

        if (response == null || response.getArticles() == null) {
            throw new ProviderUnavailableException("GNews response was invalid");
        }

        List<NormalizedArticle> mappedArticles = new ArrayList<>();
        
        for (GNewsResponse.Article item : response.getArticles()) {
            String title = item.getTitle();
            if (title == null || title.isBlank()) continue;
            
            NormalizedArticle article = new NormalizedArticle();
            article.setTitle(title);
            article.setDescription(item.getDescription() != null ? item.getDescription() : "");
            article.setContent(item.getContent() != null ? item.getContent() : article.getDescription());
            
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
            article.setUrl(articleUrl != null ? articleUrl : "https://gnews.io/" + uuid);
            
            article.setImage(item.getImage() != null ? item.getImage() : "");
            
            String author = "";
            if (item.getSource() != null && item.getSource().getName() != null) {
                author = item.getSource().getName();
            }
            article.setAuthor(author);
            
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
}
