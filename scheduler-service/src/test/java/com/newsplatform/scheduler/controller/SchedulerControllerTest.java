package com.newsplatform.scheduler.controller;

import com.newsplatform.scheduler.provider.NewsProvider;
import com.newsplatform.scheduler.provider.NewsProviderFactory;
import com.newsplatform.scheduler.provider.dto.NormalizedArticle;
import com.newsplatform.scheduler.service.SchedulerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link SchedulerController#searchNews(String, List)}.
 *
 * <p>Verifies: (1) domains are passed through to each provider's domain-aware overload,
 * (2) null domains still works and delegates correctly, (3) a provider that throws does
 * not prevent the remaining providers from contributing results (per-provider isolation).
 */
@ExtendWith(MockitoExtension.class)
class SchedulerControllerTest {

    @Mock
    private SchedulerService schedulerService;

    @Mock
    private NewsProviderFactory newsProviderFactory;

    @InjectMocks
    private SchedulerController controller;

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    private static NormalizedArticle article(String title) {
        NormalizedArticle a = new NormalizedArticle();
        a.setTitle(title);
        return a;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Test: domains are passed through to each provider's domain overload
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    void searchNews_withDomains_passesDomainsToEachProvider() {
        List<String> domains = List.of("bbc.com", "reuters.com");
        NewsProvider providerA = mock(NewsProvider.class);
        NewsProvider providerB = mock(NewsProvider.class);
        when(providerA.searchNews(eq("ukraine"), eq(domains))).thenReturn(List.of(article("A1")));
        when(providerB.searchNews(eq("ukraine"), eq(domains))).thenReturn(List.of(article("B1")));
        when(newsProviderFactory.getAllProviders()).thenReturn(List.of(providerA, providerB));

        ResponseEntity<List<NormalizedArticle>> response = controller.searchNews("ukraine", domains);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody()).extracting(NormalizedArticle::getTitle)
                .containsExactlyInAnyOrder("A1", "B1");
        // Verify domains were passed through — NOT the no-arg overload
        verify(providerA).searchNews("ukraine", domains);
        verify(providerB).searchNews("ukraine", domains);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Test: null domains (param absent from request) still works
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    void searchNews_withNullDomains_callsProviderDomainOverloadWithNull() {
        NewsProvider provider = mock(NewsProvider.class);
        when(provider.searchNews(eq("ukraine"), isNull()))
                .thenReturn(List.of(article("Article1")));
        when(newsProviderFactory.getAllProviders()).thenReturn(List.of(provider));

        ResponseEntity<List<NormalizedArticle>> response = controller.searchNews("ukraine", null);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).hasSize(1);
        verify(provider).searchNews("ukraine", null);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Test: a provider that throws does NOT prevent others from returning results
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    void searchNews_whenOneProviderThrows_otherProvidersStillContributeResults() {
        List<String> domains = List.of("bbc.com");
        NewsProvider failingProvider = mock(NewsProvider.class);
        NewsProvider goodProvider = mock(NewsProvider.class);
        when(failingProvider.searchNews(anyString(), anyList()))
                .thenThrow(new RuntimeException("Provider timeout"));
        when(goodProvider.searchNews(eq("ukraine"), eq(domains)))
                .thenReturn(List.of(article("GoodResult")));
        when(newsProviderFactory.getAllProviders()).thenReturn(List.of(failingProvider, goodProvider));

        ResponseEntity<List<NormalizedArticle>> response = controller.searchNews("ukraine", domains);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getTitle()).isEqualTo("GoodResult");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Test: results from all providers are aggregated into a single list
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    void searchNews_aggregatesResultsFromAllProviders() {
        NewsProvider p1 = mock(NewsProvider.class);
        NewsProvider p2 = mock(NewsProvider.class);
        NewsProvider p3 = mock(NewsProvider.class);
        when(p1.searchNews(anyString(), any())).thenReturn(List.of(article("P1-A"), article("P1-B")));
        when(p2.searchNews(anyString(), any())).thenReturn(List.of(article("P2-A")));
        when(p3.searchNews(anyString(), any())).thenReturn(List.of());
        when(newsProviderFactory.getAllProviders()).thenReturn(List.of(p1, p2, p3));

        ResponseEntity<List<NormalizedArticle>> response = controller.searchNews("test", null);

        assertThat(response.getBody()).hasSize(3);
        assertThat(response.getBody()).extracting(NormalizedArticle::getTitle)
                .containsExactlyInAnyOrder("P1-A", "P1-B", "P2-A");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Test: provider returning null is handled gracefully (addAll null guard)
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    void searchNews_whenProviderReturnsNull_doesNotThrow() {
        NewsProvider p = mock(NewsProvider.class);
        when(p.searchNews(anyString(), any())).thenReturn(null);
        when(newsProviderFactory.getAllProviders()).thenReturn(List.of(p));

        ResponseEntity<List<NormalizedArticle>> response = controller.searchNews("test", null);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isEmpty();
    }
}
