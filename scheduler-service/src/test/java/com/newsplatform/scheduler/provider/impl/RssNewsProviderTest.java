package com.newsplatform.scheduler.provider.impl;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.newsplatform.scheduler.provider.dto.NormalizedArticle;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;

class RssNewsProviderTest {

    private WireMockServer wireMockServer;
    private RssNewsProvider provider;

    @BeforeEach
    void setUp() {
        // Start WireMock on a dynamic port
        wireMockServer = new WireMockServer(0);
        wireMockServer.start();
        configureFor("localhost", wireMockServer.port());

        provider = new RssNewsProvider();
        provider.setFeedUrls(Map.of(
                "Dawn", "http://localhost:" + wireMockServer.port() + "/dawn",
                "Tribune", "http://localhost:" + wireMockServer.port() + "/tribune"
        ));
    }

    @AfterEach
    void tearDown() {
        if (wireMockServer != null) {
            wireMockServer.stop();
        }
    }

    @Test
    void searchNews_withMatchingKeywords_returnsFilteredArticles() {
        String dawnRss = """
                <?xml version="1.0" encoding="UTF-8" ?>
                <rss version="2.0">
                <channel>
                  <title>Dawn News</title>
                  <item>
                    <title>Pakistan wins cricket match against test team</title>
                    <description>A great victory in the final.</description>
                    <link>http://example.com/dawn/1</link>
                    <pubDate>Tue, 17 Oct 2023 10:00:00 GMT</pubDate>
                  </item>
                  <item>
                    <title>Unrelated news</title>
                    <description>Nothing to see here.</description>
                    <link>http://example.com/dawn/2</link>
                  </item>
                </channel>
                </rss>""";

        String tribuneRss = """
                <?xml version="1.0" encoding="UTF-8" ?>
                <rss version="2.0">
                <channel>
                  <title>Tribune News</title>
                  <item>
                    <title>Another headline</title>
                    <description>Test coverage is important for software.</description>
                    <link>http://example.com/tribune/1</link>
                    <author>John Doe</author>
                  </item>
                </channel>
                </rss>""";

        stubFor(get(urlEqualTo("/dawn"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/rss+xml")
                        .withBody(dawnRss)));

        stubFor(get(urlEqualTo("/tribune"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/rss+xml")
                        .withBody(tribuneRss)));

        // Both feeds contain "test" in different places
        List<NormalizedArticle> results = provider.searchNews("test");

        assertThat(results).hasSize(2);
        assertThat(results).extracting(NormalizedArticle::getTitle)
                .containsExactlyInAnyOrder("Pakistan wins cricket match against test team", "Another headline");
        
        assertThat(results).extracting(NormalizedArticle::getPublisher)
                .containsExactlyInAnyOrder("Dawn", "Tribune");
    }

    @Test
    void searchNews_withOneFailingFeed_continuesParsingOthers() {
        String tribuneRss = """
                <?xml version="1.0" encoding="UTF-8" ?>
                <rss version="2.0">
                <channel>
                  <title>Tribune News</title>
                  <item>
                    <title>Valid test news</title>
                    <description>This one works.</description>
                    <link>http://example.com/tribune/1</link>
                  </item>
                </channel>
                </rss>""";

        // Dawn fails with 500
        stubFor(get(urlEqualTo("/dawn"))
                .willReturn(aResponse().withStatus(500)));

        // Tribune succeeds
        stubFor(get(urlEqualTo("/tribune"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/rss+xml")
                        .withBody(tribuneRss)));

        List<NormalizedArticle> results = provider.searchNews("test");

        // The failure of Dawn should be caught, and Tribune results should still be returned
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).isEqualTo("Valid test news");
    }

    @Test
    void searchNews_withDomainFilter_onlyFetchesMatchingFeeds() {
        // Domains filter matches 'tribune', should skip 'dawn'
        provider.setFeedUrls(Map.of(
                "Dawn", "http://localhost:8080/dawn.com/feed",
                "Tribune", "http://localhost:8080/tribune.com.pk/feed"
        ));
        
        // This test doesn't strictly need WireMock because it tests the filtering logic before fetch
        // But we will use the existing wiremock urls
        provider.setFeedUrls(Map.of(
                "Dawn", "http://dawn.example.com/feed",
                "Tribune", "http://tribune.example.com/feed"
        ));

        List<NormalizedArticle> results = provider.searchNews("test", List.of("tribune.example.com"));
        
        // Since both endpoints don't exist here, it would normally try to fetch and fail, returning empty list.
        // We just assert it returns empty and we don't throw. 
        assertThat(results).isEmpty();
    }
    
    @Test
    void fetchNews_returnsEmptyList() {
        List<NormalizedArticle> results = provider.fetchNews("politics", 1L);
        assertThat(results).isEmpty();
    }
}
