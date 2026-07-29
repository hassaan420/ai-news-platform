# Architecture

## 1. Architectural Style

Microservice Architecture with a single API Gateway entry point, following Clean Architecture / Hexagonal (Ports & Adapters) principles inside each service. Each service is independently deployable, owns its own persistence, and communicates with other services only through well-defined synchronous (REST/OpenFeign) contracts documented in `API_SPEC.md`.

## 2. System Topology

```
                              ┌─────────────┐
                              │   Client    │  (React SPA / Browser)
                              └──────┬──────┘
                                     │ HTTPS
                              ┌──────▼──────┐
                              │    Nginx    │  (reverse proxy, TLS termination, static assets)
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │ API Gateway │  (Spring Cloud Gateway)
                              │  - routing  │
                              │  - JWT verify│
                              │  - rate limit│
                              └──────┬──────┘
        ┌───────────┬───────────────┼───────────────┬───────────────┐
        │            │               │               │               │
   ┌────▼───┐   ┌────▼─────┐   ┌────▼─────┐   ┌──────▼─────┐   ┌─────▼─────┐
   │  Auth  │   │   News   │   │ Category │   │   Search   │   │   Admin   │
   │Service │   │ Service  │   │ Service  │   │  Service   │   │  Service  │
   └────┬───┘   └────┬─────┘   └────┬─────┘   └──────┬─────┘   └─────┬─────┘
        │            │               │               │               │
        └────────────┴───────┬───────┴───────────────┴───────────────┘
                              │
                       ┌──────▼──────┐
                       │ Redis Cache │
                       └──────┬──────┘
                              │
                       ┌──────▼──────┐
                       │    MySQL    │
                       └─────────────┘

                       ┌──────────────────┐
                       │ Scheduler Service│──► External News APIs (via OpenFeign)
                       └─────────┬─────────┘
                                 │ (calls News Service ingestion endpoint)
                                 ▼
                            News Service

```

## 3. Services Overview


| Service             | Owns Database                                                                    | External Dependencies                                                   |
| ------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `gateway-service`   | none (stateless routing)                                                         | all downstream services                                                 |
| `auth-service`      | `auth_db`                                                                        | none                                                                    |
| `news-service`      | `news_db`                                                                        | External News Provider APIs (via OpenFeign)                             |
| `category-service`  | `category_db`                                                                    | none                                                                    |
| `search-service`    | none — read replica/query path into `news_db` (see §6)                           | `news-service`                                                          |
| `scheduler-service` | `news_db` (Fetch Logs only, shared ownership boundary — see §3.3)                | `news-service`, External Provider APIs                                  |
| `admin-service`     | `admin_db` (own settings/API-key metadata); orchestrates calls to other services | `auth-service`, `news-service`, `category-service`, `scheduler-service` |


Full per-service responsibility breakdown is in `SERVICES.md`. This file governs cross-cutting structure only.

### 3.1 Service Independence Rule

No service may access another service's database directly (no shared JDBC connections across service boundaries, no shared JPA entities across services). All cross-service data access is via REST calls through OpenFeign clients, using DTOs defined in that owning service's `API_SPEC.md` contract.

### 3.2 Database-per-Service (Deployment Note)

Per `PROJECT_REQUIREMENTS.md` Assumption A-8, Phase 1 runs a single MySQL **server** but each service connects to its own **schema/database** with its own credentials. This is a deployment simplification only — it does not permit cross-schema joins or shared entities. Each service's `application.yml` points only at its own schema.

### 3.3 Fetch Logs Ownership

Fetch Logs are written by the Scheduler Service but conceptually belong to News Service's domain (ingestion history). Scheduler Service owns the `fetch_logs` table within `news_db` and writes to it directly (this is the one deliberate exception to strict per-service DB ownership, justified because Scheduler and News Service are two views of the same ingestion pipeline). News Service reads `fetch_logs` for the Admin dashboard's log view via a read endpoint it exposes — Admin Service never queries `fetch_logs` directly.

## 4. Communication Patterns

- **Client → Gateway → Service:** Synchronous HTTP/REST, JSON payloads.
- **Service → Service:** Synchronous HTTP/REST via OpenFeign declarative clients, wrapped in Resilience4j circuit breakers with defined fallbacks (see `SERVICES.md` per-service Resilience4j config).
- **Service → External News API:** Synchronous HTTP via OpenFeign/WebClient, with Resilience4j retry + circuit breaker + rate limiter (external APIs have their own rate limits — see `QUEUE_WORKFLOW.md`).
- **No asynchronous messaging in Phase 1** (Assumption A-6). All "queue-like" behavior (scheduled jobs, retries) is implemented via Spring Scheduler + Resilience4j, not a broker.

