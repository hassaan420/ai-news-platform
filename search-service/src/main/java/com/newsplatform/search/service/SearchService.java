package com.newsplatform.search.service;

import com.newsplatform.search.client.NewsServiceClient;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class SearchService {

    private final NewsServiceClient newsServiceClient;

    public SearchService(NewsServiceClient newsServiceClient) {
        this.newsServiceClient = newsServiceClient;
    }

    @Cacheable(value = "search_results", key = "#keyword + '-' + #page + '-' + #size + '-' + #sortBy + '-' + #direction")
    public Object search(String keyword, int page, int size, String sortBy, String direction) {
        // Forward the search query to the news-service which handles the DB indexing
        // In a real microservice environment, search-service might index data into Elasticsearch directly
        // and query ES. For this architecture, it aggregates via Feign.
        return newsServiceClient.searchArticles(keyword, page, size, sortBy, direction);
    }
}
