package com.newsplatform.scheduler.provider.impl;

import com.newsplatform.scheduler.provider.NewsProvider;
import com.newsplatform.scheduler.provider.dto.GuardianResponse;
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
public class GuardianProvider implements NewsProvider {

    private static final Logger log = LoggerFactory.getLogger(GuardianProvider.class);

    @Value("${GUARDIAN_KEY:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public GuardianProvider() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String getProviderName() {
        return "Guardian";
    }

    @Override
    public Long getSourceId() {
        return 3L; // Matches V6 migration
    }

    @Override
    public int getPriority() {
        return 2;
    }

    @Override
    public List<NormalizedArticle> fetchNews(String categorySlug, Long categoryId, java.time.Instant fromTime) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ProviderUnavailableException("Guardian key is missing.");
        }

        String section = categorySlug;
        if (section.equals("entertainment")) section = "culture";
        if (section.equals("sports")) section = "sport";
        if (section.equals("health")) section = "healthcare-network";

        String url;
        if (fromTime != null) {
            String fromDate = java.time.LocalDate.ofInstant(fromTime, java.time.ZoneOffset.UTC).toString();
            url = String.format("https://content.guardianapis.com/search?section=%s&show-fields=headline,thumbnail,bodyText&from-date=%s&api-key=%s", section, fromDate, apiKey);
        } else {
            url = String.format("https://content.guardianapis.com/search?section=%s&show-fields=headline,thumbnail,bodyText&api-key=%s", section, apiKey);
        }
        log.info("Fetching from Guardian for category: {} (fromTime={})", categorySlug, fromTime);
        
        GuardianResponse rootResponse;
        try {
            rootResponse = restTemplate.getForObject(url, GuardianResponse.class);
        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new ProviderUnavailableException("Guardian rate limit exceeded.", e);
        } catch (Exception e) {
            throw new ProviderUnavailableException("Failed to fetch from Guardian: " + e.getMessage(), e);
        }

        if (rootResponse == null || rootResponse.getResponse() == null || !"ok".equalsIgnoreCase(rootResponse.getResponse().getStatus())) {
            throw new ProviderUnavailableException("Guardian response was invalid or status not ok");
        }

        List<NormalizedArticle> mappedArticles = new ArrayList<>();
        if (rootResponse.getResponse().getResults() == null) return mappedArticles;

        for (GuardianResponse.Result item : rootResponse.getResponse().getResults()) {
            String title = item.getWebTitle();
            if (title == null || title.isBlank()) continue;
            
            NormalizedArticle article = new NormalizedArticle();
            article.setTitle(title);
            
            String content = "";
            String image = "";
            if (item.getFields() != null) {
                content = item.getFields().getBodyText() != null ? item.getFields().getBodyText() : "";
                image = item.getFields().getThumbnail() != null ? item.getFields().getThumbnail() : "";
            }
            
            String description = content;
            if (content.length() > 200) {
                description = content.substring(0, 200) + "...";
            }
            
            article.setDescription(description);
            article.setContent(content);
            
            String articleUrl = item.getWebUrl();
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
            article.setUrl(articleUrl != null ? articleUrl : "https://theguardian.com/" + uuid);
            article.setImage(image);
            article.setAuthor("The Guardian");
            
            article.setSourceId(getSourceId());
            article.setCategoryId(categoryId);
            article.setLanguage("en");
            article.setPublishedAt(item.getWebPublicationDate() != null ? item.getWebPublicationDate() : Instant.now().toString());
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
