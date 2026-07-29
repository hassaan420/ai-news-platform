# Changelog

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/) and [Conventional Commits](https://www.conventionalcommits.org/).

## [Unreleased]

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
