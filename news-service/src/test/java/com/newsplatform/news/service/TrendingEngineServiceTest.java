package com.newsplatform.news.service;

import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.ArticleStats;
import com.newsplatform.news.repository.ArticleStatsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TrendingEngineServiceTest {

    @Mock
    private ArticleStatsRepository statsRepository;

    @Mock
    private com.newsplatform.news.repository.ArticleRepository articleRepository;

    @InjectMocks
    private TrendingEngineService trendingService;

    @Test
    public void testCalculateTrendingScores() {
        Article article = new Article();
        article.setId(1L);
        article.setPublishedAt(Instant.now().minus(2, ChronoUnit.HOURS));

        ArticleStats stats = new ArticleStats();
        stats.setArticle(article);
        stats.setViews(100);
        stats.setBookmarks(10);
        
        when(articleRepository.findAll()).thenReturn(List.of(article));
        when(statsRepository.findByArticleId(1L)).thenReturn(Optional.of(stats));
        when(statsRepository.findAll()).thenReturn(List.of(stats));

        trendingService.calculateTrendingScores();

        // Formula: (100 * 1.5 + 10 * 3.0) / Math.pow(2, 1.2) = 180 / 2.297 = ~78.3
        assertTrue(stats.getTrendingScore() > 70.0 && stats.getTrendingScore() < 80.0);
        verify(statsRepository, times(1)).saveAll(anyList());
    }
}
