package com.newsplatform.news.repository;

import com.newsplatform.news.entity.SavedArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SavedArticleRepository extends JpaRepository<SavedArticle, Long> {
    Page<SavedArticle> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<SavedArticle> findByUserIdAndArticleId(Long userId, Long articleId);
    boolean existsByUserIdAndArticleId(Long userId, Long articleId);
}
