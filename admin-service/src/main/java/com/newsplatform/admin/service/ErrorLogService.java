package com.newsplatform.admin.service;

import com.newsplatform.admin.entity.ErrorLog;
import com.newsplatform.admin.repository.ErrorLogRepository;
import org.springframework.stereotype.Service;

@Service
public class ErrorLogService {
    
    private final ErrorLogRepository errorLogRepository;

    public ErrorLogService(ErrorLogRepository errorLogRepository) {
        this.errorLogRepository = errorLogRepository;
    }

    public void logError(String serviceName, String severity, String message, String stackTrace) {
        ErrorLog errorLog = new ErrorLog();
        errorLog.setServiceName(serviceName);
        errorLog.setSeverity(severity);
        errorLog.setMessage(message);
        errorLog.setStackTrace(stackTrace);
        errorLogRepository.save(errorLog);
    }
}
