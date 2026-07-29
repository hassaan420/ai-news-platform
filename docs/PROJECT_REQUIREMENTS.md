# Project Requirements

## 1. Purpose

Define the complete functional and non-functional requirements for the AI-Powered News Aggregation Platform. This document is authoritative for **scope**. Anything not listed as in-scope MUST NOT be implemented without an explicit instruction and a corresponding update to this file.

## 2. In-Scope Functional Requirements

### 2.1 News Ingestion

- FR-1: The system must fetch news articles from multiple external News Providers (NewsAPI, GNews, Mediastack, The Guardian API, Google News RSS).
- FR-2: Every provider integration must implement a single common interface (`NewsProvider`) so that adding a new provider requires only a new implementation class and configuration entry — no changes to calling code (Strategy + Factory pattern; see `ARCHITECTURE.md` §5).
- FR-3: Ingested articles must be validated (required fields present, valid URL, valid publish date) before persistence.
- FR-4: Duplicate articles must be detected and rejected. Duplicate detection is based on a content hash (see `DATABASE_SCHEMA.md` §Articles.hash) computed from normalized title + source URL.
- FR-5: Ingestion must run on a schedule (default: every 15 minutes — see Assumption A-1) via the Scheduler Service, and must also be triggerable on-demand by an admin via `POST /api/admin/fetch`.
- FR-6: Every fetch attempt (success or failure) must be logged to the Fetch Logs table with status, timestamp, and execution time.

### 2.2 Content Organization

- FR-7: Every article must be assigned to exactly one category at ingestion time (see Assumption A-2).
- FR-8: Categories are a fixed, admin-manageable list: Politics, Sports, Technology, Business, Entertainment, Science, Health, World, Education, Lifestyle, Travel, Gaming, AI.
- FR-9: Each category must have a unique, URL-safe slug, generated automatically from its title.

### 2.3 Reading & Discovery

- FR-10: Users can view the latest news (homepage), trending news, and featured news.
- FR-11: Users can browse articles by category.
- FR-12: Users can search articles by keyword, with optional filters for date range, category, source, and author.
- FR-13: All list endpoints (latest, category, search) must support pagination and sorting.
- FR-14: Users can view a single article's detail page, including a list of related articles (same category, excluding itself, most recent first — see Assumption A-3).

### 2.4 Administration

- FR-15: Admins can manage News Sources (provider, API key, endpoint, status/enabled).
- FR-16: Admins can manage Categories.
- FR-17: Admins can manually trigger a fetch and clear the cache.
- FR-18: Admins can view Fetch Logs and system health status.
- FR-19: Admins can manage Users and roles.

### 2.5 Authentication & Authorization

- FR-20: Users can register and log in.
- FR-21: Authentication uses JWT access tokens plus refresh tokens.
- FR-22: Role-based access control distinguishes at minimum `ROLE_USER` and `ROLE_ADMIN`. Admin-only endpoints (`/api/admin/`**) require `ROLE_ADMIN`.
- FR-23: Public read endpoints (news listing, search, article detail, categories) do not require authentication.

### 2.6 Performance & Caching

- FR-24: Frequently requested data (homepage, trending, category listings, search results) must be cached in Redis.
- FR-25: Cache must be invalidated or refreshed when new articles are ingested for the affected category(ies).

## 3. Non-Functional Requirements


| ID     | Requirement                                                                                                                                                       |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-1  | Java 21 (LTS) and Spring Boot 3.x across all services.                                                                                                            |
| NFR-2  | Full Microservice Architecture — no shared mutable state between services; each service owns its own database.                                                    |
| NFR-3  | Every service exposes RESTful APIs following the conventions in `API_SPEC.md`.                                                                                    |
| NFR-4  | JWT-based authentication enforced at the API Gateway and re-validated at each service (defense in depth).                                                         |
| NFR-5  | Fully Dockerized; runnable end-to-end via a single `docker-compose up`.                                                                                           |
| NFR-6  | SOLID principles, Clean Architecture, Repository Pattern, Service Layer Pattern, DTO Pattern throughout.                                                          |
| NFR-7  | Global exception handling via `@ControllerAdvice` in every service — no unhandled exceptions leak stack traces to clients.                                        |
| NFR-8  | Structured logging via SLF4J + Logback in every service.                                                                                                          |
| NFR-9  | Input validation via Spring Validation (Bean Validation / Jakarta Validation) on all inbound DTOs.                                                                |
| NFR-10 | Horizontal scalability — services must be stateless; session state, if any, lives in Redis, not in-memory.                                                        |
| NFR-11 | Cloud deployment ready — configuration via environment variables and Spring Profiles (`dev`, `test`, `prod`); no hardcoded secrets or hosts.                      |
| NFR-12 | Observability via Spring Boot Actuator health/info/metrics endpoints on every service.                                                                            |
| NFR-13 | API documentation via OpenAPI/Swagger on every service.                                                                                                           |
| NFR-14 | SEO-friendly public-facing pages (server-renderable metadata, clean slugs, canonical URLs — see `DECISIONS.md` A-4 for frontend rendering strategy implications). |
| NFR-15 | CI/CD via GitHub Actions: automated tests, build, Docker image build/push, deploy, health check, auto-restart on failure.                                         |
| NFR-16 | Unit and integration test coverage per `TESTING.md` on every service before it is considered complete.                                                            |


