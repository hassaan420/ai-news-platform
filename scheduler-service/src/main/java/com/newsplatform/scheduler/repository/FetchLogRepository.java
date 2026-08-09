package com.newsplatform.scheduler.repository;

import com.newsplatform.scheduler.entity.FetchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FetchLogRepository extends JpaRepository<FetchLog, Long> {
}
