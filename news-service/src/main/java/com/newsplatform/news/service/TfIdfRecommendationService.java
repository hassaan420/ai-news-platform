package com.newsplatform.news.service;

import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.ArticleKeyword;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.ArticleKeywordRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import com.newsplatform.news.dto.NewsSummaryResponse;
import com.newsplatform.news.mapper.NewsMapper;

@Service
@Transactional(readOnly = true)
public class TfIdfRecommendationService {

    private final ArticleRepository articleRepository;
    private final ArticleKeywordRepository keywordRepository;
    private final NewsMapper newsMapper;

    public TfIdfRecommendationService(ArticleRepository articleRepository, ArticleKeywordRepository keywordRepository, NewsMapper newsMapper) {
        this.articleRepository = articleRepository;
        this.keywordRepository = keywordRepository;
        this.newsMapper = newsMapper;
    }

    @Cacheable(value = "related_articles", key = "#p0")
    public List<NewsSummaryResponse> getRelatedArticles(Long articleId) {
        if (articleId == null) return Collections.emptyList();
        Article target = articleRepository.findById(articleId).orElse(null);
        if (target == null) return Collections.emptyList();

        List<ArticleKeyword> targetKeywords = keywordRepository.findByArticleId(articleId);
        if (targetKeywords.isEmpty()) {
            // Fallback to basic category match via repository query (no full table scan)
            if (target.getCategoryId() == null) {
                return articleRepository.findAllByOrderByTrendingScoreDesc(org.springframework.data.domain.PageRequest.of(0, 5)).getContent()
                        .stream().filter(a -> !a.getId().equals(articleId)).map(newsMapper::toNewsSummaryResponse).collect(Collectors.toList());
            }
            return articleRepository.findTop5ByCategoryIdAndIdNot(target.getCategoryId(), articleId).stream().map(newsMapper::toNewsSummaryResponse).collect(Collectors.toList());
        }

        Set<String> targetWords = targetKeywords.stream()
                .map(ArticleKeyword::getKeyword)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Fetch candidate articles (same category or recent) instead of scanning entire DB
        List<Article> candidates;
        if (target.getCategoryId() != null) {
            candidates = articleRepository.findByCategoryIdOrderByPublishedAtDesc(target.getCategoryId(), org.springframework.data.domain.PageRequest.of(0, 50))
                    .getContent().stream().filter(a -> !a.getId().equals(articleId)).collect(Collectors.toList());
        } else {
            candidates = articleRepository.findAllByOrderByPublishedAtDesc(org.springframework.data.domain.PageRequest.of(0, 50))
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
            .map(newsMapper::toNewsSummaryResponse)
            .collect(Collectors.toList());
    }
}
