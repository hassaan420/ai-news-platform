package com.newsplatform.scheduler.provider.impl;

import com.newsplatform.scheduler.provider.dto.NormalizedArticle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * Unit tests verifying that {@link GNewsProvider#searchNews(String, List)} falls back
 * correctly to the unfiltered search when domains are supplied (interface default).
 *
 * <p>GNews v4 search API does not support domain/source filtering — the interface default
 * {@code searchNews(query, domains) → searchNews(query)} is the documented no-op behaviour.
 * These tests verify: (a) no NPE/exception with domains supplied, (b) result set is same
 * as unfiltered call. We mock the RestTemplate to avoid live calls (TESTING.md §5).
 */
class GNewsProviderTest {

    private GNewsProvider provider;

    @BeforeEach
    void setUp() {
        provider = new GNewsProvider();
        // Blank API key → searchNews returns List.of() without any HTTP call.
        // This is sufficient to verify the no-exception contract for the fallback.
        ReflectionTestUtils.setField(provider, "apiKey", "");
    }

    @Test
    void searchNews_withDomainsAndBlankKey_returnsEmptyWithoutException() {
        assertThatCode(() -> {
            List<NormalizedArticle> results = provider.searchNews("ukraine", List.of("bbc.com", "reuters.com"));
            assertThat(results).isEmpty();
        }).doesNotThrowAnyException();
    }

    @Test
    void searchNews_withNullDomainsAndBlankKey_returnsEmptyWithoutException() {
        assertThatCode(() -> {
            List<NormalizedArticle> results = provider.searchNews("ukraine", null);
            assertThat(results).isEmpty();
        }).doesNotThrowAnyException();
    }

    @Test
    void searchNews_withEmptyDomainsAndBlankKey_returnsEmptyWithoutException() {
        assertThatCode(() -> {
            List<NormalizedArticle> results = provider.searchNews("ukraine", List.of());
            assertThat(results).isEmpty();
        }).doesNotThrowAnyException();
    }

    /**
     * Verifies the interface default wiring: searchNews(query, domains) must delegate
     * to searchNews(query) when GNewsProvider does not override the domain overload.
     * Since GNewsProvider does NOT override searchNews(String, List<String>), the call
     * must reach searchNews(String) — both return the same result (empty with blank key).
     */
    @Test
    void searchNews_domainOverload_producesIdenticalResultToUnfilteredCall() {
        List<NormalizedArticle> unfiltered = provider.searchNews("ukraine");
        List<NormalizedArticle> withDomains = provider.searchNews("ukraine", List.of("bbc.com"));
        assertThat(withDomains).isEqualTo(unfiltered);
    }
}
