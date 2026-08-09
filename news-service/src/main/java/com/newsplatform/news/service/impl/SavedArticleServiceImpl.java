package com.newsplatform.news.service.impl;

import com.newsplatform.common.dto.PagedResponse;
import com.newsplatform.news.dto.NewsSummaryResponse;
import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.SavedArticle;
import com.newsplatform.common.exception.ResourceNotFoundException;
import com.newsplatform.news.mapper.NewsMapper;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.SavedArticleRepository;
import com.newsplatform.news.service.SavedArticleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SavedArticleServiceImpl implements SavedArticleService {

    private final SavedArticleRepository savedArticleRepository;
    private final ArticleRepository articleRepository;
    private final NewsMapper newsMapper;

    public SavedArticleServiceImpl(SavedArticleRepository savedArticleRepository, ArticleRepository articleRepository, NewsMapper newsMapper) {
        this.savedArticleRepository = savedArticleRepository;
        this.articleRepository = articleRepository;
        this.newsMapper = newsMapper;
    }

    @Override
    @Transactional
    public void saveArticle(Long userId, Long articleId) {
        if (!savedArticleRepository.existsByUserIdAndArticleId(userId, articleId)) {
            Article article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Article not found with id: " + articleId));
            SavedArticle savedArticle = new SavedArticle(userId, article);
            savedArticleRepository.save(savedArticle);
        }
    }

    @Override
    @Transactional
    public void unsaveArticle(Long userId, Long articleId) {
        savedArticleRepository.findByUserIdAndArticleId(userId, articleId)
                .ifPresent(savedArticleRepository::delete);
    }

    @Override
    public PagedResponse<NewsSummaryResponse> getSavedArticles(Long userId, Pageable pageable) {
        Page<SavedArticle> savedPage = savedArticleRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        List<NewsSummaryResponse> content = savedPage.getContent().stream()
                .map(saved -> newsMapper.toNewsSummaryResponse(saved.getArticle()))
                .collect(Collectors.toList());
        
        return new PagedResponse<>(
                content,
                savedPage.getNumber(),
                savedPage.getSize(),
                savedPage.getTotalElements(),
                savedPage.getTotalPages(),
                savedPage.isLast()
        );
    }
}
