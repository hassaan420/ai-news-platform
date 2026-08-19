package com.newsplatform.news.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.Source;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import java.time.Duration;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.http.HttpStatus;

@Service
public class GeminiSearchService {

    private static final Logger log = LoggerFactory.getLogger(GeminiSearchService.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final GeminiRateLimiter rateLimiter;
    private final String apiKey;
    private final String model;
    
    private final AtomicLong negativeIdCounter = new AtomicLong(-1);

    public GeminiSearchService(
            RestTemplateBuilder restTemplateBuilder,
            ObjectMapper objectMapper,
            GeminiRateLimiter rateLimiter,
            @Value("${ai.gemini.api-keys:${GOOGLE_API_KEYS:${ai.gemini.api-key:${GOOGLE_API_KEY:}}}}") String rawApiKeys) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = objectMapper;
        this.rateLimiter = rateLimiter;
        this.model = "gemini-3.6-flash"; // Known working model with search grounding
        
        List<String> keys = Arrays.stream((rawApiKeys == null ? "" : rawApiKeys).split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        
        if (keys.size() > 1) {
            this.apiKey = keys.get(1); // Use second key as requested
        } else if (!keys.isEmpty()) {
            this.apiKey = keys.get(0);
        } else {
            this.apiKey = "";
        }
    }

    public List<Article> searchWebForRelatedArticles(String title) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("[GeminiSearchService] Cannot search: no API key configured");
            return List.of();
        }

        if (!rateLimiter.tryAcquire()) {
            log.warn("[GeminiSearchService] Rate limit active, skipping Gemini API call");
            return getMockFallbackData(title);
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

            String prompt = "Find 3 recent news articles related to: " + title;
            
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    )),
                    "tools", List.of(Map.of("googleSearch", Map.of()))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            return parseSearchResponse(response.getBody());

        } catch (HttpClientErrorException e) {
            log.error("[GeminiSearchService] HTTP error during Gemini Search: {} - {}", e.getStatusCode(), e.getMessage());
            if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                rateLimiter.recordRateLimitHit(-1);
            }
            return getMockFallbackData(title);
        } catch (Exception e) {
            log.error("[GeminiSearchService] Failed to perform Gemini Google Search for '{}': {}", title, e.getMessage());
            return getMockFallbackData(title);
        }
    }

    private List<Article> getMockFallbackData(String title) {
        Article mock1 = new Article();
        mock1.setId(-1L);
        mock1.setTitle("Mock: " + title + " - Coverage 1");
        mock1.setUrl("https://example.com/mock1");
        mock1.setPublishedAt(Instant.now());
        Source source1 = new Source("web", "Example News", null, "web", "ACTIVE");
        source1.setId(-1L);
        mock1.setSource(source1);

        Article mock2 = new Article();
        mock2.setId(-2L);
        mock2.setTitle("Mock: " + title + " - Coverage 2");
        mock2.setUrl("https://example.com/mock2");
        mock2.setPublishedAt(Instant.now());
        Source source2 = new Source("web", "Tech Daily", null, "web", "ACTIVE");
        source2.setId(-1L);
        mock2.setSource(source2);

        Article mock3 = new Article();
        mock3.setId(-3L);
        mock3.setTitle("Mock: " + title + " - Coverage 3");
        mock3.setUrl("https://example.com/mock3");
        mock3.setPublishedAt(Instant.now());
        Source source3 = new Source("web", "Global Report", null, "web", "ACTIVE");
        source3.setId(-1L);
        mock3.setSource(source3);

        return List.of(mock1, mock2, mock3);
    }

    private List<Article> parseSearchResponse(String responseBody) {
        List<Article> articles = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode groundingChunks = firstCandidate.path("groundingMetadata").path("groundingChunks");
                
                if (groundingChunks.isArray()) {
                    for (JsonNode chunk : groundingChunks) {
                        JsonNode web = chunk.path("web");
                        if (!web.isMissingNode()) {
                            String uri = web.path("uri").asText();
                            String title = web.path("title").asText();
                            
                            if (articles.stream().noneMatch(a -> a.getUrl() != null && a.getUrl().equals(uri))) {
                                Article article = new Article();
                                article.setId(negativeIdCounter.getAndDecrement());
                                article.setTitle(title);
                                article.setUrl(uri);
                                article.setPublishedAt(Instant.now());
                                
                                String sourceName = extractDomain(uri);
                                Source source = new Source("web", sourceName, null, "web", "ACTIVE");
                                source.setId(-1L);
                                article.setSource(source);
                                
                                articles.add(article);
                            }
                            
                            if (articles.size() >= 3) {
                                break;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("[GeminiSearchService] Failed to parse grounding metadata from Gemini response: {}", e.getMessage());
        }
        return articles;
    }
    
    private String extractDomain(String url) {
        try {
            URI uri = new URI(url);
            String domain = uri.getHost();
            return domain != null ? (domain.startsWith("www.") ? domain.substring(4) : domain) : "Web Search";
        } catch (Exception e) {
            return "Web Search";
        }
    }
}
