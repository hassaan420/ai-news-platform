package com.newsplatform.news.controller;

import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.ArticleStats;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.ArticleStatsRepository;
import com.newsplatform.news.service.PersonalizedFeedService;
import com.newsplatform.news.service.TfIdfRecommendationService;
import org.springframework.data.domain.PageRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/news/ai")
public class AiNewsController {

    private final TfIdfRecommendationService recommendationService;
    private final PersonalizedFeedService personalizedFeedService;
    private final ArticleStatsRepository statsRepository;
    private final ArticleRepository articleRepository;
    private final com.newsplatform.news.mapper.NewsMapper newsMapper;

    public AiNewsController(TfIdfRecommendationService recommendationService,
                            PersonalizedFeedService personalizedFeedService,
                            ArticleStatsRepository statsRepository,
                            ArticleRepository articleRepository,
                            com.newsplatform.news.mapper.NewsMapper newsMapper) {
        this.recommendationService = recommendationService;
        this.personalizedFeedService = personalizedFeedService;
        this.statsRepository = statsRepository;
        this.articleRepository = articleRepository;
        this.newsMapper = newsMapper;
    }

    // Part 5: Related Articles
    @GetMapping("/{articleId}/related")
    public ResponseEntity<List<com.newsplatform.news.dto.NewsSummaryResponse>> getRelatedArticles(@PathVariable("articleId") Long articleId) {
        return ResponseEntity.ok(recommendationService.getRelatedArticles(articleId).stream().map(newsMapper::toNewsSummaryResponse).collect(Collectors.toList()));
    }

    @GetMapping("/personalized")
    @Operation(summary = "Get personalized AI-curated news feed")
    public ResponseEntity<List<com.newsplatform.news.dto.NewsSummaryResponse>> getPersonalizedFeed() {
        Long userId = getCurrentUserIdSafe();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(personalizedFeedService.getPersonalizedFeed(String.valueOf(userId)).stream().map(newsMapper::toNewsSummaryResponse).collect(Collectors.toList()));
    }

    public Long getCurrentUserIdSafe() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser") || auth.getName().equals("internal-service")) {
            return null;
        }
        try {
            return Long.parseLong(auth.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // Part 7: Trending
    @GetMapping("/trending")
    public ResponseEntity<List<com.newsplatform.news.dto.NewsSummaryResponse>> getTrending() {
        List<Article> trending = articleRepository.findAllByOrderByTrendingScoreDesc(PageRequest.of(0, 10)).getContent();
        return ResponseEntity.ok(trending.stream().map(newsMapper::toNewsSummaryResponse).collect(Collectors.toList()));
    }
}
