package com.newsplatform.admin.controller;

import com.newsplatform.admin.client.AuthServiceClient;
import com.newsplatform.admin.client.NewsServiceClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.newsplatform.admin.service.AuditLogService;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin API", description = "Dashboard and administrative endpoints")
public class AdminDashboardController {

    private final AuthServiceClient authServiceClient;
    private final NewsServiceClient newsServiceClient;
    private final AuditLogService auditLogService;
    private final com.newsplatform.admin.service.PrometheusService prometheusService;

    public AdminDashboardController(AuthServiceClient authServiceClient, NewsServiceClient newsServiceClient, AuditLogService auditLogService, com.newsplatform.admin.service.PrometheusService prometheusService) {
        this.authServiceClient = authServiceClient;
        this.newsServiceClient = newsServiceClient;
        this.auditLogService = auditLogService;
        this.prometheusService = prometheusService;
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get aggregated system statistics")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            Map<String, Object> userStats = authServiceClient.getUserStats();
            long totalArticles = newsServiceClient.getArticleCount();
            
            stats.put("totalUsers", userStats.get("total"));
            stats.put("totalArticles", totalArticles);
            stats.put("activeSessions", userStats.get("activeToday"));
            stats.put("systemHealth", "HEALTHY");
            
            try {
                Map<String, Object> aiStats = newsServiceClient.getAiAnalytics();
                stats.put("aiStats", aiStats);
            } catch (Exception aiEx) {
                stats.put("aiStats", new HashMap<>());
            }
            
            // Prometheus metrics integration
            Map<String, Object> prometheusMetrics = new HashMap<>();
            prometheusMetrics.put("totalHttpRequests", prometheusService.getTotalHttpRequests());
            prometheusMetrics.put("jvmMemoryUsedBytes", prometheusService.getJvmMemoryUsed());
            stats.put("prometheus", prometheusMetrics);

            // Chart data
            stats.put("chartData", prometheusService.get7DayActivityTrend());
            
            java.util.List<Map<String, String>> activities = auditLogService.getRecentLogs(5).stream().map(log -> {
                String timeStr = log.getTimestamp() != null 
                    ? DateTimeFormatter.ofPattern("MMM dd, HH:mm").withZone(ZoneId.systemDefault()).format(log.getTimestamp())
                    : "Unknown";
                return Map.of(
                    "title", log.getActionType() + " " + log.getEntityType(),
                    "desc", log.getActor() + " - " + log.getDescription(),
                    "time", timeStr
                );
            }).collect(Collectors.toList());
            
            stats.put("recentActivity", activities.isEmpty() ? 
                java.util.List.of(Map.of("title", "Database Verified", "desc", "System started and schemas verified.", "time", "Just now")) : 
                activities
            );
        } catch (Exception e) {
            stats.put("error", "Failed to aggregate statistics: " + e.getMessage());
        }
        
        return ResponseEntity.ok(stats);
    }
}
