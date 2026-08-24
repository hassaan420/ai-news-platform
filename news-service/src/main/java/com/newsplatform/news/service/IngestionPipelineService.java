package com.newsplatform.news.service;

import com.newsplatform.news.client.CategoryServiceClient;
import com.newsplatform.news.dto.ArticleIngestDto;
import com.newsplatform.news.dto.IngestionResultDto;
import com.newsplatform.news.dto.NewsRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class IngestionPipelineService {

    private static final Logger logger = LoggerFactory.getLogger(IngestionPipelineService.class);

    private final DuplicateDetectionService duplicateDetectionService;
    private final CacheEvictionService cacheEvictionService;
    private final ArticleService articleService;
    private final CategoryServiceClient categoryServiceClient;

    @Value("${news.security.internal-api-key:internal-secret-key}")
    private String internalApiKey;

    // Cache valid category mappings locally to avoid hammering category-service for every article
    private Map<String, Long> categorySlugToIdMap = null;

    public IngestionPipelineService(DuplicateDetectionService duplicateDetectionService,
                                    CacheEvictionService cacheEvictionService,
                                    ArticleService articleService,
                                    CategoryServiceClient categoryServiceClient) {
        this.duplicateDetectionService = duplicateDetectionService;
        this.cacheEvictionService = cacheEvictionService;
        this.articleService = articleService;
        this.categoryServiceClient = categoryServiceClient;
    }

    public IngestionResultDto ingestArticles(List<ArticleIngestDto> articles) {
        int fetched = articles.size();
        int stored = 0;
        int duplicates = 0;
        List<String> errors = new ArrayList<>();
        Set<String> affectedCategorySlugs = new HashSet<>();
        boolean anyStored = false;

        refreshCategoryCacheIfEmpty();

        for (ArticleIngestDto dto : articles) {
            try {
                Long categoryId = categorySlugToIdMap.getOrDefault(dto.categorySlug(), 1L);

                String hash = duplicateDetectionService.computeArticleHash(dto.title(), dto.url());

                NewsRequest newsRequest = new NewsRequest(
                        dto.sourceId(),
                        categoryId,
                        dto.title(),
                        dto.description(),
                        dto.content(),
                        dto.image(),
                        dto.url(),
                        dto.author(),
                        "en",
                        dto.publishedAt(),
                        hash
                );

                try {
                    articleService.createInternalNews(newsRequest);
                    stored++;
                    anyStored = true;
                    if (dto.categorySlug() != null) {
                        affectedCategorySlugs.add(dto.categorySlug());
                    }
                } catch (com.newsplatform.common.exception.ConflictException e) {
                    duplicates++;
                }
                
            } catch (Exception e) {
                logger.error("Failed to ingest article: {}", dto.title(), e);
                errors.add("Failed to ingest article '" + dto.title() + "': " + e.getMessage());
            }
        }

        if (anyStored) {
            cacheEvictionService.evictHomepageCache();
            cacheEvictionService.evictTrendingCache();
            for (String slug : affectedCategorySlugs) {
                cacheEvictionService.evictCategoryCache(slug);
            }
        }

        return new IngestionResultDto(fetched, stored, duplicates, errors);
    }

    private void refreshCategoryCacheIfEmpty() {
        if (categorySlugToIdMap == null) {
            categorySlugToIdMap = new HashMap<>();
            try {
                List<com.newsplatform.news.dto.CategoryDto> categories = categoryServiceClient.getAllCategories();
                for (com.newsplatform.news.dto.CategoryDto cat : categories) {
                    categorySlugToIdMap.put(cat.slug(), cat.id());
                }
            } catch (Exception e) {
                logger.warn("Could not fetch categories from category-service. Will proceed with empty cache.", e);
            }
        }
    }
}
