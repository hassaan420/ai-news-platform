# Scheduler & Queue Workflow

## 1. Phase 1 Model: No Message Broker

Per `PROJECT_REQUIREMENTS.md` Assumption A-6, Phase 1 does not use RabbitMQ or Kafka. "Queue" behavior described in the original spec's background-jobs flow is implemented using **Spring Scheduler + Resilience4j**, entirely within `scheduler-service`. This file documents that workflow precisely so no ambiguity remains about what "the queue" means in this codebase.

If a broker is introduced in a future phase, it replaces the synchronous `IngestionOrchestrator` loop described below with an event-driven equivalent — that migration is out of scope now and must not be pre-built (`ARCHITECTURE.md` §7 — No Speculative Generality).

## 2. Scheduled Fetch Workflow

```
Spring Scheduler trigger (cron, default every 15 min — application.yml: scheduler.fetch.cron)
        │
        ▼
ScheduledFetchJob.run()
        │
        ▼
IngestionOrchestrator.runForAllActiveSources()
        │
        ├─► fetch list of ACTIVE sources (call news-service, does not read sources table directly)
        │
        ▼
For each active source (processed sequentially per source, sources fetched
in parallel up to a configurable pool size — application.yml: scheduler.fetch.parallelism, default 4):
        │
        ▼
   NewsProviderFactory.getProvider(source.provider)
        │
        ▼
   provider.fetchArticles(source)   ── wrapped in Resilience4j:
        │                                - @Retry (3 attempts, exponential backoff, base 2s)
        │                                - @CircuitBreaker (opens after 5 consecutive failures,
        │                                  half-open after 30s)
        │                                - @RateLimiter (per-provider limit, matching that
        │                                  provider's documented API rate limit — configured
        │                                  per source in application.yml)
        ▼
   raw provider response
        │
        ▼
   map to common ArticleIngestDto (per-provider mapper)
        │
        ▼
   POST /internal/articles/ingest (news-service) — batch of ArticleIngestDto
        │
        ▼
   news-service: IngestionPipelineService
        │   for each article in batch:
        │     1. validate required fields
        │     2. compute hash (title+url)
        │     3. resolve/validate category_id (via category-service, cached)
        │     4. check hash uniqueness (DB constraint is authoritative)
        │     5. persist if new; skip + count if duplicate
        │     6. evict affected cache keys (CACHE_STRATEGY.md §4)
        │   return IngestionResultDto { articlesFetched, articlesStored, duplicatesSkipped, errors[] }
        ▼
   scheduler-service: IngestionOrchestrator
        │
        ▼
   write fetch_logs row (source_id, status, counts, execution_time_ms, error_message)

```

## 3. Retry & Failure Handling

- Per-provider-call retries (transient network/HTTP 5xx errors) are handled by Resilience4j `@Retry` as shown above — this is provider-call-level, not job-level.
- If all retries for a source are exhausted, or the circuit breaker is open, that source's `fetch_logs` entry is written with `status = FAILED` and the error message captured; the orchestrator proceeds to the next source (one source's failure never blocks others — sources are processed independently, per the parallelism model in §2).
- If News Service's `/internal/articles/ingest` call itself fails (News Service down), the batch's `fetch_logs` entry is `status = FAILED` with `error_message = "news-service unavailable"`; fetched-but-unstored articles are **not** retried automatically within the same run — they will be re-fetched on the next scheduled run (acceptable per Assumption A-18: at-least-once ingestion attempts, deduplication at persist time makes re-fetch safe).
- `status = PARTIAL` is used when some articles in a batch persisted successfully and others failed validation (not duplicates — duplicates are normal and don't count as partial failure).

## 4. Rate Limit Handling (Per-Provider)

Each Source's rate limit is configured explicitly (not discovered dynamically):

```yaml
scheduler:
  providers:
    NEWSAPI:
      rate-limit-per-minute: 50
    GNEWS:
      rate-limit-per-minute: 10
    MEDIASTACK:
      rate-limit-per-minute: 5
    GUARDIAN:
      rate-limit-per-minute: 12
    GOOGLE_RSS:
      rate-limit-per-minute: 60

```

These are placeholder defaults — actual values must be set from each provider's real published limits before production use (see `DECISIONS.md` A-19: exact free/paid tier limits were not specified in the source spec and must be confirmed against each provider's current documentation before go-live).

If a provider returns HTTP 429, the Source's `status` is set to `RATE_LIMITED` (via news-service's source update endpoint) and it is skipped in subsequent runs until an admin resets its status or a configurable cooldown period elapses (default 60 minutes — Assumption A-20).

## 5. On-Demand Fetch Workflow

`POST /api/admin/fetch` → admin-service → scheduler-service's manual trigger endpoint → same `IngestionOrchestrator` path as §2, either for one source (if `sourceId` provided) or all active sources. This is fire-and-forget (202 response); the admin checks `GET /api/admin/logs` to see the result, consistent with `API_SPEC.md` §5.

## 6. Job Concurrency Guard

Only one scheduled or manual fetch run may execute at a time (a distributed lock via Redis, key `scheduler:job:lock`, TTL slightly longer than the expected max job duration — e.g. 10 minutes). If a manual trigger arrives while a run is in progress, it is rejected with `409 Conflict` and a message indicating a run is already active. This prevents duplicate concurrent calls to the same external APIs.