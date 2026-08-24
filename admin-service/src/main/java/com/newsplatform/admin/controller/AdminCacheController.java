package com.newsplatform.admin.controller;

import com.newsplatform.admin.service.AuditLogService;
import com.newsplatform.admin.service.CacheEvictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/cache")
@Tag(name = "Admin Cache API")
public class AdminCacheController {

    private final CacheEvictionService cacheEvictionService;
    private final AuditLogService auditLogService;

    public AdminCacheController(CacheEvictionService cacheEvictionService, AuditLogService auditLogService) {
        this.cacheEvictionService = cacheEvictionService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/clear")
    @Operation(summary = "Clear system cache by scope")
    public ResponseEntity<Void> clearCache(@RequestParam(value = "scope", defaultValue = "ALL") String scope,
                                           @RequestParam(value = "slug", required = false) String slug) {
        switch (scope.toUpperCase()) {
            case "CATEGORY":
                if (slug != null && !slug.isEmpty()) {
                    cacheEvictionService.evictCategoryCache(slug);
                } else {
                    cacheEvictionService.evictAllCategoryCaches();
                }
                break;
            case "TRENDING":
                cacheEvictionService.evictTrendingCache();
                break;
            case "SEARCH":
                cacheEvictionService.evictSearchCache();
                break;
            case "HOMEPAGE":
                cacheEvictionService.evictHomepageCache();
                break;
            case "ALL":
            default:
                cacheEvictionService.evictAllCaches();
                break;
        }

        auditLogService.logAction("CLEAR_CACHE", "Cache", scope, "Cleared cache for scope: " + scope + (slug != null ? " (" + slug + ")" : ""));
        return ResponseEntity.noContent().build();
    }
}
