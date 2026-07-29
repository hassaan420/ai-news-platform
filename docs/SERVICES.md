# Services

Per-service responsibility boundaries, internal design, and resilience configuration. Cross-cutting structure is defined in `ARCHITECTURE.md`; this file is the detailed per-service reference.

## 1. `gateway-service`

**Responsibility:** Single entry point. Routing, JWT verification, rate limiting, request validation, load balancing, Swagger aggregation.

**Owns no database.**

**Key components:**

- Route definitions (`application.yml` — one route block per downstream service, path-prefix matched).
- `JwtAuthenticationFilter` (Gateway global filter) — verifies signature/expiry on protected paths; rejects with 401 before forwarding.
- `RateLimiterConfig` — per-client (by IP or user ID) request rate limiting (see `SECURITY.md`).

**Must NOT contain:** business logic, database access, DTOs beyond routing/auth concerns.

## 2. `auth-service`

**Responsibility:** User registration, login, JWT issuance, refresh token management, role management.

**Owns:** `auth_db` (`users`, `refresh_tokens`).

**Key components:**

- `AuthController` → `AuthService` → `UserRepository`, `RefreshTokenRepository`.
- `JwtTokenProvider` — issues/validates access + refresh tokens (HS256 or RS256 — see `SECURITY.md` §JWT).
- `PasswordEncoder` bean: BCrypt, strength 12.

**Resilience4j:** N/A as a provider (auth-service is called by Gateway only for token issuance, not wrapped by a circuit breaker on the calling side beyond Gateway's standard downstream timeout).

## 3. `news-service`

**Responsibility:** Own the article and source domain. Ingestion pipeline orchestration, duplicate detection, category assignment validation, latest/trending queries, article detail + related articles, fetch log storage.

**Owns:** `news_db` (`articles`, `sources`, `fetch_logs`).

**Key components:**

- `NewsController` (public: `/api/news/`**, `/api/articles/**`)
- `IngestionController` (internal: `/internal/articles/ingest`) — receives validated batches from scheduler-service.
- `NewsProvider` interface + implementations (`NewsApiProvider`, `GNewsProvider`, `MediastackProvider`, `GuardianProvider`, `GoogleRssProvider`) — **Note:** in Phase 1, provider *calls* to external APIs are made from `scheduler-service` (see §6), so these implementations live in a shared library or in scheduler-service — see `DECISIONS.md` A-13 for the final placement decision and rationale.
- `IngestionPipelineService` — validate → hash → duplicate-check → category-validate → persist → evict relevant cache keys.
- `DuplicateDetectionService` — implements `DATABASE_SCHEMA.md` §6 hashing rule.
- `ArticleRepository`, `SourceRepository`, `FetchLogRepository`.

**Resilience4j:** Circuit breaker on the outbound call to `category-service` (`GET /internal/categories/valid-ids`), fallback = use last-cached valid category set.

## 4. `category-service`

**Responsibility:** Own the category domain. CRUD, slug generation, active/inactive toggling.

**Owns:** `category_db` (`categories`).

**Key components:**

- `CategoryController` (public: `/api/categories/`**; internal: `/internal/categories/valid-ids`)
- `SlugGenerator` utility — lowercase, hyphenate, strip non-alphanumeric, de-duplicate on collision (append `-2`, `-3`, ...).

## 5. `search-service`

**Responsibility:** Query parsing and filter composition for `/api/news/search`. Delegates the actual data query to News Service's internal search endpoint (`ARCHITECTURE.md` §6) and owns the Redis caching layer for search results.

**Owns no database.**

**Key components:**

- `SearchController` (public: `/api/news/search`)
- `SearchQueryBuilder` — translates query params into the internal request contract.
- `NewsServiceClient` (OpenFeign) — calls `news-service` `/internal/articles/search`.
- `SearchCacheService` — Redis-backed caching keyed by normalized query params (see `CACHE_STRATEGY.md`).

**Resilience4j:** Circuit breaker on `NewsServiceClient`, fallback = return cached results if available, else 503.

## 6. `scheduler-service`

**Responsibility:** Scheduled and on-demand ingestion orchestration. Calls each active Source's external API, normalizes the provider-specific response into the common article DTO shape, submits validated batches to News Service, and writes `fetch_logs`.

**Owns:** write access to `news_db.fetch_logs` only (`ARCHITECTURE.md` §3.3). Does not own `articles` or `sources` tables but reads `sources` (read-only, via News Service's internal endpoint — not direct DB access, preserving §3.1) to know which sources to fetch.

**Key components:**

- `ScheduledFetchJob` — `@Scheduled(cron = "${scheduler.fetch.cron}")`, default every 15 minutes (Assumption A-1).
- `NewsProvider` implementations (see §3 note — placed here per `DECISIONS.md` A-13).
- `NewsProviderFactory` — resolves the correct `NewsProvider` bean by `Source.provider`.
- `IngestionOrchestrator` — for each active source: fetch → map to common DTO → POST to `news-service` `/internal/articles/ingest` → record result to `fetch_logs`.
- `FetchLogRepository` (JPA repository against `news_db.fetch_logs`, same physical schema as news-service — see `DATABASE_SCHEMA.md` §7 for the cross-schema justification).

**Resilience4j:** Per-provider circuit breaker + retry (3 attempts, exponential backoff) + rate limiter matching each provider's documented rate limit (configured per source in `application.yml`, see `QUEUE_WORKFLOW.md`).

## 7. `admin-service`

**Responsibility:** Orchestration/aggregation layer for administrative operations. Does not duplicate other services' data; calls them via OpenFeign.

**Owns:** `admin_db` (`settings` only — local admin preferences, not domain data).

**Key components:**

- `AdminSourceController` → proxies to news-service's source management endpoints.
- `AdminCategoryController` → proxies to category-service.
- `AdminUserController` → proxies to auth-service.
- `AdminFetchController` → proxies to scheduler-service's manual-trigger endpoint.
- `AdminCacheController` → calls each service's cache-eviction internal endpoint directly (cache is Redis, shared instance, keyspace-namespaced per service — see `CACHE_STRATEGY.md`).
- `AdminHealthController` → aggregates `/actuator/health` from all services.
- `AdminLogController` → proxies to news-service's `/internal/fetch-logs`.

**Resilience4j:** Circuit breaker on every proxied client; fallback returns a `503` with a clear "service unavailable" error envelope rather than a partial/misleading success.

## 8. Cross-Service Contracts

Every OpenFeign client interface used for inter-service calls must correspond exactly to an endpoint documented in `API_SPEC.md` (public or internal section). Do not create an inter-service call to an endpoint that is not documented there — document it first, then implement.

## 9. Health & Observability (Every Service)

Every service, without exception, exposes:

- `/actuator/health` (liveness + readiness groups configured — see `DEPLOYMENT.md` §Health Checks)
- `/actuator/info`
- `/actuator/metrics`
- `/actuator/prometheus` (if Prometheus scraping is enabled — see `DECISIONS.md` A-14 for monitoring stack decision)

