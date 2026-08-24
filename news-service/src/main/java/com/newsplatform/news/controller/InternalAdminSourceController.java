package com.newsplatform.news.controller;

import com.newsplatform.news.dto.SourceDto;
import com.newsplatform.news.dto.SourceRequest;
import com.newsplatform.news.entity.Source;
import com.newsplatform.news.repository.SourceRepository;
import com.newsplatform.common.exception.ConflictException;
import com.newsplatform.common.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Internal admin endpoint for Source CRUD — used by admin-service via Feign.
 * Not exposed through the Gateway (internal/** is excluded from Gateway routing).
 */
@RestController
@RequestMapping("/internal/admin/sources")
@Tag(name = "Internal Admin Sources API", description = "Source management endpoints for admin-service")
public class InternalAdminSourceController {

    private final SourceRepository sourceRepository;

    public InternalAdminSourceController(SourceRepository sourceRepository) {
        this.sourceRepository = sourceRepository;
    }

    @GetMapping
    @Operation(summary = "List all sources paginated")
    public ResponseEntity<Page<SourceDto>> getSources(
            @PageableDefault(size = 20, sort = "name") Pageable pageable,
            @RequestParam(required = false) String status) {
        Page<Source> page = (status != null && !status.isBlank())
                ? sourceRepository.findByStatus(status, pageable)
                : sourceRepository.findAll(pageable);
        return ResponseEntity.ok(page.map(this::toDto));
    }

    @GetMapping("/all")
    @Operation(summary = "List all active sources (no pagination)")
    public ResponseEntity<List<SourceDto>> getAllActiveSources() {
        return ResponseEntity.ok(
                sourceRepository.findByStatus("ACTIVE", Pageable.unpaged())
                        .getContent().stream().map(this::toDto).collect(Collectors.toList())
        );
    }

    @PostMapping
    @Operation(summary = "Create a new source")
    public ResponseEntity<SourceDto> createSource(@Valid @RequestBody SourceRequest request) {
        if (sourceRepository.findByNameIgnoreCase(request.name()).isPresent()) {
            throw new ConflictException("Source with name '" + request.name() + "' already exists");
        }
        Source source = new Source(
                request.provider(),
                request.name(),
                request.apiKey(),
                request.endpoint(),
                "ACTIVE"
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(sourceRepository.save(source)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing source")
    public ResponseEntity<SourceDto> updateSource(@PathVariable Long id,
                                                   @Valid @RequestBody SourceRequest request) {
        Source source = sourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Source not found with id: " + id));
        source.setProvider(request.provider());
        source.setName(request.name());
        if (request.apiKey() != null) {
            source.setApiKey(request.apiKey());
        }
        source.setEndpoint(request.endpoint());
        if (request.status() != null) {
            source.setStatus(request.status());
        }
        return ResponseEntity.ok(toDto(sourceRepository.save(source)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a source (sets status to DISABLED)")
    public ResponseEntity<Void> deleteSource(@PathVariable Long id) {
        Source source = sourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Source not found with id: " + id));
        source.setStatus("DISABLED");
        sourceRepository.save(source);
        return ResponseEntity.noContent().build();
    }

    private SourceDto toDto(Source s) {
        return new SourceDto(s.getId(), s.getProvider(), s.getName(), s.getEndpoint(),
                s.getStatus(), s.getCreatedAt(), s.getUpdatedAt());
    }
}
