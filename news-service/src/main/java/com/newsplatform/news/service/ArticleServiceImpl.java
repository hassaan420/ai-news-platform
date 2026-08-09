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

    public ArticleServiceImpl(ArticleRepository articleRepository, 
                              SourceRepository sourceRepository, 
                              NewsMapper newsMapper, 
                              org.springframework.web.client.RestTemplate restTemplate,
                              com.newsplatform.news.repository.AiProcessingQueueRepository aiProcessingQueueRepository,
                              com.newsplatform.news.service.ArticleAiProcessingService aiProcessingService,
                              com.newsplatform.news.repository.ArticleStatsRepository articleStatsRepository) {
        this.articleRepository = articleRepository;
        this.sourceRepository = sourceRepository;
        this.newsMapper = newsMapper;
        this.restTemplate = restTemplate;
        this.aiProcessingQueueRepository = aiProcessingQueueRepository;
        this.aiProcessingService = aiProcessingService;
        this.articleStatsRepository = articleStatsRepository;
    }

    @Override
    public PagedResponse<NewsSummaryResponse> getArticles(Pageable pageable) {
        return createPagedResponse(articleRepository.findAll(pageable));
    }

    @Override
    public NewsResponse getArticleById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + id));
        return newsMapper.toNewsResponse(article);
    }

    @Override
    @Cacheable(value = "latest_articles", key = "#p0.pageNumber + '-' + #p0.pageSize")
    public PagedResponse<NewsSummaryResponse> getLatestArticles(Pageable pageable) {
        return createPagedResponse(articleRepository.findAllByOrderByPublishedAtDesc(pageable));
    }

    @Override
    @Cacheable(value = "trending_articles", key = "#p0.pageNumber + '-' + #p0.pageSize")
    public PagedResponse<NewsSummaryResponse> getTrendingArticles(Pageable pageable) {
        // Trending logic mocked to latest for now as views count is not in schema
        return createPagedResponse(articleRepository.findAllByOrderByPublishedAtDesc(pageable));
    }

    @Override
    public PagedResponse<NewsSummaryResponse> getArticlesByCategory(Long categoryId, Pageable pageable) {
        return createPagedResponse(articleRepository.findByCategoryIdOrderByPublishedAtDesc(categoryId, pageable));
    }

    @Override
    public PagedResponse<NewsSummaryResponse> getArticlesByCategorySlug(String slug, Pageable pageable) {
        try {
            CategoryDto category = restTemplate.getForObject("http://category-service:8083/api/categories/slug/" + slug, CategoryDto.class);
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
    public PagedResponse<NewsSummaryResponse> getArticlesBySource(Long sourceId, Pageable pageable) {
        return createPagedResponse(articleRepository.findBySourceIdOrderByPublishedAtDesc(sourceId, pageable));
    }

    @Override
    public PagedResponse<NewsSearchResponse> searchArticles(String keyword, Pageable pageable) {
        Page<Article> articlePage = articleRepository.searchArticles(keyword, pageable);
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
}
