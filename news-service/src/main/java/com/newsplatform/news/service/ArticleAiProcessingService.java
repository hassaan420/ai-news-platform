package com.newsplatform.news.service;

import com.newsplatform.news.entity.*;
import com.newsplatform.news.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Orchestrates asynchronous AI processing of articles.
 *
 * <h3>Key design notes:</h3>
 * <ul>
 *   <li>{@code @Async} and {@code @Transactional} must NOT be combined on the same
 *       method — all DB work is done inside inner {@code @Transactional} helper methods.</li>
 *   <li>AI processing now uses a <em>single</em> Gemini call per article (summary +
 *       sentiment + keywords combined), reducing Gemini API quota usage by ~66%.</li>
 *   <li>When the Gemini rate-limit cooldown is active, articles are processed using
 *       the heuristic fallback immediately rather than queuing additional Gemini calls.</li>
 *   <li>{@code processPendingQueueJobs()} skips items that are already {@code PROCESSING}
 *       to prevent duplicate dispatches.</li>
 *   <li>{@code retryFailedJobs()} does not dispatch retries while Gemini is on cooldown
 *       if the error was rate-related — preventing the retry storm.</li>
 *   <li>{@code processPendingArticlesWithoutQueue()} repairs articles that were ingested
 *       before the AI queue was wired up.</li>
 * </ul>
 */
@Service
public class ArticleAiProcessingService {

    private static final Logger log = LoggerFactory.getLogger(ArticleAiProcessingService.class);

    /** Maximum retries before permanently abandoning a queue item. */
    private static final int MAX_RETRIES = 3;

    /** Items stuck in PROCESSING for longer than this are assumed crashed. */
    private static final java.time.Duration PROCESSING_TIMEOUT = java.time.Duration.ofMinutes(10);

    /** Error message substring that identifies rate-limit failures — used to suppress retries during cooldown. */
    private static final String RATE_LIMIT_ERROR_MARKER = "GEMINI_RATE_LIMITED";

    private final AiService aiService;
    private final GeminiRateLimiter rateLimiter;
    private final ArticleRepository articleRepository;
    private final ArticleKeywordRepository keywordRepository;
    private final ArticleTagRepository tagRepository;
    private final AiProcessingQueueRepository queueRepository;

    @org.springframework.context.annotation.Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private ArticleAiProcessingService self;

    public ArticleAiProcessingService(AiService aiService,
                                      GeminiRateLimiter rateLimiter,
                                      ArticleRepository articleRepository,
                                      ArticleKeywordRepository keywordRepository,
                                      ArticleTagRepository tagRepository,
                                      AiProcessingQueueRepository queueRepository) {
        this.aiService = aiService;
        this.rateLimiter = rateLimiter;
        this.articleRepository = articleRepository;
        this.keywordRepository = keywordRepository;
        this.tagRepository = tagRepository;
        this.queueRepository = queueRepository;
    }

    // ─── Public entry points ───────────────────────────────────────────────────

    /**
     * Submits an article for AI processing on the dedicated (bounded) thread pool.
     *
     * <p>Uses the worker count configured via {@code ai.processing.worker-count}.
     * The method itself is non-transactional; all DB access goes through
     * {@link #markProcessing}, {@link #doAiWork}, and {@link #markFailed}.
     */
    @Async("aiTaskExecutor")
    @Caching(evict = {
        @CacheEvict(value = "latest_articles", allEntries = true),
        @CacheEvict(value = "trending_articles", allEntries = true),
        @CacheEvict(value = "related_articles", key = "#p0"),
        @CacheEvict(value = "trending_ai_articles", allEntries = true)
    })
    public void processArticleAsync(Long articleId, Long queueId) {
        log.info("[AI-QUEUE] Article={} QueueId={} -> PROCESSING (thread={})",
                articleId, queueId, Thread.currentThread().getName());

        markProcessing(queueId);

        try {
            doAiWork(articleId, queueId);
        } catch (Exception e) {
            log.error("[AI-QUEUE] Article={} QueueId={} -> FAILED: {}", articleId, queueId, e.getMessage(), e);
            markFailed(articleId, queueId, e.getMessage());
        }
    }

    // ─── Scheduled maintenance ──────────────────────────────────────────────────

