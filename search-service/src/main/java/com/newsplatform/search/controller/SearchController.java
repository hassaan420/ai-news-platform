package com.newsplatform.search.controller;

import com.newsplatform.search.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/news/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<Object> search(
        @RequestParam(value = "q") String q,
        @RequestParam(value = "category", required = false) String category,
        @RequestParam(value = "source", required = false) String source,
        @RequestParam(value = "author", required = false) String author,
        @RequestParam(value = "dateFrom", required = false) String dateFrom,
        @RequestParam(value = "dateTo", required = false) String dateTo,
        @RequestParam(value = "page", defaultValue = "0") int page,
        @RequestParam(value = "size", defaultValue = "20") int size,
        @RequestParam(value = "sortBy", defaultValue = "publishedAt") String sortBy,
        @RequestParam(value = "direction", defaultValue = "DESC") String direction
    ) {
        if (q == null || q.trim().isEmpty()) {
            throw new com.newsplatform.common.exception.BadRequestException("Query parameter 'q' is required and cannot be blank");
        }
        return ResponseEntity.ok(searchService.search(q, category, source, author, dateFrom, dateTo, page, size, sortBy, direction));
    }
}
