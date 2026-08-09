package com.newsplatform.admin.controller;

import com.newsplatform.admin.client.SchedulerServiceClient;
import com.newsplatform.admin.entity.AuditLog;
import com.newsplatform.admin.entity.ErrorLog;
import com.newsplatform.admin.entity.Setting;
import com.newsplatform.admin.repository.AuditLogRepository;
import com.newsplatform.admin.repository.ErrorLogRepository;
import com.newsplatform.admin.repository.SettingRepository;
import com.newsplatform.admin.service.AuditLogService;
import com.newsplatform.admin.service.ErrorLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
@Tag(name = "Admin System API")
public class AdminSystemController {

    private final AuditLogRepository auditLogRepository;
    private final ErrorLogRepository errorLogRepository;
    private final SettingRepository settingRepository;
    private final AuditLogService auditLogService;
    private final ErrorLogService errorLogService;
    private final SchedulerServiceClient schedulerServiceClient;
    private final RestTemplate restTemplate;

    public AdminSystemController(AuditLogRepository auditLogRepository, ErrorLogRepository errorLogRepository, SettingRepository settingRepository, AuditLogService auditLogService, ErrorLogService errorLogService, SchedulerServiceClient schedulerServiceClient) {
        this.auditLogRepository = auditLogRepository;
        this.errorLogRepository = errorLogRepository;
        this.settingRepository = settingRepository;
        this.auditLogService = auditLogService;
        this.errorLogService = errorLogService;
        this.schedulerServiceClient = schedulerServiceClient;
        this.restTemplate = new RestTemplate();
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get paginated audit logs")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "timestamp") String sortBy,
            @RequestParam(value = "direction", defaultValue = "DESC") String direction,
            @RequestParam(value = "search", required = false) String search) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.Direction.fromString(direction), sortBy);
        
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(auditLogRepository.findByActorContainingIgnoreCaseOrActionTypeContainingIgnoreCaseOrEntityTypeContainingIgnoreCase(search, search, search, pageRequest));
        }
        return ResponseEntity.ok(auditLogRepository.findAll(pageRequest));
    }

    @GetMapping("/error-logs")
    @Operation(summary = "Get paginated error logs")
    public ResponseEntity<Page<ErrorLog>> getErrorLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "timestamp") String sortBy,
            @RequestParam(value = "direction", defaultValue = "DESC") String direction,
            @RequestParam(value = "search", required = false) String search) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.Direction.fromString(direction), sortBy);
        
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(errorLogRepository.findByServiceNameContainingIgnoreCaseOrSeverityContainingIgnoreCase(search, search, pageRequest));
        }
        return ResponseEntity.ok(errorLogRepository.findAll(pageRequest));
    }

    @PostMapping("/internal/errors")
    @Operation(summary = "Internal endpoint for services to report errors")
    public ResponseEntity<Void> reportError(@RequestBody Map<String, String> payload) {
        errorLogService.logError(
            payload.getOrDefault("serviceName", "unknown"),
            payload.getOrDefault("severity", "ERROR"),
            payload.getOrDefault("message", "Unknown error"),
            payload.get("stackTrace")
        );
        return ResponseEntity.ok().build();
    }

    @GetMapping("/settings")
    @Operation(summary = "Get all system settings")
    public ResponseEntity<List<Setting>> getSettings() {
        return ResponseEntity.ok(settingRepository.findAll());
    }

    @PutMapping("/settings")
    @Operation(summary = "Update a system setting")
    public ResponseEntity<Setting> updateSetting(@RequestParam("key") String key, @RequestParam("value") String value) {
        Setting setting = settingRepository.findBySettingKey(key).orElseGet(() -> {
            Setting s = new Setting();
            s.setSettingKey(key);
            return s;
        });
        setting.setSettingValue(value);
        setting = settingRepository.save(setting);
        
        auditLogService.logAction("UPDATE_SETTING", "Setting", key, "Changed to " + value);
        return ResponseEntity.ok(setting);
    }

    @PostMapping("/scheduler/trigger")
    @Operation(summary = "Trigger scheduler manually")
    public ResponseEntity<String> triggerScheduler() {
        String result = schedulerServiceClient.triggerFetch();
        auditLogService.logAction("TRIGGER_SCHEDULER", "Scheduler", "N/A", "Manually triggered fetch");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/health")
    @Operation(summary = "Aggregate health status")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        String[] services = {"gateway", "auth-service", "news-service", "category-service", "search-service", "scheduler-service", "admin-service"};
        
        // This is a simplified fan-out. In production we'd use WebClient asynchronously.
        for (String service : services) {
            try {
                String url = "http://" + service + ":8080/actuator/health";
                if (service.equals("auth-service")) url = "http://auth-service:8081/actuator/health";
                else if (service.equals("news-service")) url = "http://news-service:8082/actuator/health";
                else if (service.equals("category-service")) url = "http://category-service:8083/actuator/health";
                else if (service.equals("search-service")) url = "http://search-service:8084/actuator/health";
                else if (service.equals("scheduler-service")) url = "http://scheduler-service:8085/actuator/health";
                else if (service.equals("admin-service")) url = "http://admin-service:8086/actuator/health"; // Calling self
                
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                health.put(service, response != null ? response.get("status") : "DOWN");
            } catch (Exception e) {
                health.put(service, "DOWN");
            }
        }
        return ResponseEntity.ok(health);
    }
}
