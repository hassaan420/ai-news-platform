package com.newsplatform.scheduler.provider.impl;

import com.newsplatform.scheduler.provider.NewsProvider;
import com.newsplatform.scheduler.provider.dto.NormalizedArticle;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class RssNewsProvider implements NewsProvider {

    private static final Logger log = LoggerFactory.getLogger(RssNewsProvider.class);

    // Config-driven map of outlet name -> RSS feed URL. Instance variable to allow testing overrides.
    private Map<String, String> feedUrls = Map.of(
            "Dawn", "https://www.dawn.com/feed",
            "Express Tribune", "https://tribune.com.pk/feed/home",
            "ARY News", "https://arynews.tv/feed"
    );

    /**
     * Visible for testing to override URLs to point to a local WireMock instance.
     */
    void setFeedUrls(Map<String, String> feedUrls) {
        this.feedUrls = feedUrls;
    }

    @Override
    public String getProviderName() {
        return "RSS_REGIONAL";
    }

    @Override
    public Long getSourceId() {
        return 5L; // Matches V11 migration
    }

    @Override
    public int getPriority() {
        return 5;
    }

    @Override
    public List<NormalizedArticle> fetchNews(String categorySlug, Long categoryId, Instant fromTime) {
        // RSS feeds here are only meant to support search/verification, not scheduled category ingestion.
        // Returning an empty list intentionally, rather than leaving a stub.
        log.debug("fetchNews called on RssNewsProvider, but scheduled ingestion is disabled for RSS.");
        return List.of();
    }

    @Override
    public List<NormalizedArticle> fetchNews(String categorySlug, Long categoryId) {
        return fetchNews(categorySlug, categoryId, null);
    }

    @Override
    public List<NormalizedArticle> searchNews(String query) {
        return searchNews(query, null);
    }

    @Override
    public List<NormalizedArticle> searchNews(String query, List<String> domains) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        
        String lowerQuery = query.toLowerCase();
        List<NormalizedArticle> allArticles = new ArrayList<>();

        for (Map.Entry<String, String> entry : feedUrls.entrySet()) {
            String publisher = entry.getKey();
            String feedUrl = entry.getValue();

            // Simple domain filtering if domains list is provided
            if (domains != null && !domains.isEmpty()) {
                boolean matchesDomain = false;
                for (String domain : domains) {
                    if (feedUrl.contains(domain.toLowerCase())) {
                        matchesDomain = true;
                        break;
                    }
                }
                if (!matchesDomain) {
                    continue; // Skip this feed if it doesn't match the requested domains
                }
            }

            try {
                URL url = new URL(feedUrl);
                SyndFeedInput input = new SyndFeedInput();
                input.setXmlHealerOn(true);
                input.setAllowDoctypes(true);
                SyndFeed feed = input.build(new XmlReader(url));

                for (SyndEntry syndEntry : feed.getEntries()) {
                    String title = syndEntry.getTitle() != null ? syndEntry.getTitle() : "";
                    String description = syndEntry.getDescription() != null ? syndEntry.getDescription().getValue() : "";

                    // Relevance filter: case-insensitive substring match. 
                    // Note: This means matching quality is weaker than keyword-search APIs.
                    if (title.toLowerCase().contains(lowerQuery) || description.toLowerCase().contains(lowerQuery)) {
                        allArticles.add(mapToArticle(syndEntry, publisher));
                    }
                }
            } catch (Exception e) {
                // Wrap each feed's fetch/parse in its own try/catch so one broken/unreachable feed 
                // doesn't fail the whole searchNews call
                log.warn("Failed to fetch or parse RSS feed for publisher {}: {}", publisher, e.getMessage());
            }
        }

        return allArticles;
    }

    private NormalizedArticle mapToArticle(SyndEntry entry, String publisher) {
        NormalizedArticle article = new NormalizedArticle();
        
        String title = entry.getTitle() != null ? entry.getTitle() : "";
        article.setTitle(title);
        
        String description = entry.getDescription() != null ? entry.getDescription().getValue() : "";
        article.setDescription(description);
        
        // Reuse description if no full content available (typical for RSS)
        String content = !entry.getContents().isEmpty() ? entry.getContents().get(0).getValue() : description;
        article.setContent(content);
        
        String articleUrl = entry.getLink();
        String uuid = UUID.randomUUID().toString();
        if (articleUrl != null) {
            try {
                java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
                byte[] hashBytes = md.digest(articleUrl.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                for (byte b : hashBytes) sb.append(String.format("%02x", b));
                uuid = sb.toString();
            } catch (Exception e) { /* fallback to random UUID */ }
        }
        article.setUrl(articleUrl != null ? articleUrl : "https://rss.local/" + uuid);
        
        // Rome image extraction omitted due to varying RSS/Atom standards
        article.setImage("");
        
        article.setAuthor(entry.getAuthor() != null ? entry.getAuthor() : "");
        article.setPublisher(publisher);
        article.setSourceId(getSourceId());
        article.setCategoryId(null); // No specific category for search
        article.setLanguage("en");
        
        article.setPublishedAt(entry.getPublishedDate() != null ? 
                java.time.format.DateTimeFormatter.ISO_INSTANT.format(entry.getPublishedDate().toInstant()) : 
                Instant.now().toString());
        
        article.setHash(uuid);
        
        return article;
    }
}
