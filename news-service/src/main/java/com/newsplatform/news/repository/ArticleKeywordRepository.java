package com.newsplatform.news.repository;

import com.newsplatform.news.entity.ArticleKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArticleKeywordRepository extends JpaRepository<ArticleKeyword, Long> {
    List<ArticleKeyword> findByArticleId(Long articleId);
}
