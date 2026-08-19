package com.newsplatform.news.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Orchestrator over {@link AiProvider}s. Tries the primary provider (Gemini
 * when configured), and falls back to {@link HeuristicAiProvider} on any
 * failure so an LLM outage can never block article processing.
 *
 * <h3>Combined analysis (recommended)</h3>
 * <p>Use {@link #analyzeArticle(String)} to perform summary + sentiment + keyword
 * extraction in a <em>single</em> Gemini API call. This is the primary entry point
 * used by {@link ArticleAiProcessingService} and drastically reduces Gemini quota
 * consumption.
 *
 * <h3>Individual methods (legacy)</h3>
 * <p>The individual {@link #generateSummary}, {@link #analyzeSentiment},
 * {@link #extractKeywords} methods are preserved for binary/source compatibility
 * with pre-combined-call callers and tests. They remain synchronous; callers that
 * need background work use {@code @Async} on the entry point.
 */
@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final GeminiAiProvider gemini;
    private final HeuristicAiProvider heuristic;
    private final GeminiRateLimiter rateLimiter;

    public AiService(GeminiAiProvider gemini, HeuristicAiProvider heuristic, GeminiRateLimiter rateLimiter) {
        this.gemini = gemini;
        this.heuristic = heuristic;
        this.rateLimiter = rateLimiter;
    }

    // ─── Combined analysis (single Gemini call) ───────────────────────────────

    /**
     * Perform full AI analysis of an article in a single Gemini call.
     *
     * <p>If Gemini is not configured, is on cooldown, or the call fails for any
     * reason, all three fields are populated using the heuristic provider.
     *
     * @param content the article content to analyze
     * @return a non-null {@link ArticleAnalysisResult}; never throws
     */
    public ArticleAnalysisResult analyzeArticle(String content) {
        if (gemini != null && gemini.isEnabled()) {

            // Fast-path: skip Gemini entirely during cooldown
            if (rateLimiter.isOnCooldown()) {
                log.info("[AiService] AI fallback activated: operation=COMBINED_ANALYSIS provider=HEURISTIC " +
                        "reason=GEMINI_RATE_LIMITED retryAfterSeconds={}", rateLimiter.cooldownRemainingSeconds());
                return analyzeWithHeuristic(content);
            }

            try {
                GeminiAiProvider.ArticleAnalysis ga = gemini.analyzeArticle(content, 5);
                String summary = ga.summary() != null && !ga.summary().isBlank() ? ga.summary() : null;
                if (summary == null) {
                    // Summary empty — Gemini returned partial result, fall back to heuristic for that field
                    log.warn("[AiService] Gemini combined analysis returned empty summary — using heuristic summary");
                    summary = heuristic.summarize(content);
                }
                List<String> keywords = ga.keywords() != null && !ga.keywords().isEmpty()
                        ? ga.keywords()
                        : heuristic.keywords(content, 5);
                return new ArticleAnalysisResult(
                        summary,
                        convertSentiment(ga.sentiment()),
                        keywords,
                        "gemini");
            } catch (RuntimeException ex) {
                if (rateLimiter.isOnCooldown()) {
                    log.info("[AiService] AI fallback activated: operation=COMBINED_ANALYSIS provider=HEURISTIC " +
                            "reason=GEMINI_RATE_LIMITED retryAfterSeconds={}", rateLimiter.cooldownRemainingSeconds());
                } else {
                    log.warn("[AiService] Gemini combined analysis failed ({}), falling back to heuristic", ex.getMessage());
                }
            }
        }
        return analyzeWithHeuristic(content);
    }

    private ArticleAnalysisResult analyzeWithHeuristic(String content) {
        String summary = heuristic.summarize(content);
        SentimentResult sentiment = convertSentiment(heuristic.sentiment(content));
        List<String> keywords = heuristic.keywords(content, 5);
        return new ArticleAnalysisResult(summary, sentiment, keywords, "heuristic");
    }

    // ─── Legacy individual methods (kept for API compatibility) ──────────────

    public String generateSummary(String content) {
        return run("summary", () -> gemini.summarize(content), () -> heuristic.summarize(content));
    }

    public SentimentResult analyzeSentiment(String content) {
        SentimentResult out = run(
                "sentiment",
                () -> convertSentiment(gemini.sentiment(content)),
                () -> convertSentiment(heuristic.sentiment(content))
        );
        if (out == null) {
            return new SentimentResult("Neutral", 0.0);
        }
        return out;
    }

    public List<String> extractKeywords(String content) {
        List<String> out = run("keywords", () -> gemini.keywords(content, 5), () -> heuristic.keywords(content, 5));
        return out == null ? Collections.emptyList() : out;
    }

    /**
     * Tags stay heuristic per design — no LLM needed for them. Keeping this
     * method here preserves the API for existing callers.
     */
    public List<String> generateTags(String title, String content) {
        return heuristic.tags(title, content);
    }

    public GeminiAiProvider.CorroborationAnalysis verifyCorroboration(String content, List<com.newsplatform.news.dto.NormalizedArticle> externalArticles) {
        if (gemini != null && gemini.isEnabled()) {
            if (rateLimiter.isOnCooldown()) {
                throw new RuntimeException("GEMINI_RATE_LIMITED");
            }
            try {
                return gemini.verifyCorroboration(content, externalArticles);
            } catch (RuntimeException ex) {
                if (rateLimiter.isOnCooldown() || (ex.getMessage() != null && (ex.getMessage().contains("429") || ex.getMessage().contains("503")))) {
                    throw new RuntimeException("GEMINI_RATE_LIMITED", ex);
                } else {
                    log.warn("[AiService] Gemini VERIFICATION failed ({}), falling back to heuristic", ex.getMessage());
                }
            }
        }
        return new GeminiAiProvider.CorroborationAnalysis(0, 0, "INSUFFICIENT_EVIDENCE", Collections.emptyList());
    }

    /** True when the primary (Gemini) provider is wired up and able to serve. */
    public boolean isGeminiEnabled() {
        return gemini != null && gemini.isEnabled();
    }

    /** True when Gemini is enabled and NOT currently on a rate-limit cooldown. */
    public boolean isGeminiAvailable() {
        return isGeminiEnabled() && !rateLimiter.isOnCooldown();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private <T> T run(String op, ProviderSupplier<T> primary, ProviderSupplier<T> fallback) {
        if (gemini != null && gemini.isEnabled()) {
            if (rateLimiter.isOnCooldown()) {
                log.info("[AiService] AI fallback activated: operation={} provider=HEURISTIC reason=GEMINI_RATE_LIMITED", op);
                return fallback.get();
            }
            try {
                T result = primary.get();
                if (result != null) return result;
                log.warn("[AiService] Gemini {} returned null, falling back to heuristic", op);
            } catch (RuntimeException ex) {
                if (rateLimiter.isOnCooldown()) {
                    log.info("[AiService] AI fallback activated: operation={} provider=HEURISTIC reason=GEMINI_RATE_LIMITED", op);
                } else {
                    log.warn("[AiService] Gemini {} failed ({}), falling back to heuristic", op, ex.getMessage());
                }
            }
        }
        return fallback.get();
    }

    private static SentimentResult convertSentiment(AiProvider.SentimentResult r) {
        if (r == null) return null;
        return new SentimentResult(r.sentiment(), r.score());
    }

    @FunctionalInterface
    private interface ProviderSupplier<T> {
        T get();
    }

    // ─── Result types ─────────────────────────────────────────────────────────

    /**
     * Combined result from {@link #analyzeArticle(String)}.
     * Carries summary, sentiment, keywords, and the provider that was used.
     */
    public static class ArticleAnalysisResult {
        public final String summary;
        public final SentimentResult sentiment;
        public final List<String> keywords;
        /** "gemini" or "heuristic" — indicates which provider produced this result. */
        public final String provider;

        public ArticleAnalysisResult(String summary, SentimentResult sentiment,
                                     List<String> keywords, String provider) {
            this.summary = summary;
            this.sentiment = sentiment;
            this.keywords = keywords != null ? keywords : Collections.emptyList();
            this.provider = provider;
        }
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
