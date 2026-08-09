package com.newsplatform.news.repository;

import com.newsplatform.news.entity.AiProcessingQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository
public interface AiProcessingQueueRepository extends JpaRepository<AiProcessingQueue, Long> {
    List<AiProcessingQueue> findByStatus(String status);
    List<AiProcessingQueue> findByStatusAndRetryCountLessThan(String status, int maxRetries);

    /**
     * Finds queue items stuck in PROCESSING state (e.g., after container restart).
     * Items with {@code updated_at} older than {@code threshold} are considered stale.
     */
    @Query("SELECT q FROM AiProcessingQueue q WHERE q.status = 'PROCESSING' AND q.updatedAt < :threshold")
    List<AiProcessingQueue> findStuckProcessing(@Param("threshold") Instant threshold);
}
