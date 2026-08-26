package com.newsplatform.news.controller;

import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.ArticleStats;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.ArticleStatsRepository;
import com.newsplatform.news.service.PersonalizedFeedService;
import com.newsplatform.news.service.TfIdfRecommendationService;
import com.newsplatform.news.service.GeminiSearchService;
import org.springframework.data.domain.PageRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/news/ai")
@Transactional(readOnly = true)
public class AiNewsController {

    private final TfIdfRecommendationService recommendationService;
    private final PersonalizedFeedService personalizedFeedService;
    private final ArticleStatsRepository statsRepository;
    private final ArticleRepository articleRepository;
    private final com.newsplatform.news.mapper.NewsMapper newsMapper;
    private final GeminiSearchService geminiSearchService;
    private final com.newsplatform.news.service.ArticleService articleService;

    public AiNewsController(TfIdfRecommendationService recommendationService,
                            PersonalizedFeedService personalizedFeedService,
                            ArticleStatsRepository statsRepository,
                            ArticleRepository articleRepository,
                            com.newsplatform.news.mapper.NewsMapper newsMapper,
                            GeminiSearchService geminiSearchService,
                            com.newsplatform.news.service.ArticleService articleService) {
        this.recommendationService = recommendationService;
        this.personalizedFeedService = personalizedFeedService;
        this.statsRepository = statsRepository;
        this.articleRepository = articleRepository;
        this.newsMapper = newsMapper;
        this.geminiSearchService = geminiSearchService;
        this.articleService = articleService;
    }

    // Part 5: Related Articles
    @GetMapping("/{articleId}/related")
    public ResponseEntity<List<com.newsplatform.news.dto.NewsSummaryResponse>> getRelatedArticles(@PathVariable("articleId") Long articleId) {
        try {
            List<com.newsplatform.news.dto.NewsSummaryResponse> related = recommendationService.getRelatedArticles(articleId);
            if (related.isEmpty()) {
                Article article = articleRepository.findById(articleId).orElse(null);
                if (article != null) {
                    List<Article> webRelated = geminiSearchService.searchWebForRelatedArticles(article.getTitle());
                    related = webRelated.stream().map(newsMapper::toNewsSummaryResponse).collect(Collectors.toList());
                }
            }
            return ResponseEntity.ok(related);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/personalized")
    @Operation(summary = "Get personalized AI-curated news feed")
    public ResponseEntity<List<com.newsplatform.news.dto.NewsSummaryResponse>> getPersonalizedFeed() {
        Long userId = getCurrentUserIdSafe();
        if (userId == null) {
            // Fall back to trending news if not logged in
            return ResponseEntity.ok(articleService.getTrendingArticles(PageRequest.of(0, 10)).content());
        }
        return ResponseEntity.ok(personalizedFeedService.getPersonalizedFeed(String.valueOf(userId)));
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
        return ResponseEntity.ok(articleService.getTrendingArticles(PageRequest.of(0, 10)).content());
    }
}
