package com.newsplatform.news.repository;

import com.newsplatform.news.entity.ArticleTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArticleTagRepository extends JpaRepository<ArticleTag, Long> {
    List<ArticleTag> findByArticleId(Long articleId);
}
