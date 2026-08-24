package com.newsplatform.admin.controller;

import com.newsplatform.admin.client.NewsServiceClient;
import com.newsplatform.admin.dto.PagedResponse;
import com.newsplatform.admin.dto.SourceDto;
import com.newsplatform.admin.dto.SourceRequest;
import com.newsplatform.admin.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/sources")
@Tag(name = "Admin Source API")
public class AdminSourceController {

    private final NewsServiceClient newsServiceClient;
    private final AuditLogService auditLogService;

    public AdminSourceController(NewsServiceClient newsServiceClient, AuditLogService auditLogService) {
        this.newsServiceClient = newsServiceClient;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @Operation(summary = "Get paginated sources")
    public ResponseEntity<PagedResponse<SourceDto>> getSources(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "name") String sortBy,
            @RequestParam(value = "direction", defaultValue = "ASC") String direction,
            @RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(newsServiceClient.getSources(page, size, sortBy, direction, status));
    }

    @PostMapping
    @Operation(summary = "Create a new source")
    public ResponseEntity<SourceDto> createSource(@RequestBody SourceRequest request) {
        SourceDto source = newsServiceClient.createSource(request);
        auditLogService.logAction("CREATE_SOURCE", "Source", String.valueOf(source.id()), "Created source: " + source.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(source);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing source")
    public ResponseEntity<SourceDto> updateSource(@PathVariable Long id, @RequestBody SourceRequest request) {
        SourceDto source = newsServiceClient.updateSource(id, request);
        auditLogService.logAction("UPDATE_SOURCE", "Source", String.valueOf(id), "Updated source: " + source.name());
        return ResponseEntity.ok(source);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a source")
    public ResponseEntity<Void> deleteSource(@PathVariable Long id) {
        newsServiceClient.deleteSource(id);
        auditLogService.logAction("DELETE_SOURCE", "Source", String.valueOf(id), "Deleted source");
        return ResponseEntity.noContent().build();
    }
}
