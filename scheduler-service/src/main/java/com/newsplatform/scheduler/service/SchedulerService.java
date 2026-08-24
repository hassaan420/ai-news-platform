package com.newsplatform.scheduler.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newsplatform.scheduler.client.NewsServiceClient;
import com.newsplatform.scheduler.entity.FetchLog;
import com.newsplatform.scheduler.provider.NewsProvider;
import com.newsplatform.scheduler.provider.dto.NormalizedArticle;
import com.newsplatform.scheduler.provider.exception.ProviderUnavailableException;
import com.newsplatform.scheduler.repository.FetchLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@ConditionalOnProperty(name = "SCHEDULER_ENABLED", matchIfMissing = true)
public class SchedulerService {

    private static final Logger log = LoggerFactory.getLogger(SchedulerService.class);
    private static final String LOCK_KEY = "scheduler:job:lock";

    private final IngestionOrchestrator orchestrator;
    private final StringRedisTemplate redisTemplate;

    @Value("${news.ingestion.timezone:Asia/Karachi}")
    private String ingestionTimezone;

    public SchedulerService(IngestionOrchestrator orchestrator, StringRedisTemplate redisTemplate) {
        this.orchestrator = orchestrator;
        this.redisTemplate = redisTemplate;
    }

    @Scheduled(fixedRateString = "${scheduler.fetch-rate:900000}")
    public void fetchNewsTask() {
        log.info("Starting scheduled news fetch task (timezone={})", ingestionTimezone);
        triggerFetch();
    }

    public boolean triggerFetch() {
        // Try to acquire distributed lock (10 minutes TTL)
        Boolean lockAcquired = redisTemplate.opsForValue().setIfAbsent(LOCK_KEY, "LOCKED", Duration.ofMinutes(10));
        
        if (Boolean.TRUE.equals(lockAcquired)) {
            try {
                log.info("Lock acquired. Running ingestion pipeline...");
                orchestrator.runIngestionPipeline();
                return true;
            } finally {
                // Release lock
                redisTemplate.delete(LOCK_KEY);
                log.info("Lock released.");
            }
        } else {
            log.info("Another scheduler instance is already running the ingestion pipeline. Skipping.");
            return false;
        }
    }
}
