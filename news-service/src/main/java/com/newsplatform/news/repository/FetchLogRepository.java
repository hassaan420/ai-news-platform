package com.newsplatform.news.repository;

import com.newsplatform.news.entity.FetchLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FetchLogRepository extends JpaRepository<FetchLog, Long> {
    Page<FetchLog> findByStatus(String status, Pageable pageable);
}
