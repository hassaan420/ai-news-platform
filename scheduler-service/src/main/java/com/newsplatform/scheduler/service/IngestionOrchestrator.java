package com.newsplatform.scheduler.service;

import com.newsplatform.scheduler.client.NewsServiceClient;
import com.newsplatform.scheduler.entity.FetchLog;
import com.newsplatform.scheduler.provider.NewsProvider;
import com.newsplatform.scheduler.provider.NewsProviderFactory;
import com.newsplatform.scheduler.provider.dto.NormalizedArticle;
import com.newsplatform.scheduler.provider.exception.ProviderUnavailableException;
import com.newsplatform.scheduler.repository.FetchLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IngestionOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(IngestionOrchestrator.class);
    private static final long COOLDOWN_DURATION_MS = 15 * 60 * 1000; // 15 mins

    private final NewsServiceClient newsServiceClient;
    private final FetchLogRepository fetchLogRepository;
    private final RestTemplate restTemplate;
    private final NewsProviderFactory providerFactory;
    private final Map<String, Long> cooldowns;

    @Value("${internal.api.key:internal-service-key-2026}")
    private String internalApiKey;

    @Value("${CATEGORY_SERVICE_URL:http://category-service:8083}")
    private String categoryServiceUrl;

    @Value("${news.ingestion.window-hours:48}")
    private int ingestionWindowHours;

    public IngestionOrchestrator(NewsServiceClient newsServiceClient,
                                 FetchLogRepository fetchLogRepository,
                                 NewsProviderFactory providerFactory) {
        this.newsServiceClient = newsServiceClient;
        this.fetchLogRepository = fetchLogRepository;
        this.providerFactory = providerFactory;
        this.restTemplate = new RestTemplate();
        this.cooldowns = new ConcurrentHashMap<>();
    }

    public void runIngestionPipeline() {
        String[] categorySlugs = {"technology", "sports", "business", "health", "politics", "entertainment"};
        Set<String> seenUrls = new HashSet<>();

        for (String slug : categorySlugs) {
            Long categoryId = fetchCategoryId(slug);
            fetchCategoryFromAllProviders(slug, categoryId, seenUrls);
        }
    }

    private void fetchCategoryFromAllProviders(String categorySlug, Long categoryId, Set<String> seenUrls) {
        Instant now = Instant.now();
        Instant fromTime = now.minus(ingestionWindowHours, java.time.temporal.ChronoUnit.HOURS);
        Instant maxFutureTime = now.plus(5, java.time.temporal.ChronoUnit.MINUTES);

        for (NewsProvider provider : providerFactory.getAllProviders()) {
            long startTime = System.currentTimeMillis();

            if (cooldowns.containsKey(provider.getProviderName())) {
                long unlockTime = cooldowns.get(provider.getProviderName());
                if (System.currentTimeMillis() < unlockTime) {
                    log.info("Provider {} is in cooldown. Skipping...", provider.getProviderName());
                    continue;
                } else {
                    cooldowns.remove(provider.getProviderName());
                }
            }

            FetchLog fetchLog = new FetchLog();
            fetchLog.setSourceId(provider.getSourceId());
            fetchLog.setFetchedAt(Instant.now());

            try {
                log.info("Attempting fetch from {} for category {} (fromTime={})", provider.getProviderName(), categorySlug, fromTime);
                List<NormalizedArticle> articles = provider.fetchNews(categorySlug, categoryId, fromTime);

                if (articles == null || articles.isEmpty()) {
                    log.info("Provider {} returned 0 articles for category {}", provider.getProviderName(), categorySlug);
                    saveLog(fetchLog, startTime, "SUCCESS", "0 articles returned", 0, 0, 0);
                    continue;
                }

                List<Map<String, Object>> validArticles = new ArrayList<>();
                int duplicates = 0;

                for (NormalizedArticle article : articles) {
                    if (article.getUrl() == null || seenUrls.contains(article.getUrl())) {
                        duplicates++;
                        continue;
                    }

                    Instant pubTime = null;
                    if (article.getPublishedAt() != null) {
                        try { pubTime = Instant.parse(article.getPublishedAt()); } catch (Exception e) {
                            try { pubTime = java.time.OffsetDateTime.parse(article.getPublishedAt()).toInstant(); } catch (Exception ex) {}
                        }
                    }

                    if (pubTime == null || pubTime.isAfter(maxFutureTime) || pubTime.isBefore(fromTime)) {
                        continue;
                    }

                    Map<String, Object> payload = new HashMap<>();
                    payload.put("title", truncate(article.getTitle(), 500));
                    payload.put("description", truncate(article.getDescription(), 1000));
                    payload.put("content", article.getContent());
                    payload.put("image", truncate(article.getImage(), 1000));
                    payload.put("url", truncate(article.getUrl(), 1000));
                    payload.put("author", truncate(article.getAuthor(), 200));
                    payload.put("sourceId", provider.getSourceId());
                    payload.put("categorySlug", categorySlug);
                    payload.put("publishedAt", pubTime.toString());

                    validArticles.add(payload);
                    seenUrls.add(article.getUrl());
                }

                if (validArticles.isEmpty()) {
                    saveLog(fetchLog, startTime, "SUCCESS", "All articles filtered out", articles.size(), 0, duplicates);
                    continue;
                }

                Map<String, Object> result = newsServiceClient.ingestArticles(internalApiKey, validArticles);
                
                int stored = 0;
                int dups = duplicates;
                if (result != null) {
                    stored = (int) result.getOrDefault("articlesStored", 0);
                    dups += (int) result.getOrDefault("duplicatesSkipped", 0);
                }

                log.info("Successfully fetched and saved {} valid articles using {}", validArticles.size(), provider.getProviderName());
                saveLog(fetchLog, startTime, "SUCCESS", null, articles.size(), stored, dups);

            } catch (ProviderUnavailableException e) {
                log.error("Provider {} is unavailable (rate limit/quota): {}. Placing in cooldown.", provider.getProviderName(), e.getMessage());
                cooldowns.put(provider.getProviderName(), System.currentTimeMillis() + COOLDOWN_DURATION_MS);
                saveLog(fetchLog, startTime, "FAILED", e.getMessage(), 0, 0, 0);
            } catch (Exception e) {
                log.error("Failed to fetch news from {} for {}: {}", provider.getProviderName(), categorySlug, e.getMessage(), e);
                saveLog(fetchLog, startTime, "FAILED", e.getMessage(), 0, 0, 0);
            }
        }
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return null;
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    }

    private void saveLog(FetchLog fetchLog, long startTime, String status, String error, int fetched, int stored, int duplicates) {
        fetchLog.setStatus(status);
        if (error != null) {
            fetchLog.setErrorMessage(error);
        }
        fetchLog.setArticlesFetched(fetched);
        fetchLog.setArticlesStored(stored);
        fetchLog.setDuplicatesSkipped(duplicates);
        fetchLog.setExecutionTimeMs((int) (System.currentTimeMillis() - startTime));
        fetchLogRepository.save(fetchLog);
    }

    private Long fetchCategoryId(String slug) {
        try {
            Map<String, Object> category = restTemplate.getForObject(categoryServiceUrl + "/api/categories/slug/" + slug, Map.class);
            if (category != null && category.get("id") != null) {
                return ((Number) category.get("id")).longValue();
            }
        } catch (Exception e) {
            log.warn("Could not fetch category by slug: {}. Using default (1L).", slug);
        }
        return 1L; // fallback
    }
}
