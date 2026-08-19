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
 * AI provider backed by Google Gemini.
 *
 * <h3>Rate limiting</h3>
 * <p>All Gemini API calls flow through {@link GeminiClient#generate(String)}, which
 * checks the centralized {@link GeminiRateLimiter} before every request. This class
 * does <em>not</em> need to manage rate limiting itself.
 *
 * <h3>Combined-call optimisation</h3>
 * <p>Instead of 3 separate Gemini API calls (summarize, sentiment, keywords), this
 * provider issues a <em>single</em> structured prompt and parses the JSON response into
 * all three fields simultaneously. This reduces Gemini quota consumption by ~66%.
 *
 * <p>The legacy individual methods ({@link #summarize}, {@link #sentiment},
 * {@link #keywords}) are preserved for API compatibility and fall back to parsing
 * from the combined response when possible.
 *
 * <p>If anything goes wrong — network failure, malformed JSON, non-JSON output,
 * cooldown active — a {@link GeminiCallException} is thrown. The orchestrator
 * ({@link AiService}) catches this and falls back to {@link HeuristicAiProvider}.
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

    // ─── Combined analysis (primary method, single Gemini call) ──────────────

    /**
     * Perform summary + sentiment + keyword extraction in a SINGLE Gemini call.
     *
     * <p>Returns an {@link ArticleAnalysis} record, or throws {@link GeminiCallException}
     * on any failure so the caller can fall back to heuristics for all fields at once.
     *
     * @param content article text (will be truncated to 4000 chars if necessary)
     * @param maxKeywords maximum number of keywords to request
     */
    public ArticleAnalysis analyzeArticle(String content, int maxKeywords) {
        if (content == null || content.isBlank()) {
            throw new GeminiCallException("Empty content supplied to analyzeArticle", null);
        }

        String prompt = """
            Analyze the following news article and respond with ONLY a single JSON object.
            The JSON must have exactly these fields:
              "summary"   : string — 1-3 sentence factual summary (no preamble)
              "sentiment" : object — { "label": "Positive"|"Neutral"|"Negative", "score": <number -1..1> }
              "keywords"  : array  — up to %d lowercase strings in order of importance

            Example output:
            {"summary":"The Fed raised interest rates by 0.25 percent.","sentiment":{"label":"Neutral","score":0.1},"keywords":["interest rates","federal reserve","monetary policy"]}

            ARTICLE:
            %s
            """.formatted(maxKeywords, truncate(content, 4000));

        String raw = callOrThrow(prompt);
        String json = extractJsonObject(raw);

        try {
            JsonNode node = mapper.readTree(json);

            // --- summary ---
            String summary = node.path("summary").asText("").trim();

            // --- sentiment ---
            JsonNode sentimentNode = node.path("sentiment");
            String label = sentimentNode.path("label").asText("Neutral");
            if (!isValidLabel(label)) label = "Neutral";
            double score = sentimentNode.path("score").asDouble(0.0);
            score = Math.max(-1.0, Math.min(1.0, score));
            AiProvider.SentimentResult sentimentResult = new AiProvider.SentimentResult(label, score);

            // --- keywords ---
            JsonNode kwNode = node.path("keywords");
            List<String> keywords = new ArrayList<>();
            if (kwNode.isArray()) {
                for (JsonNode el : kwNode) {
                    String v = el.asText("").trim().toLowerCase(Locale.ROOT);
                    if (!v.isEmpty()) keywords.add(v);
                    if (keywords.size() >= maxKeywords) break;
                }
            }

            return new ArticleAnalysis(summary, sentimentResult, keywords);

        } catch (Exception ex) {
            throw new GeminiCallException("Combined analysis JSON parse failed: " + ex.getMessage(), ex);
        }
    }

    /**
     * Immutable result from {@link #analyzeArticle(String, int)}.
     */
    public record ArticleAnalysis(
            String summary,
            AiProvider.SentimentResult sentiment,
            List<String> keywords) {
    }

    public record ConflictResult(String claim, String sourceUrl) {}

    public record CorroborationAnalysis(
            int score,
            int independentSources,
            String status,
            List<ConflictResult> conflicts) {}

    public CorroborationAnalysis verifyCorroboration(String originalContent, List<com.newsplatform.news.dto.NormalizedArticle> externalArticles) {
        if (externalArticles == null || externalArticles.isEmpty()) {
             return new CorroborationAnalysis(0, 0, "SINGLE_SOURCE", Collections.emptyList());
        }

        StringBuilder sourcesText = new StringBuilder();
        for (int i = 0; i < externalArticles.size(); i++) {
            sourcesText.append(String.format("[Source %d URL: %s]\nTitle: %s\nContent: %s\n\n", 
                i, externalArticles.get(i).getUrl(), externalArticles.get(i).getTitle(), truncate(externalArticles.get(i).getContent(), 1000)));
        }

        String prompt = """
            You are a rigorous journalistic fact-checker. Compare the PRIMARY ARTICLE to the EXTERNAL SOURCES.
            Determine if the external sources independently corroborate the claims in the primary article, or if there are conflicts.
            Respond with ONLY a single JSON object. The JSON must have exactly these fields:
              "score": integer 0-100 (100 = full agreement, 0 = complete conflict)
              "independentSources": integer (number of sources that actually agree)
              "status": string ("STRONGLY_CORROBORATED", "PARTIALLY_CORROBORATED", "CONFLICTING_REPORTS", "INSUFFICIENT_EVIDENCE")
              "conflicts": array of objects { "claim": "description of conflict", "sourceUrl": "URL of conflicting source" }

            PRIMARY ARTICLE:
            %s

            EXTERNAL SOURCES:
            %s
            """.formatted(truncate(originalContent, 3000), truncate(sourcesText.toString(), 8000));

        String raw = callOrThrow(prompt);
        String json = extractJsonObject(raw);

        try {
            JsonNode node = mapper.readTree(json);
            int score = node.path("score").asInt(0);
            int independentSources = node.path("independentSources").asInt(0);
            String status = node.path("status").asText("INSUFFICIENT_EVIDENCE");
            
            List<ConflictResult> conflicts = new ArrayList<>();
            JsonNode conflictsNode = node.path("conflicts");
            if (conflictsNode.isArray()) {
                for (JsonNode c : conflictsNode) {
                    conflicts.add(new ConflictResult(c.path("claim").asText(""), c.path("sourceUrl").asText("")));
                }
            }
            return new CorroborationAnalysis(score, independentSources, status, conflicts);
        } catch (Exception ex) {
            log.error("Corroboration analysis JSON parse failed: " + ex.getMessage());
            return new CorroborationAnalysis(0, 0, "INSUFFICIENT_EVIDENCE", Collections.emptyList());
        }
    }

    // ─── Legacy single-operation methods (preserved for API compatibility) ───

    @Override
    public String summarize(String content) {
        if (content == null || content.isBlank()) return "";
        // Reuse combined call so we don't burn a separate Gemini request
        ArticleAnalysis analysis = analyzeArticle(content, 5);
        return analysis.summary();
    }

    @Override
    public AiProvider.SentimentResult sentiment(String content) {
        if (content == null || content.isBlank()) {
            return new AiProvider.SentimentResult("Neutral", 0.0);
        }
        ArticleAnalysis analysis = analyzeArticle(content, 5);
        return analysis.sentiment();
    }

    @Override
    public List<String> keywords(String content, int maxKeywords) {
        if (content == null || content.isBlank()) return Collections.emptyList();
        ArticleAnalysis analysis = analyzeArticle(content, maxKeywords);
        return analysis.keywords();
    }

    // ─── Internals ───────────────────────────────────────────────────────────

    private String callOrThrow(String prompt) {
        String response = client.generate(prompt);
        if (response == null || response.isBlank()) {
            throw new GeminiCallException("Gemini returned empty/null response (rate-limited or unavailable)", null);
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
