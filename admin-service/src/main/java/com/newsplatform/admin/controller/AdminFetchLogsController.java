package com.newsplatform.admin.controller;

import com.newsplatform.admin.client.NewsServiceClient;
import com.newsplatform.admin.dto.FetchLogDto;
import com.newsplatform.admin.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/logs")
@Tag(name = "Admin Fetch Logs API")
public class AdminFetchLogsController {

    private final NewsServiceClient newsServiceClient;

    public AdminFetchLogsController(NewsServiceClient newsServiceClient) {
        this.newsServiceClient = newsServiceClient;
    }

    @GetMapping
    @Operation(summary = "Get paginated fetch logs")
    public ResponseEntity<PagedResponse<FetchLogDto>> getFetchLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "fetchedAt") String sortBy,
            @RequestParam(value = "direction", defaultValue = "DESC") String direction,
            @RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(newsServiceClient.getFetchLogs(page, size, sortBy, direction, status));
    }
}
