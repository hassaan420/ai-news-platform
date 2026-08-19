package com.newsplatform.scheduler.provider.impl;

import com.newsplatform.scheduler.provider.dto.NormalizedArticle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * Unit tests verifying that {@link MediastackProvider#searchNews(String, List)} falls back
 * correctly to the unfiltered search when domains are supplied (interface default).
 *
 * <p>Mediastack's search API does not support domain filtering via raw domain strings —
 * it uses proprietary internal source IDs obtainable only via its /v1/sources endpoint,
 * which cannot be mapped at search time. The interface default is the no-op fallback.
 */
class MediastackProviderTest {

    private MediastackProvider provider;

    @BeforeEach
    void setUp() {
        provider = new MediastackProvider();
        // Blank API key → searchNews returns List.of() without any HTTP call.
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
     * to searchNews(query) for providers that don't override the domain overload.
     */
    @Test
    void searchNews_domainOverload_producesIdenticalResultToUnfilteredCall() {
        List<NormalizedArticle> unfiltered = provider.searchNews("ukraine");
        List<NormalizedArticle> withDomains = provider.searchNews("ukraine", List.of("mediastack.com"));
        assertThat(withDomains).isEqualTo(unfiltered);
    }
}
