package com.newsplatform.news.repository;

import com.newsplatform.news.entity.ArticleStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleStatsRepository extends JpaRepository<ArticleStats, Long> {
    java.util.Optional<ArticleStats> findByArticleId(Long articleId);
}
