package com.newsplatform.scheduler.provider.impl;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.newsplatform.scheduler.provider.dto.NormalizedArticle;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link NewsApiProvider}'s domain-filtered search capability.
 *
 * <p>Uses WireMock to stub the NewsAPI /v2/everything endpoint — no live API
 * calls are made in automated tests (TESTING.md §5).
 *
 * <p>Naming: {@code NewsApiProviderTest} (unit test, runs via Surefire).
 */
class NewsApiProviderTest {

    private WireMockServer wireMock;
    private NewsApiProvider provider;

    private static final String FIXTURE_PATH =
            "src/test/resources/fixtures/newsapi/search_response.json";
    private static final String FAKE_API_KEY = "test-api-key-12345";

    @BeforeEach
    void setUp() throws Exception {
        wireMock = new WireMockServer(WireMockConfiguration.wireMockConfig().dynamicPort());
        wireMock.start();
        WireMock.configureFor("localhost", wireMock.port());

        provider = new NewsApiProvider();
        // Override the RestTemplate to point at WireMock's base URL
        RestTemplate rt = new RestTemplate();
        ReflectionTestUtils.setField(provider, "restTemplate", rt);
        ReflectionTestUtils.setField(provider, "apiKey", FAKE_API_KEY);

        // Override the NewsAPI base URL via a custom RestTemplate that rewrites the host.
        // Simpler approach: use WireMock's global URL matching (path-only) by making the
        // provider use a pre-configured base URL. We achieve this by subclassing behaviour
        // and injecting a RestTemplate that maps to WireMock.
        //
        // Practical approach for this implementation: stub the full path and trust that
        // the provider builds a URL with /v2/everything — which WireMock intercepts via
        // its URL path stub (see stubs below). We configure the provider to call
        // http://localhost:<port>/v2/everything by injecting a test-scoped RestTemplate
        // whose root is WireMock's port. We do this by making the provider configurable
        // via a package-private constructor used only in tests.
        //
        // Since the provider currently hard-codes the host (newsapi.org), we use WireMock's
        // proxy mode: stub the absolute URL pattern so the provider's RestTemplate is
        // pointed at WireMock instead of the real host. This is the standard pattern per
        // TESTING.md §5 — providers are tested "against a fixture of a real response".
        // We reflect the restTemplate field so we can inject one configured for WireMock.
        RestTemplate wiremockRt = new org.springframework.web.client.RestTemplate() {
            @Override
            public <T> T getForObject(String url, Class<T> responseType, Object... uriVariables) {
                // Redirect newsapi.org calls to the WireMock server
                String rewritten = url.replace("https://newsapi.org", "http://localhost:" + wireMock.port());
                return super.getForObject(rewritten, responseType, uriVariables);
            }
        };
        ReflectionTestUtils.setField(provider, "restTemplate", wiremockRt);
    }

    @AfterEach
    void tearDown() {
        wireMock.stop();
    }

    private String fixture() throws Exception {
        return new String(Files.readAllBytes(Paths.get(FIXTURE_PATH)));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Test: searchNews(query) — unfiltered, no domains param in URL
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    void searchNews_withoutDomains_buildsUrlWithoutDomainsParam() throws Exception {
        wireMock.stubFor(get(urlPathEqualTo("/v2/everything"))
                .withQueryParam("q", equalTo("ukraine"))
                .withQueryParam("language", equalTo("en"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody(fixture())));

        List<NormalizedArticle> results = provider.searchNews("ukraine");

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getTitle()).isEqualTo("Test Article One");
        wireMock.verify(getRequestedFor(urlPathEqualTo("/v2/everything"))
                .withQueryParam("q", equalTo("ukraine"))
                .withoutQueryParam("domains"));
    }

    @Test
    void searchNews_withNullDomains_buildsUrlWithoutDomainsParam() throws Exception {
        wireMock.stubFor(get(urlPathEqualTo("/v2/everything"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody(fixture())));

        List<NormalizedArticle> results = provider.searchNews("ukraine", null);

        assertThat(results).isNotNull();
        wireMock.verify(getRequestedFor(urlPathEqualTo("/v2/everything"))
                .withoutQueryParam("domains"));
    }

    @Test
    void searchNews_withEmptyDomainsList_buildsUrlWithoutDomainsParam() throws Exception {
        wireMock.stubFor(get(urlPathEqualTo("/v2/everything"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody(fixture())));

        List<NormalizedArticle> results = provider.searchNews("ukraine", List.of());

        assertThat(results).isNotNull();
        wireMock.verify(getRequestedFor(urlPathEqualTo("/v2/everything"))
                .withoutQueryParam("domains"));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Test: searchNews(query, domains) — filtered, domains param MUST appear in URL
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    void searchNews_withDomains_appendsDomainsParamToUrl() throws Exception {
        wireMock.stubFor(get(urlPathEqualTo("/v2/everything"))
                .withQueryParam("domains", equalTo("bbc.com,reuters.com"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody(fixture())));

        List<NormalizedArticle> results = provider.searchNews("ukraine", List.of("bbc.com", "reuters.com"));

        assertThat(results).hasSize(2);
        wireMock.verify(getRequestedFor(urlPathEqualTo("/v2/everything"))
                .withQueryParam("domains", equalTo("bbc.com,reuters.com")));
    }

    @Test
    void searchNews_withSingleDomain_appendsSingleDomainToUrl() throws Exception {
        wireMock.stubFor(get(urlPathEqualTo("/v2/everything"))
                .withQueryParam("domains", equalTo("bbc.com"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody(fixture())));

        List<NormalizedArticle> results = provider.searchNews("ukraine", List.of("bbc.com"));

        assertThat(results).isNotNull();
        wireMock.verify(getRequestedFor(urlPathEqualTo("/v2/everything"))
                .withQueryParam("domains", equalTo("bbc.com")));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Test: missing API key → empty list, no HTTP call
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    void searchNews_withBlankApiKey_returnsEmptyListWithoutCallingApi() {
        ReflectionTestUtils.setField(provider, "apiKey", "");

        List<NormalizedArticle> results = provider.searchNews("ukraine", List.of("bbc.com"));

        assertThat(results).isEmpty();
        wireMock.verify(0, getRequestedFor(urlPathEqualTo("/v2/everything")));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Test: [Removed] titles are filtered out
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    void searchNews_removedTitlesAreFiltered() throws Exception {
        String removedBody = "{\"status\":\"ok\",\"totalResults\":1,\"articles\":[" +
                "{\"source\":{\"id\":\"x\",\"name\":\"X\"},\"title\":\"[Removed]\"," +
                "\"description\":\"d\",\"url\":\"https://example.com/a\"," +
                "\"publishedAt\":\"2026-08-18T10:00:00Z\",\"content\":\"c\"}]}";
        wireMock.stubFor(get(urlPathEqualTo("/v2/everything"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody(removedBody)));

        List<NormalizedArticle> results = provider.searchNews("test", List.of("example.com"));

        assertThat(results).isEmpty();
    }
}
