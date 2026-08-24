package com.newsplatform.news.controller;

import com.newsplatform.news.dto.FetchLogDto;
import com.newsplatform.common.dto.PagedResponse;
import com.newsplatform.news.entity.FetchLog;
import com.newsplatform.news.repository.FetchLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/internal/fetch-logs")
@Tag(name = "Internal Fetch Logs API", description = "Endpoints for retrieving fetch logs")
public class InternalFetchLogController {

    private final FetchLogRepository fetchLogRepository;

    public InternalFetchLogController(FetchLogRepository fetchLogRepository) {
        this.fetchLogRepository = fetchLogRepository;
    }

    @GetMapping
    @Operation(summary = "Get all fetch logs paginated")
    public ResponseEntity<PagedResponse<FetchLogDto>> getFetchLogs(
            @PageableDefault(size = 20, sort = "fetchedAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String status) {

        Page<FetchLog> page;
        if (status != null && !status.isBlank()) {
            page = fetchLogRepository.findByStatus(status, pageable);
        } else {
            page = fetchLogRepository.findAll(pageable);
        }

        List<FetchLogDto> content = page.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        PagedResponse<FetchLogDto> response = new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );

        return ResponseEntity.ok(response);
    }

    private FetchLogDto toDto(FetchLog log) {
        return new FetchLogDto(
                log.getId(),
                log.getSource() != null ? log.getSource().getId() : null,
                log.getStatus(),
                log.getArticlesFetched(),
                log.getArticlesStored(),
                log.getDuplicatesSkipped(),
                log.getErrorMessage(),
                log.getFetchedAt(),
                log.getExecutionTimeMs()
        );
    }
}
