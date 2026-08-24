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
    @EntityGraph(attributePaths = {"source", "stats"})
    Optional<Article> findByHash(String hash);

    @EntityGraph(attributePaths = {"source", "stats"})
    Page<Article> findByCategoryIdOrderByPublishedAtDesc(Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"source", "stats"})
    Page<Article> findByCategoryIdOrderByTrendingScoreDesc(Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"source", "stats"})
    Page<Article> findBySourceIdOrderByPublishedAtDesc(Long sourceId, Pageable pageable);

    @EntityGraph(attributePaths = {"source", "stats"})
    Page<Article> findAllByOrderByPublishedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"source", "stats"})
    Page<Article> findAllByPublishedAtBetweenOrderByPublishedAtDesc(java.time.Instant start, java.time.Instant end, Pageable pageable);

    @EntityGraph(attributePaths = {"source", "stats"})
    Page<Article> findAllByPublishedAtAfterOrderByPublishedAtDesc(java.time.Instant start, Pageable pageable);

    @EntityGraph(attributePaths = {"source", "stats"})
    Page<Article> findAllByPublishedAtBeforeOrderByPublishedAtDesc(java.time.Instant end, Pageable pageable);

    @Query(value = "SELECT a.* FROM articles a " +
           "LEFT JOIN article_keywords ak ON a.id = ak.article_id AND ak.keyword LIKE CONCAT('%', :keyword, '%') " +
           "LEFT JOIN article_tags at ON a.id = at.article_id AND at.tag LIKE CONCAT('%', :keyword, '%') " +
           "WHERE (MATCH(a.title, a.description, a.content) AGAINST(:keyword IN BOOLEAN MODE) " +
           "  OR a.summary LIKE CONCAT('%', :keyword, '%') OR ak.id IS NOT NULL OR at.id IS NOT NULL) " +
           "AND (:categoryId IS NULL OR a.category_id = :categoryId) " +
           "AND (:sourceId IS NULL OR a.source_id = :sourceId) " +
           "AND (:author IS NULL OR a.author LIKE CONCAT('%', :author, '%')) " +
           "AND (:dateFrom IS NULL OR a.published_at >= :dateFrom) " +
           "AND (:dateTo IS NULL OR a.published_at <= :dateTo) " +
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
           "WHERE (MATCH(a.title, a.description, a.content) AGAINST(:keyword IN BOOLEAN MODE) " +
           "  OR a.summary LIKE CONCAT('%', :keyword, '%') OR ak.id IS NOT NULL OR at.id IS NOT NULL) " +
           "AND (:categoryId IS NULL OR a.category_id = :categoryId) " +
           "AND (:sourceId IS NULL OR a.source_id = :sourceId) " +
           "AND (:author IS NULL OR a.author LIKE CONCAT('%', :author, '%')) " +
           "AND (:dateFrom IS NULL OR a.published_at >= :dateFrom) " +
           "AND (:dateTo IS NULL OR a.published_at <= :dateTo)", 
           nativeQuery = true)
    Page<Article> searchArticles(@Param("keyword") String keyword, 
                                 @Param("categoryId") Long categoryId, 
                                 @Param("sourceId") Long sourceId, 
                                 @Param("author") String author, 
                                 @Param("dateFrom") java.time.Instant dateFrom, 
                                 @Param("dateTo") java.time.Instant dateTo, 
                                 Pageable pageable);

    @EntityGraph(attributePaths = {"source", "stats"})
    Optional<Article> findById(Long id);

    @EntityGraph(attributePaths = {"source", "stats"})
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

    @EntityGraph(attributePaths = {"source", "stats"})
    Page<Article> findAllByOrderByTrendingScoreDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"source", "stats"})
    List<Article> findTop5ByCategoryIdAndIdNot(Long categoryId, Long id);

    @Query("SELECT COUNT(a) FROM Article a WHERE a.categoryId = :categoryId")
    long countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT AVG(a.sentimentScore) FROM Article a WHERE a.categoryId = :categoryId AND a.sentimentScore IS NOT NULL")
    Double getAverageSentimentScoreByCategoryId(@Param("categoryId") Long categoryId);

    @Query(value = "SELECT DATE(a.published_at) as name, COUNT(a.id) as value FROM articles a WHERE a.category_id = :categoryId AND a.published_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(a.published_at) ORDER BY name ASC", nativeQuery = true)
    List<Object[]> getArticleCountByDayForCategory(@Param("categoryId") Long categoryId);
}
