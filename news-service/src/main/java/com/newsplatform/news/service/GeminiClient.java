package com.newsplatform.news.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Thin HTTP wrapper for the Google Gemini REST API.
 *
 * <p>Endpoint:
 * <pre>POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={KEY}</pre>
 *
 * <p>Authentication: the API key is supplied via the {@code key} query param.
 * The key is read from the {@code GOOGLE_API_KEY} environment variable (also
 * configurable via the {@code ai.gemini.api-key} property).
 *
 * <p>No SDK dependency — uses the existing {@link RestTemplate} bean.
 */
@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String model;

    public GeminiClient(
        RestTemplate restTemplate,
        @Value("${ai.gemini.api-key:${GOOGLE_API_KEY:}}") String apiKey,
        @Value("${ai.gemini.model:gemini-flash-latest}") String model
    ) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model;
    }

    /** True when a non-empty API key has been configured. */
    public boolean isConfigured() {
        return !apiKey.isEmpty();
    }

    public String model() {
        return model;
    }

    /**
     * Send a free-form prompt to Gemini and return the model's first text
     * response. Returns {@code null} on any failure (network, non-2xx, parse)
     * so callers can fall back without catching exceptions.
     *
     * <p>Caller-supplied {@code temperature} and {@code maxOutputTokens} keep
     * generations cheap and bounded.
     */
    public String generate(String prompt) {
        if (!isConfigured()) {
            return null;
        }
        try {
            Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                    "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", Map.of(
                    "temperature", 0.2,
                    "maxOutputTokens", 512
                )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = BASE_URL + "/" + model + ":generateContent?key=" + apiKey;
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            @SuppressWarnings("unchecked")
            ResponseEntity<Map> resp = restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class
            );

            return extractFirstText(resp.getBody());
        } catch (RestClientException ex) {
            log.warn("Gemini request failed: {}", ex.getMessage());
            return null;
        } catch (RuntimeException ex) {
            log.warn("Gemini request unexpected error: {}", ex.getMessage());
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private String extractFirstText(Map body) {
        if (body == null) return null;
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
        if (candidates == null || candidates.isEmpty()) return null;
        Map<String, Object> first = candidates.get(0);
        if (first == null) return null;
        Map<String, Object> content = (Map<String, Object>) first.get("content");
        if (content == null) return null;
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) return null;
        Object text = parts.get(0).get("text");
        return text == null ? null : text.toString().trim();
    }
}
