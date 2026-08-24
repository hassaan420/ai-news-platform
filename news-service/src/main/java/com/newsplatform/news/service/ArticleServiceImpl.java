package com.newsplatform.news.service;

import com.newsplatform.common.exception.ConflictException;
import com.newsplatform.common.exception.ResourceNotFoundException;
import com.newsplatform.news.dto.*;
import com.newsplatform.common.dto.PagedResponse;
import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.Source;
import com.newsplatform.news.mapper.NewsMapper;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.SourceRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final SourceRepository sourceRepository;
    private final NewsMapper newsMapper;
    private final org.springframework.web.client.RestTemplate restTemplate;
    private final com.newsplatform.news.repository.AiProcessingQueueRepository aiProcessingQueueRepository;
    private final com.newsplatform.news.service.ArticleAiProcessingService aiProcessingService;
    private final com.newsplatform.news.repository.ArticleStatsRepository articleStatsRepository;
    private final com.newsplatform.news.repository.ArticleVerificationRepository verificationRepository;

    public ArticleServiceImpl(ArticleRepository articleRepository, 
                              SourceRepository sourceRepository, 
                              NewsMapper newsMapper, 
                              org.springframework.web.client.RestTemplate restTemplate,
                              com.newsplatform.news.repository.AiProcessingQueueRepository aiProcessingQueueRepository,
                              com.newsplatform.news.service.ArticleAiProcessingService aiProcessingService,
                              com.newsplatform.news.repository.ArticleStatsRepository articleStatsRepository,
                              com.newsplatform.news.repository.ArticleVerificationRepository verificationRepository) {
        this.articleRepository = articleRepository;
        this.sourceRepository = sourceRepository;
        this.newsMapper = newsMapper;
        this.restTemplate = restTemplate;
        this.aiProcessingQueueRepository = aiProcessingQueueRepository;
        this.aiProcessingService = aiProcessingService;
        this.articleStatsRepository = articleStatsRepository;
        this.verificationRepository = verificationRepository;
    }

    @Override
    public PagedResponse<NewsSummaryResponse> getArticles(Pageable pageable) {
        return createPagedResponse(articleRepository.findAll(pageable));
    }

    @Override
    public NewsResponse getArticleById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));
        
        List<NewsSummaryResponse> related = articleRepository.findTop5ByCategoryIdAndIdNot(article.getCategoryId(), id)
                .stream()
                .map(newsMapper::toNewsSummaryResponse)
                .collect(Collectors.toList());

        NewsResponse baseResponse = newsMapper.toNewsResponse(article);
        return new NewsResponse(
                baseResponse.id(),
                baseResponse.title(),
                baseResponse.description(),
                baseResponse.content(),
                baseResponse.image(),
                baseResponse.url(),
                baseResponse.author(),
                baseResponse.language(),
                baseResponse.publishedAt(),
                baseResponse.hash(),
                baseResponse.categoryId(),
                baseResponse.source(),
                baseResponse.summary(),
                baseResponse.sentiment(),
                baseResponse.sentimentScore(),
                baseResponse.readingTime(),
                baseResponse.topicClassification(),
                baseResponse.recommendationScore(),
                baseResponse.trendingScore(),
                baseResponse.aiConfidence(),
                baseResponse.processingStatus(),
                baseResponse.processedAt(),
                baseResponse.keywords(),
                baseResponse.tags(),
                related,
                baseResponse.views(),
                baseResponse.bookmarks()
        );
    }

    @Override
    @Cacheable(value = "latest_articles", key = "#p0.pageNumber + '-' + #p0.pageSize + '-' + (#p1 != null ? #p1 : 'LATEST') + '-' + (#p2 != null ? #p2 : '') + '-' + (#p3 != null ? #p3 : '')")
    public PagedResponse<NewsSummaryResponse> getLatestArticles(Pageable pageable, String dateFilter, String from, String to) {
        if (dateFilter == null || dateFilter.isBlank()) {
            dateFilter = "LATEST";
        }
        
        java.time.ZoneId zoneId = java.time.ZoneOffset.UTC;
        java.time.ZonedDateTime now = java.time.ZonedDateTime.now(zoneId);
        
        return switch (dateFilter.toUpperCase()) {
            case "TODAY" -> {
                java.time.Instant start = now.toLocalDate().atStartOfDay(zoneId).toInstant();
                java.time.Instant end = now.toLocalDate().plusDays(1).atStartOfDay(zoneId).toInstant();
                yield createPagedResponse(articleRepository.findAllByPublishedAtBetweenOrderByPublishedAtDesc(start, end, pageable));
            }
            case "YESTERDAY" -> {
                java.time.Instant start = now.toLocalDate().minusDays(1).atStartOfDay(zoneId).toInstant();
                java.time.Instant end = now.toLocalDate().atStartOfDay(zoneId).toInstant();
                yield createPagedResponse(articleRepository.findAllByPublishedAtBetweenOrderByPublishedAtDesc(start, end, pageable));
            }
            case "LAST_7_DAYS" -> {
                java.time.Instant start = now.toLocalDate().minusDays(7).atStartOfDay(zoneId).toInstant();
                yield createPagedResponse(articleRepository.findAllByPublishedAtAfterOrderByPublishedAtDesc(start, pageable));
            }
            case "LAST_30_DAYS" -> {
                java.time.Instant start = now.toLocalDate().minusDays(30).atStartOfDay(zoneId).toInstant();
                yield createPagedResponse(articleRepository.findAllByPublishedAtAfterOrderByPublishedAtDesc(start, pageable));
            }
            case "OLDER" -> {
                java.time.Instant end = now.toLocalDate().minusDays(30).atStartOfDay(zoneId).toInstant();
                yield createPagedResponse(articleRepository.findAllByPublishedAtBeforeOrderByPublishedAtDesc(end, pageable));
            }
            case "CUSTOM" -> {
                if (from != null && to != null && !from.isBlank() && !to.isBlank()) {
                    try {
                        java.time.LocalDate fromDate = java.time.LocalDate.parse(from);
                        java.time.LocalDate toDate = java.time.LocalDate.parse(to);
                        if (fromDate.isAfter(toDate)) {
                            throw new com.newsplatform.common.exception.BadRequestException("From date cannot be after To date");
                        }
                        java.time.Instant start = fromDate.atStartOfDay(zoneId).toInstant();
                        java.time.Instant end = toDate.plusDays(1).atStartOfDay(zoneId).toInstant();
                        yield createPagedResponse(articleRepository.findAllByPublishedAtBetweenOrderByPublishedAtDesc(start, end, pageable));
                    } catch (java.time.format.DateTimeParseException e) {
                        throw new com.newsplatform.common.exception.BadRequestException("Invalid date format. Expected YYYY-MM-DD");
                    }
                }
                yield createPagedResponse(articleRepository.findAllByOrderByPublishedAtDesc(pageable));
            }
            default -> createPagedResponse(articleRepository.findAllByOrderByPublishedAtDesc(pageable));
        };
    }

    @Override
    @Cacheable(value = "trending_articles", key = "#p0.pageNumber + '-' + #p0.pageSize")
    public PagedResponse<NewsSummaryResponse> getTrendingArticles(Pageable pageable) {
        return createPagedResponse(articleRepository.findAllByOrderByTrendingScoreDesc(pageable));
    }

    @Override
    public PagedResponse<NewsSummaryResponse> getArticlesByCategory(Long categoryId, Pageable pageable) {
        return createPagedResponse(articleRepository.findByCategoryIdOrderByPublishedAtDesc(categoryId, pageable));
    }

    @Override
    @Cacheable(value = "category_articles_slug", key = "#p0 + '-' + #p1.pageNumber + '-' + #p1.pageSize")
    public PagedResponse<NewsSummaryResponse> getArticlesByCategorySlug(String slug, Pageable pageable) {
        try {
            CategoryDto category = restTemplate.getForObject("http://category-service:8083/api/categories/" + slug, CategoryDto.class);
            if (category == null) {
                throw new ResourceNotFoundException("Category not found with slug: " + slug);
            }
            return getArticlesByCategory(category.id(), pageable);
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("Category not found with slug: " + slug);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch category information", e);
        }
    }

    @Override
    @Cacheable(value = "category_trending_slug", key = "#p0 + '-' + #p1.pageNumber + '-' + #p1.pageSize")
    public PagedResponse<NewsSummaryResponse> getTrendingArticlesByCategorySlug(String slug, Pageable pageable) {
        try {
            CategoryDto category = restTemplate.getForObject("http://category-service:8083/api/categories/" + slug, CategoryDto.class);
            if (category == null) {
                throw new ResourceNotFoundException("Category not found with slug: " + slug);
            }
            return createPagedResponse(articleRepository.findByCategoryIdOrderByTrendingScoreDesc(category.id(), pageable));
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("Category not found with slug: " + slug);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch category information", e);
        }
    }

    @Override
    public PagedResponse<NewsSummaryResponse> getArticlesBySource(Long sourceId, Pageable pageable) {
        return createPagedResponse(articleRepository.findBySourceIdOrderByPublishedAtDesc(sourceId, pageable));
    }

    @Override
    public PagedResponse<NewsSearchResponse> searchArticles(String keyword, String categorySlug, String sourceName, String author, String dateFrom, String dateTo, Pageable pageable) {
        Long categoryId = null;
        if (categorySlug != null && !categorySlug.isBlank()) {
            try {
                CategoryDto category = restTemplate.getForObject("http://category-service:8083/api/categories/" + categorySlug, CategoryDto.class);
                if (category != null) {
                    categoryId = category.id();
                }
            } catch (Exception e) {
                // Ignore or log
            }
        }

        Long sourceId = null;
        if (sourceName != null && !sourceName.isBlank()) {
            Optional<Source> source = sourceRepository.findByNameIgnoreCase(sourceName);
            if (source.isPresent()) {
                sourceId = source.get().getId();
            }
        }

        java.time.Instant fromInstant = null;
        java.time.Instant toInstant = null;
        if (dateFrom != null && !dateFrom.isBlank()) {
            try { fromInstant = java.time.Instant.parse(dateFrom); } catch (Exception e) {}
        }
        if (dateTo != null && !dateTo.isBlank()) {
            try { toInstant = java.time.Instant.parse(dateTo); } catch (Exception e) {}
        }

        Page<Article> articlePage = articleRepository.searchArticles(keyword, categoryId, sourceId, author, fromInstant, toInstant, pageable);
        List<NewsSearchResponse> content = articlePage.getContent().stream()
                .map(newsMapper::toNewsSearchResponse)
                .collect(Collectors.toList());
        return new PagedResponse<>(
                content,
                articlePage.getNumber(),
                articlePage.getSize(),
                articlePage.getTotalElements(),
                articlePage.getTotalPages(),
                articlePage.isLast()
        );
    }

    @Override
    @Transactional
    public NewsResponse createInternalNews(NewsRequest request) {
        if (articleRepository.findByHash(request.hash()).isPresent()) {
            throw new ConflictException("Article with hash '" + request.hash() + "' already exists");
        }
        
        Source source = sourceRepository.findById(request.sourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Source not found with id: " + request.sourceId()));

        Article article = newsMapper.toEntity(request);
        article.setSource(source);
        article.setCategoryId(request.categoryId());

        Article savedArticle = articleRepository.save(article);

        // Initialize ArticleStats for views/bookmarks/trending tracking
        com.newsplatform.news.entity.ArticleStats stats = new com.newsplatform.news.entity.ArticleStats();
        stats.setArticle(savedArticle);
        stats.setViews(0);
        stats.setBookmarks(0);
        stats.setTrendingScore(50.0);
        articleStatsRepository.save(stats);

        // Queue the article for AI processing
        com.newsplatform.news.entity.AiProcessingQueue queueItem = new com.newsplatform.news.entity.AiProcessingQueue();
        queueItem.setArticle(savedArticle);
        queueItem.setStatus("PENDING");
        queueItem.setTaskType("NLP_ANALYSIS"); // FIX BUG-2: taskType is NOT NULL in DB schema
        queueItem.setRetryCount(0);
        com.newsplatform.news.entity.AiProcessingQueue savedQueue = aiProcessingQueueRepository.save(queueItem);
        
        // Trigger async processing
        aiProcessingService.processArticleAsync(savedArticle.getId(), savedQueue.getId());

        return newsMapper.toNewsResponse(savedArticle);
    }

    @org.springframework.beans.factory.annotation.Value("${news.ingestion.window-hours:48}")
    private int ingestionWindowHours;

    @Override
    @Transactional
    public List<NewsResponse> createInternalNewsBulk(List<NewsRequest> requests) {
        java.time.Instant now = java.time.Instant.now();
        java.time.Instant minValidTime = now.minus(ingestionWindowHours, java.time.temporal.ChronoUnit.HOURS);
        java.time.Instant maxValidTime = now.plus(5, java.time.temporal.ChronoUnit.MINUTES);

        List<NewsRequest> validRequests = new ArrayList<>();
        for (NewsRequest req : requests) {
            if (req.publishedAt() == null) {
                org.slf4j.LoggerFactory.getLogger(ArticleServiceImpl.class).warn(
                        "[ARTICLE-REJECTED] provider=SourceId({}) title='{}' publishedAt=null reason='Missing publishedAt'",
                        req.sourceId(), req.title());
                continue;
            }
            if (req.publishedAt().isAfter(maxValidTime)) {
                org.slf4j.LoggerFactory.getLogger(ArticleServiceImpl.class).warn(
                        "[ARTICLE-REJECTED] provider=SourceId({}) title='{}' publishedAt={} reason='Future publication date'",
                        req.sourceId(), req.title(), req.publishedAt());
                continue;
            }
            if (req.publishedAt().isBefore(minValidTime)) {
                org.slf4j.LoggerFactory.getLogger(ArticleServiceImpl.class).warn(
                        "[ARTICLE-REJECTED] provider=SourceId({}) title='{}' publishedAt={} reason='Older than ingestion window ({}h)'",
                        req.sourceId(), req.title(), req.publishedAt(), ingestionWindowHours);
                continue;
            }
            validRequests.add(req);
        }

        return validRequests.stream()
                .filter(req -> articleRepository.findByHash(req.hash()).isEmpty())
                .map(this::createInternalNews)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public int deduplicateNews() {
        return articleRepository.deleteDuplicateArticlesByUrl();
    }

    @Override
    @Transactional
    public void deleteInternalNews(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));
        articleRepository.delete(article);
    }

    @Override
    @Cacheable(value = "article_verification", key = "#p0")
    public com.newsplatform.news.dto.ArticleVerificationDto getVerification(Long articleId) {
        com.newsplatform.news.entity.ArticleVerification verification = verificationRepository.findByArticleId(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification data not found for article: " + articleId));
        
        List<com.newsplatform.news.dto.VerificationSourceDto> sources = verification.getVerificationSources().stream()
                .map(s -> new com.newsplatform.news.dto.VerificationSourceDto(
                        s.getId(), s.getSourceName(), s.getUrl(), s.getPublishedAt(), s.getSimilarityScore(), s.getRelationship()))
                .collect(Collectors.toList());
                
        List<com.newsplatform.news.dto.VerificationConflictDto> conflicts = verification.getVerificationConflicts().stream()
                .map(c -> new com.newsplatform.news.dto.VerificationConflictDto(
                        c.getId(), c.getClaimText(), c.getConflictingSourceUrl()))
                .collect(Collectors.toList());
                
        return new com.newsplatform.news.dto.ArticleVerificationDto(
                verification.getId(),
                verification.getStatus(),
                verification.getVerificationScore(),
                verification.getSourcesFound(),
                verification.getIndependentSources(),
                verification.getLastVerifiedAt(),
                sources,
                conflicts
        );
    }

    private PagedResponse<NewsSummaryResponse> createPagedResponse(Page<Article> page) {
        List<NewsSummaryResponse> content = page.getContent().stream()
                .map(newsMapper::toNewsSummaryResponse)
                .collect(Collectors.toList());
        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    public com.newsplatform.news.dto.CategoryMetricsResponse getCategoryMetrics(String slug) {
        Long categoryId = null;
        try {
            CategoryDto category = restTemplate.getForObject("http://category-service:8083/api/categories/" + slug, CategoryDto.class);
            if (category != null) {
                categoryId = category.id();
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(ArticleServiceImpl.class).warn("Could not fetch category id for slug: {}", slug);
        }
        
        if (categoryId == null) {
            throw new ResourceNotFoundException("Category not found with slug: " + slug);
        }

        long totalArticles = articleRepository.countByCategoryId(categoryId);
        Double avgSentimentScore = articleRepository.getAverageSentimentScoreByCategoryId(categoryId);
        
        String sentimentStatus = "Neutral";
        String sentimentIcon = "horizontal_rule";
        if (avgSentimentScore != null) {
            if (avgSentimentScore > 0.2) {
                sentimentStatus = "Trending Up";
                sentimentIcon = "trending_up";
            } else if (avgSentimentScore < -0.2) {
                sentimentStatus = "Trending Down";
                sentimentIcon = "trending_down";
            }
        }

        List<com.newsplatform.news.dto.CategoryMetricsResponse.SummaryMetric> summaries = new ArrayList<>();
        summaries.add(new com.newsplatform.news.dto.CategoryMetricsResponse.SummaryMetric(
            "Total Articles", String.valueOf(totalArticles), "article"
        ));
        summaries.add(new com.newsplatform.news.dto.CategoryMetricsResponse.SummaryMetric(
            "Avg Sentiment", sentimentStatus, sentimentIcon
        ));
        summaries.add(new com.newsplatform.news.dto.CategoryMetricsResponse.SummaryMetric(
            "Active Readers", (totalArticles * 12) + "+ today", "group"
        ));

        List<Object[]> rawChartData = articleRepository.getArticleCountByDayForCategory(categoryId);
        List<com.newsplatform.news.dto.CategoryMetricsResponse.ChartDataPoint> chartData = new ArrayList<>();
        for (Object[] row : rawChartData) {
            String dateStr = String.valueOf(row[0]);
            Long count = ((Number) row[1]).longValue();
            chartData.add(new com.newsplatform.news.dto.CategoryMetricsResponse.ChartDataPoint(dateStr, count));
        }

        return new com.newsplatform.news.dto.CategoryMetricsResponse(summaries, chartData);
    }
}
