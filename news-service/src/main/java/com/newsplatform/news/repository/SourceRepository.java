package com.newsplatform.news.repository;

import com.newsplatform.news.entity.Source;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SourceRepository extends JpaRepository<Source, Long> {
    Optional<Source> findByProvider(String provider);
    Optional<Source> findByNameIgnoreCase(String name);
    org.springframework.data.domain.Page<Source> findByStatus(String status, org.springframework.data.domain.Pageable pageable);
}
