# Changelog

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/) and [Conventional Commits](https://www.conventionalcommits.org/).

## [Unreleased]

### Added — Phase 5: Database Layer
- JPA entities for `Category`, `Source`, `Article`, `FetchLog`, and `Setting` across microservices.
- Spring Data JPA repositories for all domains.
- MapStruct `CategoryMapper`, `NewsMapper`, and `SettingMapper` interfaces for Entity-to-DTO conversion.
- Flyway migrations: `V1__init_category_schema.sql`, `V1__init_news_schema.sql`, and `V1__init_admin_schema.sql` to initialize `category_db`, `news_db`, and `admin_db` with correct constraints and index optimizations per `DATABASE_SCHEMA.md`.
- `application.yml` updates in `category-service`, `news-service`, `scheduler-service`, and `admin-service` configuring JDBC connections and Flyway migrations.
- DTO records for domain models corresponding to internal and external REST API requirements.

### Added — Phase 4: Authentication Service

- `User.java` and `RefreshToken.java` JPA entities for `auth_db.users` and `auth_db.refresh_tokens` tables
- `UserRepository` and `RefreshTokenRepository` Spring Data JPA interfaces
- `Role.java` enum (`ROLE_USER`, `ROLE_ADMIN`) per `PROJECT_REQUIREMENTS.md` FR-22
- `JwtTokenProvider.java` implementing 15-minute HS256 JWT access token issuance, claims validation (`sub`, `email`, `role`), and signature verification
- `SecurityConfig.java` configuring BCrypt strength 12 password hashing, stateless session policy, and public endpoint permissions
- `AuthService.java` and `AuthServiceImpl.java` implementing user registration, login, single-use refresh token rotation (7-day expiry), and logout
- `AuthController.java` exposing `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout` endpoints with OpenAPI/Swagger annotations
- `GlobalExceptionHandler.java` translating domain exceptions (`AppException`, `ConflictException`, `UnauthorizedException`) and Jakarta Bean Validation errors into standard `ErrorResponseDto` envelopes
- `V1__init_auth_schema.sql` Flyway migration script for schema initialization
- `JwtTokenProviderTest.java` and `AuthServiceTest.java` unit test suites
- `ErrorResponseDto.java`, `FieldErrorDto.java`, and common exception hierarchy in `common-library`

### Added — Phase 3: API Gateway

- `RequestLoggingFilter.java`: reactive Spring Cloud Gateway `GlobalFilter` providing correlation ID (`X-Correlation-Id`) generation, downstream request header injection, response header attachment, and non-blocking execution duration logging
- `RequestLoggingFilterTest.java`: unit tests verifying `X-Correlation-Id` generation and preservation behavior
- `application-dev.yml` and `application-prod.yml` profile configurations for `gateway-service`

### Changed — Phase 3: API Gateway

- `gateway-service/src/main/resources/application.yml`: configured Spring Cloud Gateway routes for search-service, news-service, auth-service, category-service, admin-service, and scheduler-service; configured global CORS; enabled Spring Boot Actuator health probes and metrics

### Added — Phase 1.5: Infrastructure Hardening

- `.dockerignore` excluding VCS, docs, IDE, build output, and secrets from Docker build context
- `docker-compose.prod.yml` with production overrides: removed host-exposed infrastructure ports (MySQL/Redis), resource limits and reservations for all services, production JVM flags (`-XX:+UseContainerSupport`, `-XX:MaxRAMPercentage=75.0`)
- `docker/mysql/my.cnf` custom MySQL configuration: UTF-8mb4 character set enforcement, UTC timezone, InnoDB buffer pool tuning (256M), slow query logging, connection limits (200), ROW-format binary logging
- Helper scripts: `scripts/docker-dev.sh` (dev startup), `scripts/docker-prod.sh` (prod startup with explicit compose files), `scripts/docker-clean.sh` (full cleanup with volume removal)

### Changed — Phase 1.5: Infrastructure Hardening

- `docker-compose.yml`: removed deprecated `version: "3.9"` key, added Nginx healthcheck (was missing), added MySQL custom config mount (`my.cnf`), added `json-file` log driver with rotation (`max-size: 10m`, `max-file: 3–5`) to all services, added `JAVA_OPTS` environment variable passthrough to all application services
- `docker-compose.override.yml`: added `JAVA_OPTS` with container-aware JVM flags and 50% RAM cap for local development
- `docker/nginx/nginx.conf`: added gzip compression (level 6, JSON/JS/CSS/XML), upstream keepalive (32 connections), HTTP/1.1 proxy protocol, request body limit (10M), proxy buffering (8×4k), custom 502/503/504 error pages
- All 7 service Dockerfiles: added OCI image labels (`org.opencontainers.image.*`), added `JAVA_OPTS` environment variable, changed ENTRYPOINT from exec-form to shell-form (`sh -c`) to support `$JAVA_OPTS` variable expansion at runtime
- `.env.example`: added `JAVA_OPTS` variable, added documentation comments explaining profile override mechanism

### Added — Phase 1: Project Setup

- Maven multi-module parent POM (`ai-news-platform`) with Java 21, Spring Boot 3.4.5, Spring Cloud 2024.0.1
- `common-library` module with base package structure (`com.newsplatform.common`)
- Seven microservice modules with application entry points and package layout per `FOLDER_STRUCTURE.md`:
  - `gateway-service` (port 8080, Spring Cloud Gateway)
  - `auth-service` (port 8081)
  - `news-service` (port 8082)
  - `category-service` (port 8083)
  - `search-service` (port 8084)
  - `scheduler-service` (port 8085)
  - `admin-service` (port 8086)
- Root `.gitignore` per `CODING_RULES.md` §11
- `.env.example` with all required environment variables per `SECURITY.md` §4
- Multi-stage `Dockerfile` per service (Maven build → JRE Alpine runtime, non-root `appuser`) per `DOCKER.md` §2
- `docker-compose.yml` with full service stack, healthchecks, dependency ordering, and `news-platform-net` bridge network per `DOCKER.md` §3–§8
- `docker-compose.override.yml` for local dev overrides (exposed ports, `SPRING_PROFILES_ACTIVE=dev`) per `DOCKER.md` §7
- MySQL 8.0 container with schema init script (`docker/mysql/init/01-create-databases.sql`) creating `auth_db`, `news_db`, `category_db`, `admin_db` per `DATABASE_SCHEMA.md` §1
- Redis 7 Alpine container with custom config (`docker/redis/redis.conf`) — AOF persistence, password auth, LRU eviction per `CACHE_STRATEGY.md` §1
- Nginx Alpine reverse proxy (`docker/nginx/nginx.conf`) — routes `/api/` to gateway, security headers, static frontend placeholder per `DOCKER.md` §3
- API Gateway base routing configuration — routes to all downstream services, `/internal/**` excluded per `SECURITY.md` §3; no JWT verification filter (deferred to Phase 2)
