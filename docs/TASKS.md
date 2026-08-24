# Tasks (Phased Implementation Backlog)

Derived from the source spec's "Fast Execution Plan" and expanded to be actionable. Each phase's tasks reference the governing documentation section. An AI agent picking up work should locate the current phase, pick the next unchecked task, and implement it per the referenced doc(s) — not reorder phases or skip ahead to a later phase's task without the earlier phase's prerequisites being complete.

## Phase 1 — Project Setup

- [x] Initialize Git repository, `.gitignore`, `.env.example` (`CODING_RULES.md` §11, `SECURITY.md` §4)
- [x] Scaffold `common-library` module (`FOLDER_STRUCTURE.md`)
- [x] Scaffold all 7 Spring Boot service modules with base package structure (`FOLDER_STRUCTURE.md`)
- [x] Write `Dockerfile` per service (`DOCKER.md` §2)
- [x] Write root `docker-compose.yml` and `docker-compose.override.yml` (`DOCKER.md` §7)
- [x] Configure MySQL container + per-service schema creation script (`DATABASE_SCHEMA.md` §1)
- [x] Configure Redis container (`CACHE_STRATEGY.md` §1)
- [x] Configure API Gateway base routing (no auth yet) (`ARCHITECTURE.md` §8)
- [ ] Verify `docker compose up` brings up all containers healthy (`DOCKER.md` §8)

## Phase 1.5 — Infrastructure Hardening

- [x] Create `.dockerignore` to optimize Docker build context (`DOCKER.md` §2)
- [x] Harden `docker-compose.yml`: remove deprecated `version` key, add Nginx healthcheck, add MySQL custom config mount, add log rotation, add `JAVA_OPTS` passthrough (`DOCKER.md` §3–§8)
- [x] Create `docker-compose.prod.yml` with production overrides: no exposed infra ports, resource limits, prod JVM flags (`DOCKER.md` §7, `DEPLOYMENT.md` §4)
- [x] Update `docker-compose.override.yml` with dev `JAVA_OPTS` (`DOCKER.md` §7)
- [x] Create `docker/mysql/my.cnf` — UTF-8mb4, UTC timezone, InnoDB tuning, slow query log (`DATABASE_SCHEMA.md` §1)
- [x] Harden `docker/nginx/nginx.conf` — gzip compression, keepalive, proxy buffering, request body limit, error pages (`DOCKER.md` §3, `SECURITY.md` §5)
- [x] Improve all 7 Dockerfiles: OCI labels, `JAVA_OPTS` env var, shell-form ENTRYPOINT for JVM flag injection (`DOCKER.md` §2)
- [x] Create helper scripts: `scripts/docker-dev.sh`, `scripts/docker-prod.sh`, `scripts/docker-clean.sh` (`DOCKER.md` §9)
- [x] Update `.env.example` with `JAVA_OPTS` variable and documentation comments (`SECURITY.md` §4)

## Phase 1.6 — API Gateway Implementation

- [x] Configure Spring Cloud Gateway route predicates for all 6 microservices (`ARCHITECTURE.md` §8, `SERVICES.md` §1)
- [x] Implement path prefix matching without unnecessary path rewriting (`API_SPEC.md`)
- [x] Configure global CORS with origin pattern matching and credentials support (`SECURITY.md` §9)
- [x] Implement reactive `RequestLoggingFilter` for `X-Correlation-Id` generation, propagation, response headers, and duration logging (`CODING_RULES.md` §6)
- [x] Configure Spring Boot Actuator health, info, and metrics endpoints (`SERVICES.md` §9)
- [x] Add unit tests for `RequestLoggingFilter` (`TESTING.md` §3)


## Phase 2 — Core Backend

