package com.newsplatform.news.service;

import java.util.List;

/**
 * Pluggable AI capability surface for article enrichment.
 *
 * <p>Implemented by {@link HeuristicAiProvider} (always-on, no network) and
 * {@link GeminiAiProvider} (calls Google Gemini when configured).
 *
 * <p>The orchestrator ({@link AiService}) tries the configured provider(s) and
 * falls back to heuristics on failure so article processing never crashes on
 * an AI outage.
 */
public interface AiProvider {

    /** True when this provider is configured and able to serve requests. */
    boolean isEnabled();

    /** Human-readable name for logging / admin UI. */
    String name();

    /**
     * Generate a 1-3 sentence summary of the given content.
     * Implementations MUST return a non-null string; empty input -> empty output.
     */
    String summarize(String content);

    /**
     * Classify sentiment. MUST return a label in {Positive, Neutral, Negative}
     * and a score in [-1.0, 1.0].
     */
    SentimentResult sentiment(String content);

    /**
     * Extract up to {@code maxKeywords} salient keywords/phrases.
     * MAY return fewer if the content is short; MUST NOT return null.
     */
    List<String> keywords(String content, int maxKeywords);

    /** Immutable sentiment label + signed score in [-1.0, 1.0]. */
    record SentimentResult(String sentiment, Double score) {}
}
