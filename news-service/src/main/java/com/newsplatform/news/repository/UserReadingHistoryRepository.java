package com.newsplatform.news.repository;

import com.newsplatform.news.entity.UserReadingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserReadingHistoryRepository extends JpaRepository<UserReadingHistory, Long> {
    List<UserReadingHistory> findByUserIdOrderByReadAtDesc(String userId);

    long countByUserId(String userId);
}
