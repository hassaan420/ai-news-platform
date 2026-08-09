package com.newsplatform.news.service;

import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.UserReadingHistory;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.UserReadingHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PersonalizedFeedService {

    private final UserReadingHistoryRepository historyRepository;
    private final TfIdfRecommendationService recommendationService;

    private final ArticleRepository articleRepository;

    public PersonalizedFeedService(UserReadingHistoryRepository historyRepository, 
                                   TfIdfRecommendationService recommendationService,
                                   ArticleRepository articleRepository) {
        this.historyRepository = historyRepository;
        this.recommendationService = recommendationService;
        this.articleRepository = articleRepository;
    }

    public List<Article> getPersonalizedFeed(String userId) {
        List<UserReadingHistory> history = historyRepository.findByUserIdOrderByReadAtDesc(userId);
        
        if (history.isEmpty()) {
            // Default to top trending articles if user has no reading history yet
            return articleRepository.findAllByOrderByTrendingScoreDesc(org.springframework.data.domain.PageRequest.of(0, 10)).getContent();
        }

        // Collect related articles based on the last 5 read articles
        return history.stream()
                .limit(5)
                .flatMap(h -> recommendationService.getRelatedArticles(h.getArticle().getId()).stream())
                .distinct()
                .limit(10)
                .collect(Collectors.toList());
    }
}
