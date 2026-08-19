package com.newsplatform.scheduler.provider;

import com.newsplatform.scheduler.provider.dto.NormalizedArticle;
import java.util.List;

public interface NewsProvider {
    /**
     * Unique name of the provider.
     */
    String getProviderName();
    
    /**
     * The ID matching the source in the database.
     */
    Long getSourceId();

    /**
     * Priority for failover. Lower number means higher priority.
     */
    int getPriority();

    /**
     * Fetch news for a given category within an optional date window.
     */
    default List<NormalizedArticle> fetchNews(String categorySlug, Long categoryId, java.time.Instant fromTime) {
        return fetchNews(categorySlug, categoryId);
    }

    /**
     * Fetch news for a given category.
     */
    List<NormalizedArticle> fetchNews(String categorySlug, Long categoryId);
    
    /**
     * Search news using a specific query across all categories.
     * Useful for cross-source verification.
     */
    default List<NormalizedArticle> searchNews(String query) {
        return List.of(); // Default empty implementation to avoid breaking changes if unsupported
    }

    /**
     * Search news for a query, optionally restricted to a specific set of source domains
     * (e.g. "bbc.com", "reuters.com").
     *
     * <p>Providers that support domain filtering (e.g. NewsAPI) override this method.
     * Providers that do not support domain filtering use this safe default, which falls
     * back to {@link #searchNews(String)} and ignores the domains parameter — matching
     * the same pattern as {@link #fetchNews(String, Long, java.time.Instant)}.
     *
     * @param query   the keyword search query (required)
     * @param domains a non-null but possibly empty list of bare domain strings (no protocol,
     *                no path), e.g. {@code List.of("bbc.com","reuters.com")}. An empty or
     *                null list means "no domain restriction".
     * @return a list of {@link NormalizedArticle}; never {@code null}.
     */
    default List<NormalizedArticle> searchNews(String query, List<String> domains) {
        return searchNews(query);
    }
}
