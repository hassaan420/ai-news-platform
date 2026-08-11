package com.newsplatform.news.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Centralized, thread-safe rate limiter and circuit breaker for all Gemini API calls.
 *
 * <p>All AI threads share this single bean. It enforces two independent protections:
 *
 * <ol>
 *   <li><b>Min-interval enforcement</b> — no two Gemini requests can be sent closer
 *       than {@code minIntervalMs} apart. Callers that arrive too early receive {@code false}
 *       from {@link #tryAcquire()} and should fall back to heuristics or defer.</li>
 *   <li><b>Global cooldown (circuit breaker)</b> — when {@link #recordRateLimitHit(long)} is
 *       called (e.g., after HTTP 429), all subsequent {@link #tryAcquire()} calls return
 *       {@code false} until the cooldown expires. This prevents the retry storm that occurs
 *       when multiple AI threads simultaneously hammer Gemini after quota exhaustion.</li>
 * </ol>
 *
 * <p>Configuration (all environment-overridable):
 * <pre>
 *   gemini.rate-limit.enabled=true
 *   gemini.rate-limit.min-interval-ms=6000
 *   gemini.rate-limit.cooldown-seconds=60
 *   gemini.rate-limit.max-cooldown-seconds=300
 * </pre>
 */
@Component
public class GeminiRateLimiter {

    private static final Logger log = LoggerFactory.getLogger(GeminiRateLimiter.class);

    private final boolean enabled;
    private final long minIntervalMs;
    private final long defaultCooldownSeconds;
    private final long maxCooldownSeconds;

    /** Epoch-millis of the last successful acquire. */
    private final AtomicLong lastAcquireMs = new AtomicLong(0L);

    /** Epoch-millis when the cooldown expires (0 = no cooldown active). */
    private final AtomicLong cooldownExpiresMs = new AtomicLong(0L);

    /** Reason for the current cooldown (for logging). */
    private final AtomicReference<String> cooldownReason = new AtomicReference<>("");

    /** Counts how many requests were skipped during the current cooldown (throttled logging). */
    private final AtomicLong skippedDuringCooldown = new AtomicLong(0L);

    public GeminiRateLimiter(
            @Value("${gemini.rate-limit.enabled:true}") boolean enabled,
            @Value("${gemini.rate-limit.min-interval-ms:6000}") long minIntervalMs,
            @Value("${gemini.rate-limit.cooldown-seconds:60}") long defaultCooldownSeconds,
            @Value("${gemini.rate-limit.max-cooldown-seconds:300}") long maxCooldownSeconds) {
        this.enabled = enabled;
        this.minIntervalMs = minIntervalMs;
        this.defaultCooldownSeconds = defaultCooldownSeconds;
        this.maxCooldownSeconds = maxCooldownSeconds;
        log.info("[GeminiRateLimiter] Initialized: enabled={} minIntervalMs={} cooldownSeconds={} maxCooldownSeconds={}",
                enabled, minIntervalMs, defaultCooldownSeconds, maxCooldownSeconds);
    }

    /**
     * Attempt to acquire a Gemini request slot.
     *
     * <p>Returns {@code true} if the caller may proceed with a Gemini API call.
     * Returns {@code false} if:
     * <ul>
     *   <li>Rate limiting is disabled (always returns {@code true} when disabled)</li>
     *   <li>A global cooldown is currently active (429 was recently received)</li>
     *   <li>The minimum inter-request interval has not elapsed since the last acquire</li>
     * </ul>
     *
     * <p>This method is <em>non-blocking</em>. Callers that receive {@code false} should
     * immediately fall back to heuristic processing rather than spinning or sleeping.
     */
    public synchronized boolean tryAcquire() {
        if (!enabled) {
            return true;
        }

        // --- Check global cooldown (circuit breaker) ---
        long now = System.currentTimeMillis();
        long cooldownExpiry = cooldownExpiresMs.get();
        if (cooldownExpiry > now) {
            long remaining = (cooldownExpiry - now) / 1000;
            long skipped = skippedDuringCooldown.incrementAndGet();
            // Throttle log noise: log only on first skip and every 10th skip after
            if (skipped == 1 || skipped % 10 == 0) {
                log.warn("[GeminiRateLimiter] Request blocked — cooldown active: reason={} retryAfterSeconds={} (skippedSoFar={})",
                        cooldownReason.get(), remaining, skipped);
            }
            return false;
        }

        // --- Check min-interval ---
        long elapsed = now - lastAcquireMs.get();
        if (elapsed < minIntervalMs) {
            log.debug("[GeminiRateLimiter] Request blocked — min interval not elapsed: elapsedMs={} requiredMs={}",
                    elapsed, minIntervalMs);
            return false;
        }

        // --- Permit the call ---
        lastAcquireMs.set(now);
        return true;
    }

    /**
     * Records a Gemini rate-limit hit (HTTP 429 / RESOURCE_EXHAUSTED) and activates
     * the global cooldown.
     *
     * <p>The cooldown duration is determined as follows:
     * <ol>
     *   <li>If {@code providerRetryDelaySecs} is positive, use that value.</li>
     *   <li>Otherwise, use the configured default ({@code gemini.rate-limit.cooldown-seconds}).</li>
     *   <li>In either case, the duration is capped at {@code max-cooldown-seconds}.</li>
     * </ol>
     *
     * @param providerRetryDelaySecs seconds from the provider's {@code retryDelay} field,
     *                               or {@code -1} if not available / not parseable.
     */
    public synchronized void recordRateLimitHit(long providerRetryDelaySecs) {
        long cooldownSecs = providerRetryDelaySecs > 0
                ? providerRetryDelaySecs
                : defaultCooldownSeconds;
        cooldownSecs = Math.min(cooldownSecs, maxCooldownSeconds);

        long expiresMs = System.currentTimeMillis() + cooldownSecs * 1000L;
        cooldownExpiresMs.set(expiresMs);
        cooldownReason.set("HTTP_429");
        skippedDuringCooldown.set(0L);

        log.warn("[GeminiRateLimiter] *** RATE LIMIT ACTIVATED *** reason=HTTP_429 cooldownSeconds={} expiresAt={}",
                cooldownSecs, Instant.ofEpochMilli(expiresMs));
    }

    /**
     * Returns {@code true} if a global cooldown is currently active.
     * Use this to check before dispatching retry jobs.
     */
    public boolean isOnCooldown() {
        return cooldownExpiresMs.get() > System.currentTimeMillis();
    }

    /**
     * Returns the number of seconds remaining in the current cooldown,
     * or {@code 0} if no cooldown is active.
     */
    public long cooldownRemainingSeconds() {
        long remaining = cooldownExpiresMs.get() - System.currentTimeMillis();
        return remaining > 0 ? remaining / 1000 : 0;
    }
}
