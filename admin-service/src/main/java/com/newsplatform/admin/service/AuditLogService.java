package com.newsplatform.admin.service;

import com.newsplatform.admin.entity.AuditLog;
import com.newsplatform.admin.repository.AuditLogRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(String actionType, String entityType, String entityId, String description) {
        String actor = getCurrentActor();
        AuditLog log = new AuditLog(actor, actionType, entityType, entityId, description);
        auditLogRepository.save(log);
    }

    private String getCurrentActor() {
        if (SecurityContextHolder.getContext().getAuthentication() != null &&
            SecurityContextHolder.getContext().getAuthentication().getName() != null) {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        }
        return "system";
    }
}
