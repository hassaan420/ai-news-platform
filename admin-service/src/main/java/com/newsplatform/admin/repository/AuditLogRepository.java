package com.newsplatform.admin.repository;

import com.newsplatform.admin.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByActorContainingIgnoreCaseOrActionTypeContainingIgnoreCaseOrEntityTypeContainingIgnoreCase(
        String actor, String actionType, String entityType, Pageable pageable
    );
}
