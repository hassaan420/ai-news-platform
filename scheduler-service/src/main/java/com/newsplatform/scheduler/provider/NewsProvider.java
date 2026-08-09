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
}