## 5. Design Patterns (Mandatory, Not Optional)


| Pattern                       | Where Applied                                                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Strategy Pattern**          | `NewsProvider` interface with one implementation per external API (NewsApiProvider, GNewsProvider, MediastackProvider, GuardianProvider, GoogleRssProvider). |
| **Factory Pattern**           | `NewsProviderFactory` selects the correct `NewsProvider` implementation at runtime based on Source configuration.                                            |
| **Repository Pattern**        | Every entity has a Spring Data JPA repository interface; no raw JDBC/EntityManager access from services.                                                     |
| **Service Layer Pattern**     | Controllers never contain business logic; all logic lives in `@Service` classes. Controllers only translate HTTP ↔ DTO ↔ Service call.                       |
| **DTO Pattern**               | Entities never cross a controller boundary. Every request/response uses a dedicated DTO, mapped via a mapper class/MapStruct (see `CODING_RULES.md`).        |
| **Builder Pattern**           | Used for constructing complex DTOs/entities with many optional fields (e.g., Article, Source).                                                               |
| **Dependency Injection**      | Constructor injection only (see `CODING_RULES.md` — field injection is prohibited).                                                                          |
| **Global Exception Handling** | One `@ControllerAdvice` + `@ExceptionHandler` set per service, returning a standard error envelope (see `API_SPEC.md` §Error Format).                        |
| **Circuit Breaker**           | Resilience4j on every outbound Feign client (both inter-service and external API clients).                                                                   |


## 6. Search Service Data Access (Resolves Requirement A-9)

The Search Service does **not** maintain its own copy of article data and does not own `news_db`. In Phase 1, Search Service is a thin query-and-filter layer that calls News Service's internal search-capable read endpoint (`GET /internal/articles/search` — see `API_SPEC.md` §Internal Endpoints) which executes the MySQL `FULLTEXT`/`LIKE` query against `news_db` on Search Service's behalf, and applies caching at the Search Service layer via Redis. This preserves database-per-service ownership while allowing Search Service to exist as an independently scalable, independently deployable component responsible for search-specific concerns (query parsing, filter composition, result ranking, pagination assembly, cache-key strategy). If Elasticsearch is introduced in a later phase, Search Service would instead own an Elasticsearch index populated by News Service's ingestion events — this migration path must not be pre-built now.

## 7. Extensibility Points (Must Remain Open, Not Implemented)

The architecture must not be closed off to the following future additions. Concretely, this means:

- `NewsProvider` interface must not be modified in a way that assumes only the five listed providers can exist.
- News Service's ingestion pipeline must not assume there is no downstream AI summarization/recommendation step (i.e., avoid tightly coupling "fetch → store → cache" such that inserting a "fetch → store → [future: summarize] → cache" step would require rewriting the pipeline). A single well-named orchestration method (e.g., `IngestionPipelineService.ingest(...)`) is sufficient — do not build a plugin/event system for this in Phase 1.
- Admin Service's Source management model must support arbitrary provider types via the existing `provider` enum/string field, not a hardcoded switch that would break on a 6th provider.

Do not build speculative interfaces, event buses, or plugin loaders for these — that would violate `AI_AGENT_RULES.md` §"No Speculative Generality."

## 8. API Gateway Responsibilities

- Route matching by path prefix (see `API_SPEC.md` for the full route table).
- JWT signature and expiry verification for protected routes (full claims-based authorization is re-checked at the downstream service — defense in depth per NFR-4).
- Rate limiting (Resilience4j RateLimiter or Spring Cloud Gateway's built-in RequestRateLimiter — see `SECURITY.md`).
- No business logic. No database access. Stateless.

## 9. Configuration & Profiles

Every service supports three Spring Profiles: `dev`, `test`, `prod`. Profile-specific values (DB host, Redis host, external API base URLs) live in `application-{profile}.yml`; secrets (API keys, JWT signing key, DB password) are never committed and are injected via environment variables (see `SECURITY.md` §Secrets Management and `DOCKER.md`).

## 10. Non-Goals

- No client-side or server-side GraphQL layer.
- No multi-region/multi-cluster orchestration (Kubernetes) in Phase 1 — Docker Compose is the target orchestration for this phase (see `DECISIONS.md` A-10). Architecture should not preclude a future Kubernetes migration (stateless services, externalized config already satisfy this) but no Kubernetes manifests are to be authored now.

