package com.newsplatform.news.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * AI provider backed by Google Gemini (default model {@code gemini-1.5-flash}).
 *
 * <p>The provider asks Gemini to return strict JSON, then parses the response
 * into the {@link AiProvider} contract. If anything goes wrong — network
 * failure, malformed JSON, non-JSON output — it throws a
 * {@link GeminiCallException} which the caller ({@link AiService}) catches to
 * fall back to the heuristic provider. The Gemini path therefore never
 * produces an article-processing failure.
 */
@Component
public class GeminiAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiProvider.class);

    private static final Pattern JSON_FENCE = Pattern.compile("(?s)```(?:json)?\\s*(\\{.*?\\})\\s*```");

    private final GeminiClient client;
    private final ObjectMapper mapper = new ObjectMapper();

    public GeminiAiProvider(GeminiClient client) {
        this.client = client;
    }

    @Override
    public boolean isEnabled() {
        return client != null && client.isConfigured();
    }

    @Override
    public String name() {
        return "gemini";
    }

    @Override
    public String summarize(String content) {
        if (content == null || content.isBlank()) return "";
        String prompt = """
            Summarize the following news article in 1-3 sentences.
            Keep it factual. Output ONLY the summary, no preamble, no labels.

            ARTICLE:
            %s
            """.formatted(truncate(content, 4000));
        String response = callOrThrow(prompt);
        return stripWrapping(response);
    }

    @Override
    public AiProvider.SentimentResult sentiment(String content) {
        if (content == null || content.isBlank()) {
            return new AiProvider.SentimentResult("Neutral", 0.0);
        }
        String prompt = """
            Analyze the sentiment of this news article. Respond with ONLY a
            JSON object of the form {"label":"Positive|Neutral|Negative","score":<-1..1>}.
            Score: -1 very negative, 0 neutral, +1 very positive.

            ARTICLE:
            %s
            """.formatted(truncate(content, 4000));

        String raw = callOrThrow(prompt);
        String json = extractJsonObject(raw);
        try {
            JsonNode node = mapper.readTree(json);
            String label = node.path("label").asText("Neutral");
            if (!isValidLabel(label)) label = "Neutral";
            double score = node.path("score").asDouble(0.0);
            if (score < -1.0) score = -1.0;
            if (score > 1.0) score = 1.0;
            return new AiProvider.SentimentResult(label, score);
        } catch (Exception ex) {
            throw new GeminiCallException("Sentiment JSON parse failed: " + ex.getMessage(), ex);
        }
    }

    @Override
    public List<String> keywords(String content, int maxKeywords) {
        if (content == null || content.isBlank()) return Collections.emptyList();
        String prompt = """
            Extract the %d most important keywords or short phrases from this
            news article. Respond with ONLY a JSON array of strings, lowercased,
            in order of importance. Example: ["inflation","central bank"].

            ARTICLE:
            %s
            """.formatted(maxKeywords, truncate(content, 4000));

        String raw = callOrThrow(prompt);
        String json = extractJsonArray(raw);
        try {
            JsonNode node = mapper.readTree(json);
            List<String> out = new ArrayList<>();
            if (node.isArray()) {
                for (JsonNode el : node) {
                    String v = el.asText("").trim().toLowerCase(Locale.ROOT);
                    if (!v.isEmpty()) out.add(v);
                    if (out.size() >= maxKeywords) break;
                }
            }
            return out;
        } catch (Exception ex) {
            throw new GeminiCallException("Keywords JSON parse failed: " + ex.getMessage(), ex);
        }
    }

    // ----- internals -----

    private String callOrThrow(String prompt) {
        String response = client.generate(prompt);
        if (response == null || response.isBlank()) {
            throw new GeminiCallException("Gemini returned empty response", null);
        }
        return response;
    }

    /**
     * Gemini occasionally wraps JSON in ```json ... ``` fences. Pull out the
     * first {...} block we can find.
     */
    private String extractJsonObject(String raw) {
        if (raw == null) return "{}";
        Matcher m = JSON_FENCE.matcher(raw);
        if (m.find()) return m.group(1);
        int open = raw.indexOf('{');
        int close = raw.lastIndexOf('}');
        if (open >= 0 && close > open) return raw.substring(open, close + 1);
        return raw.trim();
    }

    private String extractJsonArray(String raw) {
        if (raw == null) return "[]";
        int open = raw.indexOf('[');
        int close = raw.lastIndexOf(']');
        if (open >= 0 && close > open) return raw.substring(open, close + 1);
        return "[]";
    }

    private String stripWrapping(String raw) {
        if (raw == null) return "";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?", "")
                .replaceFirst("```$", "").trim();
        }
        return trimmed;
    }

    private static boolean isValidLabel(String label) {
        String l = label == null ? "" : label.toLowerCase(Locale.ROOT);
        return Arrays.asList("positive", "neutral", "negative").contains(l);
    }

    private static String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }

    /** Thrown by Gemini-bound methods to signal "fall back to heuristic". */
    public static class GeminiCallException extends RuntimeException {
        public GeminiCallException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
