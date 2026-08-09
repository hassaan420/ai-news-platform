package com.newsplatform.news.repository;

import com.newsplatform.news.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    @EntityGraph(attributePaths = {"source"})
    Optional<Article> findByHash(String hash);

    @EntityGraph(attributePaths = {"source"})
    Page<Article> findByCategoryIdOrderByPublishedAtDesc(Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"source"})
    Page<Article> findBySourceIdOrderByPublishedAtDesc(Long sourceId, Pageable pageable);

    @EntityGraph(attributePaths = {"source"})
    Page<Article> findAllByOrderByPublishedAtDesc(Pageable pageable);

    @Query(value = "SELECT a.* FROM articles a " +
           "LEFT JOIN article_keywords ak ON a.id = ak.article_id AND ak.keyword LIKE CONCAT('%', :keyword, '%') " +
           "LEFT JOIN article_tags at ON a.id = at.article_id AND at.tag LIKE CONCAT('%', :keyword, '%') " +
           "WHERE MATCH(a.title, a.description, a.content) AGAINST(:keyword IN BOOLEAN MODE) " +
           "OR a.summary LIKE CONCAT('%', :keyword, '%') OR ak.id IS NOT NULL OR at.id IS NOT NULL " +
           "GROUP BY a.id " +
           "ORDER BY (" +
           "  MATCH(a.title, a.description, a.content) AGAINST(:keyword IN BOOLEAN MODE) * 2.0 " +
           "  + CASE WHEN a.summary LIKE CONCAT('%', :keyword, '%') THEN 5.0 ELSE 0 END " +
           "  + CASE WHEN COUNT(ak.id) > 0 THEN 3.0 ELSE 0 END " +
           "  + CASE WHEN COUNT(at.id) > 0 THEN 3.0 ELSE 0 END " +
           "  + COALESCE(a.trending_score, 0) * 0.1 " +
           "  + COALESCE(a.recommendation_score, 0) * 0.1 " +
           "  + COALESCE(a.ai_confidence, 0) * 10.0 " +
           ") DESC", 
           countQuery = "SELECT COUNT(DISTINCT a.id) FROM articles a " +
           "LEFT JOIN article_keywords ak ON a.id = ak.article_id AND ak.keyword LIKE CONCAT('%', :keyword, '%') " +
           "LEFT JOIN article_tags at ON a.id = at.article_id AND at.tag LIKE CONCAT('%', :keyword, '%') " +
           "WHERE MATCH(a.title, a.description, a.content) AGAINST(:keyword IN BOOLEAN MODE) " +
           "OR a.summary LIKE CONCAT('%', :keyword, '%') OR ak.id IS NOT NULL OR at.id IS NOT NULL", 
           nativeQuery = true)
    Page<Article> searchArticles(@Param("keyword") String keyword, Pageable pageable);

    @EntityGraph(attributePaths = {"source"})
    Optional<Article> findById(Long id);

    @EntityGraph(attributePaths = {"source"})
    Page<Article> findAll(Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "DELETE a1 FROM articles a1 INNER JOIN articles a2 WHERE a1.id > a2.id AND a1.url = a2.url", nativeQuery = true)
    int deleteDuplicateArticlesByUrl();

    /**
     * Returns up to {@code limit} PENDING articles that have no row in
     * {@code ai_processing_queue}. Used to repair orphaned articles that were
     * ingested before the queue was wired up.
     */
    @Query(value = """
            SELECT a.* FROM articles a
            WHERE a.processing_status = 'PENDING'
              AND NOT EXISTS (
                SELECT 1 FROM ai_processing_queue q WHERE q.article_id = a.id
              )
            LIMIT :limit""",
            nativeQuery = true)
    List<Article> findPendingWithoutQueueEntry(@Param("limit") int limit);

    @EntityGraph(attributePaths = {"source"})
    Page<Article> findAllByOrderByTrendingScoreDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"source"})
    List<Article> findTop5ByCategoryIdAndIdNot(Long categoryId, Long id);
}
