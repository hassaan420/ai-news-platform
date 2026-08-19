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

    public SchedulerController(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @PostMapping("/trigger")
    @Operation(summary = "Manually trigger the news fetch job")
    public ResponseEntity<String> triggerFetch() {
        // Run asynchronously to avoid blocking the HTTP request
        new Thread(schedulerService::triggerFetch).start();
        return ResponseEntity.ok("Fetch job triggered successfully");
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
        java.util.List<com.newsplatform.scheduler.provider.NewsProvider> providers = schedulerService.getProviders();
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