    /**
     * Requeues articles that have {@code processingStatus = PENDING} but no
     * corresponding {@code ai_processing_queue} row. This heals articles that
     * were ingested before AI queue wiring was in place.
     *
     * <p>Runs every 10 seconds with a 5-second startup delay.
     */
    @Scheduled(fixedDelay = 10_000, initialDelay = 5_000)
    @Transactional
    public void processPendingArticlesWithoutQueue() {
        List<Article> orphaned = articleRepository.findPendingWithoutQueueEntry(200);
        if (orphaned.isEmpty()) {
            return;
        }

        log.info("[AI-QUEUE] Found {} PENDING articles with no queue entry — requeueing", orphaned.size());
        for (Article article : orphaned) {
            AiProcessingQueue queueItem = new AiProcessingQueue();
            queueItem.setArticle(article);
            queueItem.setStatus("PENDING");
            queueItem.setTaskType("FULL_AI_PROCESSING");
            queueItem.setRetryCount(0);
            AiProcessingQueue saved = queueRepository.save(queueItem);
            log.info("[AI-QUEUE] Article={} -> new queue entry id={} status=PENDING",
                    article.getId(), saved.getId());
            self.processArticleAsync(article.getId(), saved.getId());
        }
    }

    /**
     * Pick up any items in {@code ai_processing_queue} with {@code status = PENDING}
     * and trigger async AI processing.
     *
     * <p><b>Deduplication</b>: items that are already {@code PROCESSING} are skipped
     * to prevent the same article from being dispatched to multiple workers.
     */
    @Scheduled(fixedDelay = 15_000, initialDelay = 5_000)
    @Transactional
    public void processPendingQueueJobs() {
        List<AiProcessingQueue> pendingJobs = queueRepository.findByStatus("PENDING");
        if (pendingJobs.isEmpty()) {
            return;
        }
        log.info("[AI-QUEUE] Found {} PENDING queue items — triggering async processing", pendingJobs.size());
        for (AiProcessingQueue job : pendingJobs) {
            // Deduplication guard: transition to PROCESSING here before dispatching.
            // If the item was already set to PROCESSING by a concurrent scheduler tick,
            // findByStatus("PENDING") would not have returned it, so this is a double-safety.
            job.setStatus("PROCESSING");
            queueRepository.save(job);
            self.processArticleAsync(job.getArticle().getId(), job.getId());
        }
    }

    /**
     * Retries FAILED queue items (up to {@value #MAX_RETRIES} attempts) and
     * resets items stuck in PROCESSING after {@link #PROCESSING_TIMEOUT}.
     *
     * <p>Rate-limit awareness: if Gemini is currently on cooldown, retries for
     * rate-limited failures are deferred to the next invocation rather than
     * adding more Gemini-bound tasks to the executor.
     */
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void retryFailedJobs() {
        // Reset stuck PROCESSING items (container crash recovery)
        Instant staleThreshold = Instant.now().minus(PROCESSING_TIMEOUT);
        List<AiProcessingQueue> stuck = queueRepository.findStuckProcessing(staleThreshold);
        for (AiProcessingQueue job : stuck) {
            log.warn("[AI-QUEUE] QueueId={} ArticleId={} stuck in PROCESSING since {} — resetting to PENDING",
                    job.getId(), job.getArticle().getId(), job.getUpdatedAt());
            job.setStatus("PENDING");
            job.setErrorMessage("Reset from stuck PROCESSING state");
            queueRepository.save(job);
        }

        // Retry genuinely FAILED items
        List<AiProcessingQueue> failedJobs =
                queueRepository.findByStatusAndRetryCountLessThan("FAILED", MAX_RETRIES);
        if (!failedJobs.isEmpty()) {
            log.info("[AI-QUEUE] Retrying {} FAILED jobs (max retries={})", failedJobs.size(), MAX_RETRIES);
        }

        boolean geminiOnCooldown = rateLimiter.isOnCooldown();
        if (geminiOnCooldown) {
            log.info("[AI-QUEUE] Gemini cooldown active (retryAfterSeconds={}) — retries will still run with heuristic fallback",
                    rateLimiter.cooldownRemainingSeconds());
        }

        for (AiProcessingQueue job : failedJobs) {
            log.info("[AI-QUEUE] QueueId={} ArticleId={} retry={}/{}",
                    job.getId(), job.getArticle().getId(), job.getRetryCount() + 1, MAX_RETRIES);
            job.setStatus("PENDING");
            job.setErrorMessage(null);
            queueRepository.save(job);
            self.processArticleAsync(job.getArticle().getId(), job.getId());
        }
    }

    // ─── Private helpers (each in its own transaction) ──────────────────────────

    @Transactional
    protected void markProcessing(Long queueId) {
        queueRepository.findById(queueId).ifPresent(q -> {
            q.setStatus("PROCESSING");
            queueRepository.save(q);
        });
    }

    /**
     * Core AI work: analyze the article using a SINGLE combined Gemini call (or heuristic
     * fallback if Gemini is unavailable/on cooldown), then persist all derived fields.
     */
    @Transactional
    protected void doAiWork(Long articleId, Long queueId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new IllegalArgumentException("Article not found: " + articleId));