## 4. Out of Scope (This Phase)

The following are explicitly **not** implemented in this phase. Do not scaffold, stub, or create placeholder code/tables/endpoints for these:

- AI Summarization Service
- AI Recommendation Engine
- Mobile applications (iOS/Android)
- Elasticsearch integration for Search Service (listed as optional in the source spec — deferred; MySQL full-text/LIKE-based search is the Phase 1 implementation, see `DECISIONS.md` A-5)
- RabbitMQ/Kafka messaging (optional in source spec — deferred; Scheduler Service uses Spring Scheduler with direct service calls in Phase 1, see `DECISIONS.md` A-6)
- Spring Cloud Config Server / Eureka Server (optional in source spec — deferred; static configuration via `application.yml` per environment and Docker Compose service discovery in Phase 1, see `DECISIONS.md` A-7)
- Third-party API consumption of this platform's data (no public API key issuance system)
- Native mobile push notifications, email notifications, or any notification system

## 5. Stated Assumptions Requiring Confirmation

These assumptions were made where the source specification was silent or ambiguous. They are treated as binding until a human overrides them (log any override in `DECISIONS.md`):

- **A-1:** Default scheduled fetch interval is every 15 minutes. Configurable via `scheduler.fetch.cron` property.
- **A-2:** Category assignment is derived from the category the provider's API query targeted (i.e., ingestion is done per-category query against each provider), not by ML/NLP classification. AI-based classification is out of scope.
- **A-3:** "Related Articles" = same category, excluding the current article, ordered by `publishedAt DESC`, limited to 5.
- **A-4:** Frontend is a React.js single-page application (SPA) served as static assets via Nginx, consuming the REST APIs. SEO requirements (NFR-14) are met via pre-rendering/meta-tag injection at build time or via a lightweight SSR shim — exact mechanism is a Phase 3 decision, not blocking Phase 1–2.
- **A-5:** Search Service uses MySQL `LIKE`/`FULLTEXT` indexes in Phase 1. Elasticsearch is a documented future extension point only.
- **A-6:** No message broker in Phase 1. Scheduler Service calls News Service synchronously via OpenFeign per provider/category job, with Resilience4j retry/circuit-breaker for resilience instead of a queue.
- **A-7:** No Config Server or Eureka in Phase 1. Service discovery is via Docker Compose DNS (service name resolution) and static Gateway routes; configuration is via per-service `application-{profile}.yml` plus environment variable overrides.
- **A-8:** Single MySQL server hosting one logical database per service (`auth_db`, `news_db`, `category_db`, `search_db`, `admin_db`) rather than one MySQL instance per service, to keep Phase 1 infrastructure manageable. Each service still only accesses its own database/schema — this is a deployment simplification, not an architectural violation (see `DECISIONS.md` A-8 and `ARCHITECTURE.md` §3.2).
- **A-9:** Search Service does not own article data; it queries News Service's data via a read path (see `ARCHITECTURE.md` §6 and `DATABASE_SCHEMA.md` for the exact mechanism chosen).

## 6. Acceptance Criteria (Definition of Done, Platform-Level)

The platform is considered functionally complete for Phase 1–7 when:

1. All FR-1 through FR-25 are implemented and covered by at least one integration test.
2. All services start via `docker-compose up` with no manual steps beyond `.env` configuration.
3. All endpoints in `API_SPEC.md` are implemented, documented in Swagger, and return contract-conformant responses.
4. CI pipeline (`DEPLOYMENT.md`) runs green on `main` including tests, build, and image push.
5. Security requirements in `SECURITY.md` are implemented and verified.

