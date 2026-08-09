package com.newsplatform.news.service;

import com.newsplatform.news.entity.ArticleStats;
import com.newsplatform.news.repository.ArticleStatsRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class TrendingEngineService {

    private final ArticleStatsRepository statsRepository;
    private final com.newsplatform.news.repository.ArticleRepository articleRepository;

    public TrendingEngineService(ArticleStatsRepository statsRepository,
                                 com.newsplatform.news.repository.ArticleRepository articleRepository) {
        this.statsRepository = statsRepository;
        this.articleRepository = articleRepository;
    }

    @Scheduled(fixedRate = 300000, initialDelay = 10000) // Run every 5 minutes
    @Transactional
    public void calculateTrendingScores() {
        // Backfill missing ArticleStats records for existing articles
        List<com.newsplatform.news.entity.Article> articles = articleRepository.findAll();
        for (com.newsplatform.news.entity.Article article : articles) {
            if (statsRepository.findByArticleId(article.getId()).isEmpty()) {
                ArticleStats s = new ArticleStats();
                s.setArticle(article);
                s.setViews(0);
                s.setBookmarks(0);
                s.setTrendingScore(article.getTrendingScore() != null ? article.getTrendingScore() : 50.0);
                statsRepository.save(s);
            }
        }

        List<ArticleStats> statsList = statsRepository.findAll();
        Instant now = Instant.now();

        for (ArticleStats stats : statsList) {
            if (stats.getArticle() == null || stats.getArticle().getPublishedAt() == null) continue;
            long hoursSincePublished = ChronoUnit.HOURS.between(stats.getArticle().getPublishedAt(), now);
            long hoursDecay = Math.max(1, hoursSincePublished);

            // Trending Score Algorithm
            // (Views * 1.5 + Bookmarks * 3.0) / Time Decay
            double score = ((stats.getViews() * 1.5) + (stats.getBookmarks() * 3.0)) / Math.pow(hoursDecay, 1.2);
            
            stats.setTrendingScore(score);
            stats.setLastCalculatedAt(now);
            
            // Also update Article entity trending_score for unified querying
            stats.getArticle().setTrendingScore(score);
        }
        
        statsRepository.saveAll(statsList);
    }
}
