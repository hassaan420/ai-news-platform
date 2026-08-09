package com.newsplatform.news.config;

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
 */
@Configuration
public class AsyncConfig {

    @Bean(name = "aiTaskExecutor")
    public Executor aiTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(8);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("AI-Thread-");
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
