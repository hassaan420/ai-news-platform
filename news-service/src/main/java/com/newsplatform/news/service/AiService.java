package com.newsplatform.news.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Orchestrator over {@link AiProvider}s. Tries the primary provider (Gemini
 * when configured), and falls back to {@link HeuristicAiProvider} on any
 * failure so an LLM outage can never block article processing.
 *
 * <p>Public API is deliberately unchanged from the pre-Gemini era so callers
 * and tests compile unchanged. Methods remain synchronous; callers that
 * need background work use {@code @Async} on the entry point.
 */
@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final GeminiAiProvider gemini;
    private final HeuristicAiProvider heuristic;

    public AiService(GeminiAiProvider gemini, HeuristicAiProvider heuristic) {
        this.gemini = gemini;
        this.heuristic = heuristic;
    }

    public String generateSummary(String content) {
        return run("summary", () -> gemini.summarize(content), () -> heuristic.summarize(content));
    }

    public SentimentResult analyzeSentiment(String content) {
        SentimentResult out = run(
            "sentiment",
            () -> convert(gemini.sentiment(content)),
            () -> convert(heuristic.sentiment(content))
        );
        if (out == null) {
            return new SentimentResult("Neutral", 0.0);
        }
        return out;
    }

    public List<String> extractKeywords(String content) {
        List<String> out = run("keywords", () -> gemini.keywords(content, 5), () -> heuristic.keywords(content, 5));
        return out == null ? java.util.Collections.emptyList() : out;
    }

    /**
     * Tags stay heuristic per design — no LLM needed for them. Keeping this
     * method here preserves the API for existing callers.
     */
    public List<String> generateTags(String title, String content) {
        return heuristic.tags(title, content);
    }

    /** True when the primary (Gemini) provider is wired up and able to serve. */
    public boolean isGeminiEnabled() {
        return gemini != null && gemini.isEnabled();
    }

    // ----- helpers -----

    private <T> T run(String op, ProviderSupplier<T> primary, ProviderSupplier<T> fallback) {
        if (gemini != null && gemini.isEnabled()) {
            try {
                T result = primary.get();
                if (result != null) return result;
                log.warn("Gemini {} returned null, falling back to heuristic", op);
            } catch (RuntimeException ex) {
                log.warn("Gemini {} failed ({}), falling back to heuristic", op, ex.getMessage());
            }
        }
        return fallback.get();
    }

    /** Convert the new {@link AiProvider.SentimentResult} to the legacy shape used by callers/tests. */
    private static SentimentResult convert(AiProvider.SentimentResult r) {
        if (r == null) return null;
        return new SentimentResult(r.sentiment(), r.score());
    }

    @FunctionalInterface
    private interface ProviderSupplier<T> {
        T get();
    }

    /** Legacy record kept for binary/source-compat with pre-Gemini callers. */
    public static class SentimentResult {
        public String sentiment;
        public Double score;

        public SentimentResult() {}

        public SentimentResult(String sentiment, Double score) {
            this.sentiment = sentiment;
            this.score = score;
        }
    }
}
