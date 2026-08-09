package com.newsplatform.scheduler.provider.impl;

import com.newsplatform.scheduler.provider.NewsProvider;
import com.newsplatform.scheduler.provider.dto.NewsApiResponse;
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
public class NewsApiProvider implements NewsProvider {

    private static final Logger log = LoggerFactory.getLogger(NewsApiProvider.class);

    @Value("${NEWSAPI_KEY:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public NewsApiProvider() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String getProviderName() {
        return "NewsAPI";
    }

    @Override
    public Long getSourceId() {
        return 1L; // Matches V6 migration
    }

    @Override
    public int getPriority() {
        return 1;
    }

    @Override
    public List<NormalizedArticle> fetchNews(String categorySlug, Long categoryId, java.time.Instant fromTime) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ProviderUnavailableException("NewsAPI key is missing.");
        }

        String url;
        if (fromTime != null) {
            String fromStr = java.time.format.DateTimeFormatter.ISO_INSTANT.format(fromTime);
            url = String.format("https://newsapi.org/v2/top-headlines?category=%s&language=en&from=%s&apiKey=%s", categorySlug, fromStr, apiKey);
        } else {
            url = String.format("https://newsapi.org/v2/top-headlines?category=%s&language=en&apiKey=%s", categorySlug, apiKey);
        }
        log.info("Fetching from NewsAPI for category: {} (fromTime={})", categorySlug, fromTime);
        
        NewsApiResponse response;
        try {
            response = restTemplate.getForObject(url, NewsApiResponse.class);
        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new ProviderUnavailableException("NewsAPI rate limit exceeded.", e);
        } catch (Exception e) {
            throw new ProviderUnavailableException("Failed to fetch from NewsAPI: " + e.getMessage(), e);
        }

        if (response == null || !"ok".equals(response.getStatus())) {
            throw new ProviderUnavailableException("NewsAPI response was invalid or status not ok");
        }

        List<NormalizedArticle> mappedArticles = new ArrayList<>();
        if (response.getArticles() == null) return mappedArticles;

        for (NewsApiResponse.Article item : response.getArticles()) {
            String title = item.getTitle();
            if (title == null || title.isBlank() || "[Removed]".equals(title)) continue;
            
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
            article.setUrl(articleUrl != null ? articleUrl : "https://newsapi.org/" + uuid);
            
            article.setImage(item.getUrlToImage() != null ? item.getUrlToImage() : "");
            
            String author = item.getAuthor();
            if (author == null || author.isBlank()) {
                author = (item.getSource() != null) ? item.getSource().getName() : "";
            }
            article.setAuthor(author != null ? author : "");
            
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
