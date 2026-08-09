package com.newsplatform.news.controller;

import com.newsplatform.news.dto.NewsSummaryResponse;
import com.newsplatform.news.mapper.NewsMapper;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.common.dto.PagedResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AI-enhanced search endpoint.
 *
 * <p>Uses the full-text MATCH/AGAINST index plus keyword/tag weighting defined
 * in {@link ArticleRepository#searchArticles}. Returns {@link NewsSummaryResponse}
 * DTOs — never raw entities — to avoid Hibernate lazy-proxy serialisation failures.
 */
@RestController
@RequestMapping("/api/news/ai/search")
public class AiSearchController {

    private static final Logger log = LoggerFactory.getLogger(AiSearchController.class);

    private final ArticleRepository articleRepository;
    private final NewsMapper newsMapper;

    public AiSearchController(ArticleRepository articleRepository, NewsMapper newsMapper) {
        this.articleRepository = articleRepository;
        this.newsMapper = newsMapper;
    }

    /**
     * Intelligent full-text search with AI keyword weighting.
     *
     * @param q    search query (required, min 1 char)
     * @param page zero-based page index (default 0)
     * @param size results per page (default 20, max 50)
     */
    @GetMapping
    public ResponseEntity<PagedResponse<NewsSummaryResponse>> intelligentSearch(
            @RequestParam("q") String q,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {

        if (q == null || q.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        size = Math.min(size, 50); // cap page size

        log.info("AI search request: q='{}' page={} size={}", q, page, size);

        // Sanitize search query for MySQL FULLTEXT boolean mode to avoid syntax errors on operators like '--'
        String cleanQuery = q.replaceAll("[+\\-*~\"()<>]", " ").trim();
        if (cleanQuery.isEmpty()) {
            cleanQuery = q.replaceAll("[^a-zA-Z0-9\\s]", "").trim();
        }
        if (cleanQuery.isEmpty()) {
            return ResponseEntity.ok(new PagedResponse<>(List.of(), page, size, 0, 0, true));
        }

        Pageable pageable = PageRequest.of(page, size);
        org.springframework.data.domain.Page<com.newsplatform.news.entity.Article> resultPage;
        try {
            resultPage = articleRepository.searchArticles(cleanQuery, pageable);
        } catch (Exception ex) {
            log.warn("Fulltext search failed for '{}', falling back to empty page: {}", cleanQuery, ex.getMessage());
            return ResponseEntity.ok(new PagedResponse<>(List.of(), page, size, 0, 0, true));
        }

        List<NewsSummaryResponse> content = resultPage.getContent()
                .stream()
                .map(newsMapper::toNewsSummaryResponse)
                .collect(Collectors.toList());

        PagedResponse<NewsSummaryResponse> response = new PagedResponse<>(
                content,
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.isLast()
        );

        log.info("AI search for '{}' returned {} results (total {})", q, content.size(), resultPage.getTotalElements());
        return ResponseEntity.ok(response);
    }
}
