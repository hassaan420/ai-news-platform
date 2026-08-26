package com.newsplatform.news.service;

import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.UserReadingHistory;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.UserReadingHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import com.newsplatform.news.dto.NewsSummaryResponse;
import com.newsplatform.news.mapper.NewsMapper;

@Service
@Transactional(readOnly = true)
public class PersonalizedFeedService {

    private final UserReadingHistoryRepository historyRepository;
    private final TfIdfRecommendationService recommendationService;

    private final ArticleRepository articleRepository;
    private final NewsMapper newsMapper;

    public PersonalizedFeedService(UserReadingHistoryRepository historyRepository, 
                                   TfIdfRecommendationService recommendationService,
                                   ArticleRepository articleRepository,
                                   NewsMapper newsMapper) {
        this.historyRepository = historyRepository;
        this.recommendationService = recommendationService;
        this.articleRepository = articleRepository;
        this.newsMapper = newsMapper;
    }

    public List<NewsSummaryResponse> getPersonalizedFeed(String userId) {
        List<UserReadingHistory> history = historyRepository.findByUserIdOrderByReadAtDesc(userId);
        
        if (history.isEmpty()) {
            // Default to top trending articles if user has no reading history yet
            return articleRepository.findAllByOrderByTrendingScoreDesc(org.springframework.data.domain.PageRequest.of(0, 10)).getContent().stream().map(newsMapper::toNewsSummaryResponse).collect(Collectors.toList());
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
