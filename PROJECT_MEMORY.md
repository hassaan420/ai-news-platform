# PROJECT MEMORY

## Current Sprint

Phase 1.5 — Infrastructure Hardening (complete)

## Completed

- Maven multi-module project scaffold (Java 21, Spring Boot 3.4.5)
- `common-library` module with empty package structure
- All 7 microservice modules with `@SpringBootApplication` entry points and `application.yml` (ports 8080–8086)
- Package layout per `FOLDER_STRUCTURE.md` (no business logic, no APIs)
- Root `.gitignore`
- `.env.example` with all required environment variables (including `JAVA_OPTS`)
- `Dockerfile` per service (multi-stage: Maven build → JRE Alpine runtime, non-root user, OCI labels, JAVA_OPTS support)
- `docker-compose.yml` — full stack: MySQL 8.0, Redis 7, Nginx, Gateway, all 7 services with healthchecks (including Nginx), dependency ordering, log rotation
- `docker-compose.override.yml` — dev overrides (exposed ports, `SPRING_PROFILES_ACTIVE=dev`, `JAVA_OPTS` with 50% RAM cap)
- `docker-compose.prod.yml` — prod overrides (no exposed infra ports, resource limits/reservations, `SPRING_PROFILES_ACTIVE=prod`, `JAVA_OPTS` with 75% RAM cap)
- `.dockerignore` — excludes VCS, docs, IDE, build output, secrets from build context
- MySQL init script (`docker/mysql/init/01-create-databases.sql`) — creates `auth_db`, `news_db`, `category_db`, `admin_db`
- MySQL custom config (`docker/mysql/my.cnf`) — UTF-8mb4, UTC timezone, InnoDB tuning, slow query log, connection limits, binary logging
- Redis config (`docker/redis/redis.conf`) — AOF persistence, password auth, LRU eviction
- Nginx config (`docker/nginx/nginx.conf`) — reverse proxy to gateway, security headers, gzip, keepalive, proxy buffering, request body limit, error pages, static frontend placeholder
- API Gateway base routing (`gateway-service/application.yml`) — routes `/api/auth`, `/api/news`, `/api/articles`, `/api/categories`, `/api/admin`, `/api/scheduler`; no JWT filter yet; `/internal/**` excluded
- Helper scripts: `scripts/docker-dev.sh`, `scripts/docker-prod.sh`, `scripts/docker-clean.sh`

## Pending

- `docker compose up` health verification
- Phase 2: Core Backend implementation

## Current Task

Phase 1.5 infrastructure hardening — **complete**. Awaiting `docker compose up` verification and approval to proceed to Phase 2 (Core Backend).

## Known Bugs

None.

## Future Features

See `docs/PROJECT_REQUIREMENTS.md` §4 (Out of Scope) and `docs/TASKS.md` Phases 2–7.

## Current Branch

main (local)

## Architecture Notes

- Build tool: **Maven** (multi-module parent POM at repo root)
- Base package: `com.newsplatform.{service}`
- `common-library` is a plain JAR (not a Spring Boot executable)
- JPA, Redis, Security, OpenFeign, Flyway deferred to Phase 2
- Docker infrastructure uses a single bridge network (`news-platform-net`)
- Single MySQL server, 4 logical schemas (per-service DB ownership)
- Single Redis instance, keyspace-namespaced per service
- Three compose profiles: `docker-compose.yml` (base) + `override` (dev, auto-loaded) + `prod` (explicit `-f` flag)
- JVM container support enabled via `JAVA_OPTS` env var passthrough in all Dockerfiles

## Decisions Made

- Maven chosen as build tool (aligned with `DOCKER.md` CI/build examples)
- Dockerfiles use `wget` for healthchecks (available in Alpine JRE image) instead of `curl`
- Redis AOF persistence enabled per `DECISIONS.md` A-21
- Gateway routing uses `StripPrefix=0` (preserves full path for downstream services)
- Shell-form ENTRYPOINT (`sh -c`) chosen over exec-form to support `$JAVA_OPTS` variable expansion
- `docker-compose.prod.yml` uses `!override []` to clear host-exposed ports for MySQL/Redis in production
- Log rotation configured at Docker level (`json-file` driver, `max-size: 10m`, `max-file: 3–5`) to prevent disk exhaustion
- MySQL binary logging enabled in ROW format for replication readiness
- Nginx upstream keepalive (32 connections) for reduced connection overhead to gateway

## Recent Changes

- 2026-07-29: Phase 1 Maven scaffold — all modules, folder structure, `.gitignore`
- 2026-07-29: Phase 1 infrastructure — `.env.example`, Dockerfiles, docker-compose, MySQL/Redis/Nginx configs, gateway routing
- 2026-07-29: Phase 1.5 infrastructure hardening — `.dockerignore`, `docker-compose.prod.yml`, MySQL `my.cnf`, Nginx hardening, Dockerfile improvements (OCI labels, JAVA_OPTS), helper scripts, log rotation, resource limits

## TODO

- Verify `docker compose up` health
- Phase 2: Flyway migrations and core backend implementation

## Next Steps

1. Run `docker compose up` and verify all containers are healthy
2. Obtain approval to proceed to Phase 2
3. Begin Flyway migrations and core backend implementation
