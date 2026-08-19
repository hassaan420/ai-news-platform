package com.newsplatform.scheduler.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newsplatform.scheduler.client.NewsServiceClient;
import com.newsplatform.scheduler.entity.FetchLog;
import com.newsplatform.scheduler.provider.NewsProvider;
import com.newsplatform.scheduler.provider.dto.NormalizedArticle;
import com.newsplatform.scheduler.provider.exception.ProviderUnavailableException;
import com.newsplatform.scheduler.repository.FetchLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SchedulerService {

    private static final Logger log = LoggerFactory.getLogger(SchedulerService.class);
    private static final long COOLDOWN_DURATION_MS = 15 * 60 * 1000; // 15 mins

    private final NewsServiceClient newsServiceClient;
    private final FetchLogRepository fetchLogRepository;
    private final RestTemplate restTemplate;
    private final List<NewsProvider> providers;
    private final ObjectMapper objectMapper;
    private final Map<String, Long> cooldowns;

    @Value("${internal.api.key:internal-service-key-2026}")
    private String internalApiKey;

    @Value("${CATEGORY_SERVICE_URL:http://category-service:8083}")
    private String categoryServiceUrl;

    @Autowired
    public SchedulerService(NewsServiceClient newsServiceClient, 
                            FetchLogRepository fetchLogRepository, 
                            List<NewsProvider> providers,
                            ObjectMapper objectMapper) {
        this.newsServiceClient = newsServiceClient;
        this.fetchLogRepository = fetchLogRepository;
        this.restTemplate = new RestTemplate();
        this.providers = providers;
        this.objectMapper = objectMapper;
        this.cooldowns = new ConcurrentHashMap<>();
        
        // Sort providers by priority (lowest number first)
        this.providers.sort(Comparator.comparingInt(NewsProvider::getPriority));
    }

    @Value("${news.ingestion.timezone:Asia/Karachi}")
    private String ingestionTimezone;

    @Value("${news.ingestion.window-hours:48}")
    private int ingestionWindowHours;

    @Scheduled(fixedRateString = "${scheduler.fetch-rate:900000}")
    public void fetchNewsTask() {
        log.info("Starting scheduled news fetch task (timezone={}, windowHours={})", ingestionTimezone, ingestionWindowHours);
        triggerFetch();
    }

    public void triggerFetch() {
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

        for (NewsProvider provider : providers) {
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
                    saveLog(fetchLog, startTime, "SUCCESS", "0 articles returned", 0);
                    continue;
                }

                // Application-side Date Validation & Local Deduplication
                List<NormalizedArticle> validArticles = new ArrayList<>();
                for (NormalizedArticle article : articles) {
                    if (article.getUrl() == null || seenUrls.contains(article.getUrl())) {
                        continue; // Skip duplicate URL
                    }

                    // Validate publication date
                    Instant pubTime = null;
                    if (article.getPublishedAt() != null) {
                        try {
                            pubTime = Instant.parse(article.getPublishedAt());
                        } catch (Exception e) {
                            try {
                                pubTime = java.time.OffsetDateTime.parse(article.getPublishedAt()).toInstant();
                            } catch (Exception ex) {
                                log.warn("[ARTICLE-REJECTED] provider={} title='{}' publishedAt='{}' reason='Unparseable date format'",
                                        provider.getProviderName(), article.getTitle(), article.getPublishedAt());
                                continue;
                            }
                        }
                    }

                    if (pubTime == null) {
                        log.warn("[ARTICLE-REJECTED] provider={} title='{}' publishedAt=null reason='Missing publication date'",
                                provider.getProviderName(), article.getTitle());
                        continue;
                    }
                    if (pubTime.isAfter(maxFutureTime)) {
                        log.warn("[ARTICLE-REJECTED] provider={} title='{}' publishedAt={} reason='Future publication date'",
                                provider.getProviderName(), article.getTitle(), pubTime);
                        continue;
                    }
                    if (pubTime.isBefore(fromTime)) {
                        log.warn("[ARTICLE-REJECTED] provider={} title='{}' publishedAt={} reason='Older than ingestion window ({}h)'",
                                provider.getProviderName(), article.getTitle(), pubTime, ingestionWindowHours);
                        continue;
                    }

                    // Truncate fields to match NewsRequest validation constraints
                    if (article.getTitle() != null && article.getTitle().length() > 500) {
                        article.setTitle(article.getTitle().substring(0, 497) + "...");
                    }
                    if (article.getDescription() != null && article.getDescription().length() > 1000) {
                        article.setDescription(article.getDescription().substring(0, 997) + "...");
                    }
                    if (article.getImage() != null && article.getImage().length() > 1000) {
                        article.setImage(article.getImage().substring(0, 1000));
                    }
                    if (article.getUrl() != null && article.getUrl().length() > 1000) {
                        article.setUrl(article.getUrl().substring(0, 1000));
                    }
                    if (article.getAuthor() != null && article.getAuthor().length() > 200) {
                        article.setAuthor(article.getAuthor().substring(0, 197) + "...");
                    }
                    
                    validArticles.add(article);
                    seenUrls.add(article.getUrl());
                }
                
                if (validArticles.isEmpty()) {
                    log.info("Provider {} returned {} articles, but all were duplicates or outside the date window.",
                            provider.getProviderName(), articles.size());
                    saveLog(fetchLog, startTime, "SUCCESS", "All articles filtered out", 0);
                    continue;
                }
                
                // Convert NormalizedArticle to Map<String, Object> for Feign Client
                List<Map<String, Object>> requestPayload = objectMapper.convertValue(validArticles, new TypeReference<List<Map<String, Object>>>() {});
                
                // Push to News Service (NewsService handles DB duplication checking via Hash)
                newsServiceClient.saveBulkNews(internalApiKey, requestPayload);
                
                log.info("Successfully fetched and saved {} valid articles using {}", validArticles.size(), provider.getProviderName());
                saveLog(fetchLog, startTime, "SUCCESS", null, validArticles.size());
                
            } catch (ProviderUnavailableException e) {
                log.error("Provider {} is unavailable (rate limit/quota): {}. Placing in cooldown.", 
                          provider.getProviderName(), e.getMessage());
                cooldowns.put(provider.getProviderName(), System.currentTimeMillis() + COOLDOWN_DURATION_MS);
                saveLog(fetchLog, startTime, "FAILED", e.getMessage(), 0);
            } catch (Exception e) {
                log.error("Failed to fetch news from {} for {}: {}", 
                          provider.getProviderName(), categorySlug, e.getMessage(), e);
                saveLog(fetchLog, startTime, "FAILED", e.getMessage(), 0);
            }
        }
    }

    private void saveLog(FetchLog fetchLog, long startTime, String status, String error, int count) {
        fetchLog.setStatus(status);
        if (error != null) {
            fetchLog.setErrorMessage(error);
        }
        fetchLog.setArticlesFetched(count);
        fetchLog.setArticlesStored(count);
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

    public List<NewsProvider> getProviders() {
        return providers;
    }
}