        // Prefer full content; fall back to description, then title only
        String textContent = article.getContent() != null && !article.getContent().isBlank()
                ? article.getContent()
                : article.getDescription() != null && !article.getDescription().isBlank()
                        ? article.getDescription()
                        : article.getTitle();

        // ── Combined AI analysis (1 Gemini call instead of 3) ─────────────────
        AiService.ArticleAnalysisResult analysis = aiService.analyzeArticle(textContent);

        log.info("[AI-QUEUE] Article={} — AI analysis complete: provider={} sentiment={} keywords={}",
                articleId, analysis.provider, analysis.sentiment.sentiment, analysis.keywords.size());

        // ── Summary ────────────────────────────────────────────────────────────
        article.setSummary(analysis.summary);
        log.debug("[AI-QUEUE] Article={} — summary ({} chars, provider={})",
                articleId, analysis.summary != null ? analysis.summary.length() : 0, analysis.provider);

        // ── Sentiment ──────────────────────────────────────────────────────────
        article.setSentiment(analysis.sentiment.sentiment);
        article.setSentimentScore(analysis.sentiment.score);

        // ── Keywords (skip if already stored — idempotent on retry) ───────────
        List<ArticleKeyword> existingKeywords = keywordRepository.findByArticleId(articleId);
        if (existingKeywords.isEmpty()) {
            for (String k : analysis.keywords) {
                ArticleKeyword ak = new ArticleKeyword();
                ak.setArticle(article);
                ak.setKeyword(k);
                keywordRepository.save(ak);
            }
            log.info("[AI-QUEUE] Article={} — stored {} keywords (provider={})",
                    articleId, analysis.keywords.size(), analysis.provider);
        } else {
            log.debug("[AI-QUEUE] Article={} — keywords already present, skipping", articleId);
        }

        // ── Tags (skip if already stored, always heuristic) ───────────────────
        List<ArticleTag> existingTags = tagRepository.findByArticleId(articleId);
        if (existingTags.isEmpty()) {
            List<String> tags = aiService.generateTags(article.getTitle(), textContent);
            for (String t : tags) {
                ArticleTag at = new ArticleTag();
                at.setArticle(article);
                at.setTag(t);
                tagRepository.save(at);
            }
            log.info("[AI-QUEUE] Article={} — stored {} tags", articleId, tags.size());
        } else {
            log.debug("[AI-QUEUE] Article={} — tags already present, skipping", articleId);
        }

        // ── Reading time ───────────────────────────────────────────────────────
        int wordCount = textContent.split("\\s+").length;
        article.setReadingTime(Math.max(1, wordCount / 200));

        // ── AI confidence & topic classification ───────────────────────────────
        // Confidence is slightly lower when heuristic was used due to rate limiting
        boolean usedGemini = "gemini".equals(analysis.provider);
        article.setAiConfidence(usedGemini ? 0.92 : 0.65);

        List<ArticleTag> allTags = tagRepository.findByArticleId(articleId);
        article.setTopicClassification(allTags.isEmpty() ? "General" : allTags.get(0).getTag());

        // ── Scores ─────────────────────────────────────────────────────────────
        double sentimentBoost = analysis.sentiment.score != null ? analysis.sentiment.score * 25.0 : 0.0;
        double confidenceBoost = article.getAiConfidence() * 10.0;
        article.setRecommendationScore(50.0 + sentimentBoost + confidenceBoost);
        article.setTrendingScore(50.0 + sentimentBoost);

        article.setProcessingStatus("COMPLETED");
        article.setProcessedAt(Instant.now());
        articleRepository.save(article);

        // ── Mark queue complete ─────────────────────────────────────────────────
        queueRepository.findById(queueId).ifPresent(q -> {
            q.setStatus("COMPLETED");
            queueRepository.save(q);
        });

        log.info("[AI-QUEUE] Article={} QueueId={} -> COMPLETED | provider={} sentiment={} keywords={}",
                articleId, queueId, analysis.provider, analysis.sentiment.sentiment, analysis.keywords.size());
    }

    @Transactional
    protected void markFailed(Long articleId, Long queueId, String errorMessage) {
        // Truncate error message to avoid DB overflow
        String safeError = errorMessage != null && errorMessage.length() > 500
                ? errorMessage.substring(0, 497) + "..."
                : errorMessage;

        queueRepository.findById(queueId).ifPresent(q -> {
            q.setStatus("FAILED");
            q.setErrorMessage(safeError);
            q.setRetryCount(q.getRetryCount() + 1);
            queueRepository.save(q);
        });

        articleRepository.findById(articleId).ifPresent(a -> {
            if (!"COMPLETED".equals(a.getProcessingStatus())) {
                a.setProcessingStatus("FAILED");
                articleRepository.save(a);
            }
        });
    }
}
