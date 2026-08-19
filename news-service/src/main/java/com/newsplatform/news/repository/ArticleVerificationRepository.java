package com.newsplatform.news.repository;

import com.newsplatform.news.entity.ArticleVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArticleVerificationRepository extends JpaRepository<ArticleVerification, Long> {
    Optional<ArticleVerification> findByArticleId(Long articleId);
}