- [x] Design and migrate schema for all 4 databases via Flyway (`DATABASE_SCHEMA.md`, `CODING_RULES.md` §8)
- [x] Implement `auth-service`: register, login, refresh, logout, JWT issuance (`API_SPEC.md` §4.4, `SECURITY.md` §1)
- [x] Implement `category-service`: CRUD + slug generation + seed 13 categories (`DATABASE_SCHEMA.md` §3.1, `API_SPEC.md` §4.3)
- [x] Implement `news-service`: entities, repositories, `IngestionPipelineService`, duplicate detection, `/internal/articles/ingest` (`SERVICES.md` §3, `QUEUE_WORKFLOW.md` §2)
- [x] Implement `news-service` public read endpoints: latest, trending (placeholder per `DECISIONS.md` A-12), category, article detail + related (`API_SPEC.md` §4.1)
- [x] Implement `scheduler-service`: `NewsProvider` implementations for all 5 providers, `NewsProviderFactory`, `IngestionOrchestrator`, scheduled job, manual trigger endpoint (`SERVICES.md` §6, `QUEUE_WORKFLOW.md`)
- [x] Implement `search-service`: query builder, Feign client to news-service internal search, caching (`SERVICES.md` §5, `ARCHITECTURE.md` §6)
- [x] Wire Gateway JWT verification + route table for all above (`ARCHITECTURE.md` §8, `SECURITY.md` §2)

## Phase 3 — Frontend

- [x] Scaffold React SPA project
- [x] Homepage (latest, trending, featured sections) (`PROJECT_REQUIREMENTS.md` FR-10)
- [x] Category pages (`PROJECT_REQUIREMENTS.md` FR-11)
- [x] Search page with filters (`PROJECT_REQUIREMENTS.md` FR-12)
- [x] Article detail page with related articles (`PROJECT_REQUIREMENTS.md` FR-14)
- [x] Finalize SEO rendering approach per `DECISIONS.md` A-4 and implement
- [x] Nginx config: reverse proxy to Gateway + static asset serving (`DOCKER.md` §3)

## Phase 4 — Performance

- [x] Implement Redis caching per `CACHE_STRATEGY.md` §2–§4 across news-service, category-service, search-service
- [x] Add MySQL indexes per `DATABASE_SCHEMA.md` (verify FULLTEXT index on `articles`)
- [x] Load-test homepage/latest/search endpoints; tune cache TTLs if needed
- [x] Centralized structured logging with correlation IDs (`CODING_RULES.md` §6)
- [x] Actuator health/metrics on every service (`SERVICES.md` §9)

## Phase 5 — Administration

- [x] Finalize JWT role enforcement on all `/api/admin/**` routes (`SECURITY.md` §2)
- [x] Implement `admin-service`: source, category, user proxy endpoints (`SERVICES.md` §7)
- [x] Implement manual fetch trigger + concurrency lock (`QUEUE_WORKFLOW.md` §5–§6)
- [x] Implement cache-clear endpoint with scope support (`CACHE_STRATEGY.md` §4)
- [x] Implement fetch logs read + health aggregation endpoints (`API_SPEC.md` §5)
- [x] Admin dashboard frontend views

## Phase 6 — Testing & Documentation

- [ ] Unit tests for all services per `TESTING.md` §3, meeting `DECISIONS.md` A-35 coverage threshold
- [ ] Integration tests (Testcontainers) for all documented endpoints per `TESTING.md` §4
- [ ] Provider fixture-based mapping tests per `TESTING.md` §5
- [ ] Swagger/OpenAPI verified accurate against `API_SPEC.md` for every service
- [ ] End-to-end Postman/Newman suite for critical user journeys

## Phase 7 — CI/CD & Deployment

- [ ] `.github/workflows/ci.yml`: lint, unit, integration jobs (`DEPLOYMENT.md` §1 Jobs 1–3)
- [ ] Docker image build + push jobs on `main` (`DEPLOYMENT.md` §1 Jobs 4–6)
- [ ] Deploy job with manual approval gate (`DEPLOYMENT.md` §4)
- [ ] Post-deploy health check + auto-rollback logic (`DEPLOYMENT.md` §5)
- [ ] Branch protection rules configured in repository settings (`DEPLOYMENT.md` §8)
- [ ] Resolve open items in `DECISIONS.md` §4 before production go-live

## Cross-Phase / Ongoing

- [ ] Keep `DECISIONS.md` updated whenever an assumption is confirmed, changed, or superseded
- [ ] Keep `API_SPEC.md` and `DATABASE_SCHEMA.md` in lockstep with actual implementation (`CONTRIBUTING.md` §4)