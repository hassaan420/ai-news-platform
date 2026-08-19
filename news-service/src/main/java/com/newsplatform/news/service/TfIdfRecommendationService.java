package com.newsplatform.news.service;

import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.ArticleKeyword;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.ArticleKeywordRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TfIdfRecommendationService {

    private final ArticleRepository articleRepository;
    private final ArticleKeywordRepository keywordRepository;

    public TfIdfRecommendationService(ArticleRepository articleRepository, ArticleKeywordRepository keywordRepository) {
        this.articleRepository = articleRepository;
        this.keywordRepository = keywordRepository;
    }

    @Cacheable(value = "related_articles", key = "#p0")
    public List<Article> getRelatedArticles(Long articleId) {
        if (articleId == null) return Collections.emptyList();
        Article target = articleRepository.findById(articleId).orElse(null);
        if (target == null) return Collections.emptyList();

        List<ArticleKeyword> targetKeywords = keywordRepository.findByArticleId(articleId);
        if (targetKeywords.isEmpty()) {
            // Fallback to basic category match via repository query (no full table scan)
            if (target.getCategoryId() == null) {
                return articleRepository.findAllByOrderByTrendingScoreDesc(org.springframework.data.domain.PageRequest.of(0, 5)).getContent()
                        .stream().filter(a -> !a.getId().equals(articleId)).collect(Collectors.toList());
            }
            return articleRepository.findTop5ByCategoryIdAndIdNot(target.getCategoryId(), articleId);
        }

        Set<String> targetWords = targetKeywords.stream()
                .map(ArticleKeyword::getKeyword)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Fetch candidate articles (same category or recent) instead of scanning entire DB
        List<Article> candidates;
        if (target.getCategoryId() != null) {
            candidates = articleRepository.findTop5ByCategoryIdAndIdNot(target.getCategoryId(), articleId);
        } else {
            candidates = articleRepository.findAllByOrderByTrendingScoreDesc(org.springframework.data.domain.PageRequest.of(0, 10))
                    .getContent().stream().filter(a -> !a.getId().equals(articleId)).collect(Collectors.toList());
        }

        if (candidates.isEmpty()) {
            return Collections.emptyList();
        }

        // Rank candidates using Jaccard Similarity on keywords
        return candidates.stream()
            .sorted(Comparator.comparingDouble((Article a) -> {
                List<ArticleKeyword> ak = keywordRepository.findByArticleId(a.getId());
                long intersection = ak.stream().filter(k -> targetWords.contains(k.getKeyword())).count();
                double union = targetWords.size() + ak.size() - intersection;
                return union == 0 ? 0.0 : (double) intersection / union;
            }).reversed())
            .limit(5)
            .collect(Collectors.toList());
    }
}
