package com.newsplatform.scheduler.controller;

import com.newsplatform.scheduler.service.SchedulerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scheduler")
@Tag(name = "Scheduler API", description = "Endpoints for managing scheduler tasks")
public class SchedulerController {

    private final SchedulerService schedulerService;
    private final com.newsplatform.scheduler.provider.NewsProviderFactory newsProviderFactory;

    public SchedulerController(SchedulerService schedulerService, com.newsplatform.scheduler.provider.NewsProviderFactory newsProviderFactory) {
        this.schedulerService = schedulerService;
        this.newsProviderFactory = newsProviderFactory;
    }

    @PostMapping("/trigger")
    @Operation(summary = "Manually trigger the news fetch job")
    public ResponseEntity<java.util.Map<String, Object>> triggerFetch() {
        boolean triggered = schedulerService.triggerFetch();
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        if (triggered) {
            response.put("triggered", true);
            response.put("jobId", java.util.UUID.randomUUID().toString());
            return ResponseEntity.status(org.springframework.http.HttpStatus.ACCEPTED).body(response);
        } else {
            response.put("triggered", false);
            response.put("message", "Job already running");
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT).body(response);
        }
    }

    @org.springframework.web.bind.annotation.GetMapping("/search")
    @Operation(summary = "Search news across all providers",
               description = "Aggregates results from all registered providers. " +
                             "Optional `domains` parameter restricts results to specific source domains " +
                             "on providers that support it (currently NewsAPI only — other providers " +
                             "return unfiltered results without error).")
    public ResponseEntity<java.util.List<com.newsplatform.scheduler.provider.dto.NormalizedArticle>> searchNews(
            @org.springframework.web.bind.annotation.RequestParam("q") String query,
            @org.springframework.web.bind.annotation.RequestParam(value = "domains", required = false)
            java.util.List<String> domains) {

        java.util.List<com.newsplatform.scheduler.provider.dto.NormalizedArticle> results = new java.util.ArrayList<>();
        // Note: Ideally, this should search across multiple providers and aggregate/deduplicate.
        // For simplicity and speed in the corroboration layer, we iterate until we get results or return all.
        java.util.List<com.newsplatform.scheduler.provider.NewsProvider> providers = newsProviderFactory.getAllProviders();
        for (com.newsplatform.scheduler.provider.NewsProvider provider : providers) {
            try {
                java.util.List<com.newsplatform.scheduler.provider.dto.NormalizedArticle> articles =
                        provider.searchNews(query, domains);
                if (articles != null) {
                    results.addAll(articles);
                }
            } catch (Exception e) {
                // Ignore provider failures and try the next one
            }
        }
        return ResponseEntity.ok(results);
    }
}
