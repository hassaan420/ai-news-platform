package com.newsplatform.news.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
 * <p>Rate limiting and 429 circuit-breaker are delegated to {@link GeminiRateLimiter}.
 * Every call to {@link #generate(String)} first checks the rate limiter before
 * sending any HTTP request. A 429 response activates the global cooldown.
 *
 * <p>No SDK dependency — uses the existing {@link RestTemplate} bean.
 */
@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

    /**
     * Pattern to extract the numeric part from a retryDelay string like "47s" or "47.123s".
     * Gemini returns the delay in the 429 error body under error.details[].retryDelay.
     */
    private static final Pattern RETRY_DELAY_PATTERN = Pattern.compile("(\\d+)");

    private final RestTemplate restTemplate;
    private final GeminiRateLimiter rateLimiter;
    private final List<String> apiKeys;
    private final String model;
    private final int maxAttempts;
    private final long initialBackoffMs;
    private final long maxBackoffMs;

    private final ConcurrentHashMap<Integer, Long> keyCooldowns = new ConcurrentHashMap<>();
    private final AtomicInteger currentKeyIndex = new AtomicInteger(0);

    public GeminiClient(
            RestTemplate restTemplate,
            GeminiRateLimiter rateLimiter,
            @Value("${ai.gemini.api-keys:${GOOGLE_API_KEYS:${ai.gemini.api-key:${GOOGLE_API_KEY:}}}}") String rawApiKeys,
            @Value("${ai.gemini.model:gemini-flash-latest}") String model,
            @Value("${gemini.retry.max-attempts:2}") int maxAttempts,
            @Value("${gemini.retry.initial-backoff-ms:1000}") long initialBackoffMs,
            @Value("${gemini.retry.max-backoff-ms:10000}") long maxBackoffMs) {
        this.restTemplate = restTemplate;
        this.rateLimiter = rateLimiter;
        this.apiKeys = Arrays.stream((rawApiKeys == null ? "" : rawApiKeys).split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        this.model = model;
        this.maxAttempts = maxAttempts;
        this.initialBackoffMs = initialBackoffMs;
        this.maxBackoffMs = maxBackoffMs;
    }

    /** True when at least one non-empty API key has been configured. */
    public boolean isConfigured() {
        return !apiKeys.isEmpty();
    }

    public String model() {
        return model;
    }

    /**
     * Send a free-form prompt to Gemini and return the model's first text response.
     *
     * <p>Returns {@code null} on any of:
     * <ul>
     *   <li>Gemini is not configured (no API key)</li>
     *   <li>Rate-limit cooldown is currently active (global circuit breaker open)</li>
     *   <li>Rate limiter denied the slot (min-interval not elapsed)</li>
     *   <li>HTTP 429 received — cooldown is activated and null is returned</li>
     *   <li>Network failure or non-2xx after retries</li>
     *   <li>Response parse failure</li>
     * </ul>
     *
     * <p>Callers should treat null as a signal to fall back to heuristic processing.
     * HTTP 429 is never retried through this method; the rate limiter handles the cooldown.
     * Transient errors (5xx, network) are retried with exponential backoff up to
     * {@code gemini.retry.max-attempts} attempts.
     */
    public String generate(String prompt) {
        if (!isConfigured()) {
            return null;
        }

        // Fast-path: skip if cooldown is active
        if (rateLimiter.isOnCooldown()) {
            log.debug("[GeminiClient] Request skipped — cooldown active (retryAfterSeconds={})",
                    rateLimiter.cooldownRemainingSeconds());
            return null;
        }

        // Respect min-interval
        if (!rateLimiter.tryAcquire()) {
            log.debug("[GeminiClient] Request skipped — rate limiter denied slot");
            return null;
        }

        return executeWithRetry(prompt);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    /**
     * Finds the next available key index that is not in a per-key cooldown.
     * Returns -1 if all configured keys are currently on cooldown.
     */
    private int getNextAvailableKeyIndex() {
        if (apiKeys.isEmpty()) return -1;
        
        int n = apiKeys.size();
        long now = System.currentTimeMillis();
        
        for (int i = 0; i < n; i++) {
            int index = currentKeyIndex.getAndUpdate(current -> (current + 1) % n);
            Long cooldownExpiry = keyCooldowns.get(index);
            if (cooldownExpiry == null || cooldownExpiry <= now) {
                return index;
            }
        }
        return -1;
    }

    /**
     * Execute the Gemini HTTP call with exponential backoff for transient errors.
     * 429 errors switch the key and retry immediately. If all keys hit 429, it activates the global cooldown.
     */
    @SuppressWarnings("unchecked")
    private String executeWithRetry(String prompt) {

        while (true) {
            int keyIndex = getNextAvailableKeyIndex();
            if (keyIndex < 0) {
                log.warn("[GeminiClient] All configured API keys are in per-key cooldown. Activating global rate limiter.");
                rateLimiter.recordRateLimitHit(-1); // delegates duration to rateLimiter defaults
                return null;
            }

            String currentKey = apiKeys.get(keyIndex);
            
            boolean isGroq = currentKey.startsWith("gsk_");
            String url = isGroq 
                ? "https://api.groq.com/openai/v1/chat/completions" 
                : BASE_URL + "/" + model + ":generateContent?key=" + currentKey;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (isGroq) {
                headers.setBearerAuth(currentKey);
            }
            
            Map<String, Object> reqBody;
            if (isGroq) {
                reqBody = Map.of(
                    "model", "llama-3.1-70b-versatile",
                    "messages", List.of(Map.of("role", "user", "content", prompt)),
                    "temperature", 0.2,
                    "max_tokens", 1024
                );
            } else {
                reqBody = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    )),
                    "generationConfig", Map.of(
                            "temperature", 0.2,
                            "maxOutputTokens", 1024
                    )
                );
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

            long backoffMs = initialBackoffMs;
            boolean switchKey = false;
            
            for (int attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
                    return extractFirstText(resp.getBody(), isGroq);

                } catch (HttpClientErrorException ex) {
                    if (ex.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                        long retryDelaySecs = parseRetryDelay(ex.getResponseBodyAsString());
                        long cooldownDurationMs = (retryDelaySecs > 0 ? retryDelaySecs : 60) * 1000L;
                        log.warn("[GeminiClient] HTTP 429 received for key index {} — putting key in cooldown for {}s", 
                                keyIndex, cooldownDurationMs / 1000);
                        keyCooldowns.put(keyIndex, System.currentTimeMillis() + cooldownDurationMs);
                        switchKey = true;
                        break; // break inner loop to try next key
                    }
                    // Other 4xx (400, 403, etc.) — not transient, do not retry
                    log.warn("[GeminiClient] HTTP {} error (non-retriable) on key index {}: {}", ex.getStatusCode(), keyIndex, ex.getMessage());
                    return null;

                } catch (RestClientException ex) {
                    // Network / 5xx — potentially transient; retry with backoff
                    if (attempt >= maxAttempts) {
                        log.warn("[GeminiClient] Gemini request failed after {} attempts on key index {}: {}", maxAttempts, keyIndex, ex.getMessage());
                        return null;
                    }
                    log.warn("[GeminiClient] Gemini request failed (attempt {}/{}), retrying in {}ms: {}",
                            attempt, maxAttempts, backoffMs, ex.getMessage());
                    sleep(backoffMs);
                    backoffMs = Math.min(backoffMs * 2, maxBackoffMs);

                } catch (RuntimeException ex) {
                    log.warn("[GeminiClient] Unexpected error calling Gemini on key index {}: {}", keyIndex, ex.getMessage());
                    return null;
                }
            }
            
            // If inner loop exhausted without a 429, don't continue key rotation
            if (!switchKey) {
                return null;
            }
        }
    }

    /**
     * Parse Gemini's retryDelay from the 429 response body.
     * Gemini returns JSON like: {"error":{"details":[{"retryDelay":"47s"}]}}
     * Returns -1 if the value cannot be parsed safely.
     */
    @SuppressWarnings("unchecked")
    private long parseRetryDelay(String responseBody) {
        try {
            // Simple string-scan approach (avoids adding Jackson dependency here)
            if (responseBody == null || !responseBody.contains("retryDelay")) {
                return -1;
            }
            int idx = responseBody.indexOf("retryDelay");
            if (idx < 0) return -1;
            // Find the value after "retryDelay":"
            int start = responseBody.indexOf("\"", idx + "retryDelay".length() + 1);
            int end = responseBody.indexOf("\"", start + 1);
            if (start < 0 || end <= start) return -1;
            String value = responseBody.substring(start + 1, end).trim();
            Matcher m = RETRY_DELAY_PATTERN.matcher(value);
            if (m.find()) {
                return Long.parseLong(m.group(1));
            }
        } catch (Exception e) {
            log.debug("[GeminiClient] Could not parse retryDelay from 429 response: {}", e.getMessage());
        }
        return -1;
    }

    @SuppressWarnings("unchecked")
    private String extractFirstText(Map body, boolean isGroq) {
        if (body == null) return null;
        if (isGroq) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
            if (choices == null || choices.isEmpty()) return null;
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            if (message == null) return null;
            Object content = message.get("content");
            return content == null ? null : content.toString().trim();
        } else {
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

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}
