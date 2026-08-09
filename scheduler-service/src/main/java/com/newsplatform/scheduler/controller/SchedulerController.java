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
}
