package com.newsplatform.news.service;

import com.newsplatform.common.dto.PagedResponse;
import com.newsplatform.news.dto.NewsSummaryResponse;
import org.springframework.data.domain.Pageable;

public interface SavedArticleService {
    void saveArticle(Long userId, Long articleId);
    void unsaveArticle(Long userId, Long articleId);
    PagedResponse<NewsSummaryResponse> getSavedArticles(Long userId, Pageable pageable);
}
