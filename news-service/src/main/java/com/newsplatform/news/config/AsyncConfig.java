package com.newsplatform.news.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async thread-pool configuration for AI processing tasks.
 *
 * <p>The bean name {@code aiTaskExecutor} matches the value used in
 * {@code @Async("aiTaskExecutor")} on
 * {@link com.newsplatform.news.service.ArticleAiProcessingService}.
 * Without this bean, Spring cannot resolve the named executor and silently
 * drops all {@code @Async} invocations -- meaning AI processing never runs.
 *
 * <h3>Concurrency control</h3>
 * <p>The worker count is intentionally kept small (default: 2). This, combined
 * with the centralized {@link com.newsplatform.news.service.GeminiRateLimiter},
 * prevents the quota exhaustion problem caused by many threads simultaneously
 * firing Gemini requests.
 *
 * <p>Configuration:
 * <pre>
 *   ai.processing.worker-count=2   (or AI_PROCESSING_WORKER_COUNT env var)
 * </pre>
 *
 * <p>The pool is bounded — {@code corePoolSize == maxPoolSize == workerCount}.
 * Overflow tasks queue up in the bounded {@code queueCapacity} internal queue.
 * When the queue is full, {@link java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy}
 * runs the task on the calling (scheduler) thread rather than dropping it.
 */
@Configuration
public class AsyncConfig {

    private static final Logger log = LoggerFactory.getLogger(AsyncConfig.class);

    @Bean(name = "aiTaskExecutor")
    public Executor aiTaskExecutor(
            @Value("${ai.processing.worker-count:2}") int workerCount) {
        // Clamp to [1, 10] to prevent misconfiguration from creating unbounded threads
        int safeWorkerCount = Math.max(1, Math.min(workerCount, 10));
        if (safeWorkerCount != workerCount) {
            log.warn("[AsyncConfig] ai.processing.worker-count={} clamped to {}", workerCount, safeWorkerCount);
        }

        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // Bounded: coreSize == maxSize so the pool never expands beyond workerCount
        executor.setCorePoolSize(safeWorkerCount);
        executor.setMaxPoolSize(safeWorkerCount);
        // Bounded queue: enough headroom for bursts without allowing unlimited backlog
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("AI-Thread-");
        // CallerRunsPolicy: if queue is full, run on caller thread (scheduler) — no tasks dropped
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();

        log.info("[AsyncConfig] AI task executor initialized: workerCount={} queueCapacity=200", safeWorkerCount);
        return executor;
    }
}
