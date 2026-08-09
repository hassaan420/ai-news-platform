package com.newsplatform.admin.repository;

import com.newsplatform.admin.entity.ErrorLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ErrorLogRepository extends JpaRepository<ErrorLog, Long> {
    Page<ErrorLog> findByServiceNameContainingIgnoreCaseOrSeverityContainingIgnoreCase(
        String serviceName, String severity, Pageable pageable
    );
}
