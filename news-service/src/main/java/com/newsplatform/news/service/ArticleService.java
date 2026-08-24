package com.newsplatform.news.service;

import com.newsplatform.news.dto.NewsRequest;
import com.newsplatform.news.dto.NewsResponse;
import com.newsplatform.news.dto.NewsSearchResponse;
import com.newsplatform.news.dto.NewsSummaryResponse;
import com.newsplatform.common.dto.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ArticleService {
    PagedResponse<NewsSummaryResponse> getArticles(Pageable pageable);
    
    NewsResponse getArticleById(Long id);
    
    PagedResponse<NewsSummaryResponse> getLatestArticles(Pageable pageable, String dateFilter, String from, String to);
    
    PagedResponse<NewsSummaryResponse> getTrendingArticles(Pageable pageable);
    
    PagedResponse<NewsSummaryResponse> getArticlesByCategory(Long categoryId, Pageable pageable);
    
    PagedResponse<NewsSummaryResponse> getArticlesByCategorySlug(String slug, Pageable pageable);
    
    PagedResponse<NewsSummaryResponse> getTrendingArticlesByCategorySlug(String slug, Pageable pageable);
    
    PagedResponse<NewsSummaryResponse> getArticlesBySource(Long sourceId, Pageable pageable);
    
    PagedResponse<NewsSearchResponse> searchArticles(String keyword, String categorySlug, String sourceName, String author, String dateFrom, String dateTo, Pageable pageable);
    
    NewsResponse createInternalNews(NewsRequest request);
    
    List<NewsResponse> createInternalNewsBulk(List<NewsRequest> requests);
    
    int deduplicateNews();
    
    void deleteInternalNews(Long id);
    
    com.newsplatform.news.dto.ArticleVerificationDto getVerification(Long articleId);
    
    com.newsplatform.news.dto.CategoryMetricsResponse getCategoryMetrics(String slug);
}
