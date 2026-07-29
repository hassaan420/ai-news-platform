# Docker & Containerization

## 1. Principle

Every service is independently Dockerized with its own `Dockerfile` (multi-stage build: Maven/Gradle build stage → slim JRE runtime stage). The entire platform runs via a single root-level `docker-compose.yml` for local development and as the Phase 1 deployment mechanism (`DECISIONS.md` A-10).

## 2. Dockerfile Convention (Every Java Service)

Two-stage build, identical pattern across all services (only the module path differs):

- **Stage 1 (build):** `maven:3.9-eclipse-temurin-21` (or the repo's chosen build tool image) — copies source, runs `mvn -pl {module} -am clean package -DskipTests` (tests run in CI, not in the image build — see `TESTING.md`).
- **Stage 2 (runtime):** `eclipse-temurin:21-jre-alpine` — copies only the built JAR from Stage 1, runs as a non-root user (`appuser`), exposes the service's port, `ENTRYPOINT ["java", "-jar", "app.jar"]`.

No service Dockerfile installs unnecessary OS packages, and no service Dockerfile bakes in secrets, API keys, or environment-specific hostnames — all such values come from environment variables at container run time (`SECURITY.md` §Secrets Management).

## 3. Container Inventory


| Container           | Image Source                                                   | Port (internal) | Depends On                                                                                                                                       |
| ------------------- | -------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `nginx`             | official `nginx:alpine` + custom config                        | 80/443          | `gateway-service`, static frontend build                                                                                                         |
| `gateway-service`   | custom build                                                   | 8080            | all downstream services (soft dependency — Gateway starts regardless; routes fail gracefully via circuit breaker until dependencies are healthy) |
| `auth-service`      | custom build                                                   | 8081            | `mysql`                                                                                                                                          |
| `news-service`      | custom build                                                   | 8082            | `mysql`, `redis`                                                                                                                                 |
| `category-service`  | custom build                                                   | 8083            | `mysql`, `redis`                                                                                                                                 |
| `search-service`    | custom build                                                   | 8084            | `news-service`, `redis`                                                                                                                          |
| `scheduler-service` | custom build                                                   | 8085            | `news-service`                                                                                                                                   |
| `admin-service`     | custom build                                                   | 8086            | `auth-service`, `news-service`, `category-service`, `scheduler-service`, `redis`                                                                 |
| `mysql`             | official `mysql:8.0`                                           | 3306            | —                                                                                                                                                |
| `redis`             | official `redis:7-alpine`                                      | 6379            | —                                                                                                                                                |
| `rabbitmq`          | **not included in Phase 1** — see `PROJECT_REQUIREMENTS.md` §4 | —               | —                                                                                                                                                |


## 4. Service Discovery

Docker Compose's built-in DNS resolves each service by its Compose service name (e.g., `news-service` resolves to that container's IP on the shared Compose network). No Eureka/service registry in Phase 1 (Assumption A-7). Each service's `application-prod.yml` / Docker environment variables reference downstream services by these DNS names (e.g., `news-service.client.base-url: http://news-service:8082`).

## 5. Networking

Single user-defined bridge network, e.g. `news-platform-net`, declared in `docker-compose.yml`. All containers join this network. Only `nginx` publishes ports to the host in `prod`-like Compose profiles; all other services are reachable only within the Compose network (not exposed on the host) except in `dev` overrides where direct port publishing may aid debugging (see `docker-compose.override.yml` convention, §7).

## 6. Volumes

- `mysql-data` — named volume, persists `/var/lib/mysql`.
- `redis-data` — named volume, persists `/data` (Redis AOF/RDB persistence — see `DECISIONS.md` A-21 on whether Redis persistence is enabled; default: AOF enabled for durability of rate-limit/lock state, acceptable since cached data is naturally regenerable).

## 7. Compose File Structure

- `docker-compose.yml` — base definition, environment-agnostic where possible, used as-is for `prod`-like runs with `.env` supplying secrets.
- `docker-compose.override.yml` — local `dev` overrides (auto-loaded by `docker compose up` when present): bind-mounts for hot reload (Spring Boot DevTools), exposed ports for direct service debugging, `SPRING_PROFILES_ACTIVE=dev`.
- `.env` — **not committed** (see `.gitignore` in `CODING_RULES.md` and `SECURITY.md` §Secrets Management); `.env.example` **is** committed with placeholder keys/values documenting every required variable.

## 8. Health Checks

Every service container defines a Compose `healthcheck` hitting its own `/actuator/health` endpoint:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8082/actuator/health"]
  interval: 15s
  timeout: 5s
  retries: 5
  start_period: 30s

```

`mysql` and `redis` use their respective standard healthcheck commands (`mysqladmin ping`, `redis-cli ping`). Dependent services use `depends_on: condition: service_healthy` rather than a bare `depends_on`, so services do not start their own liveness probes against a not-yet-ready database.

## 9. Build & Run (Local)

```
docker compose build
docker compose up -d
docker compose logs -f gateway-service
docker compose down            # stop, keep volumes
docker compose down -v         # stop, remove volumes (full reset)

```

## 10. Image Tagging & Registry

Images are pushed to Docker Hub as `<dockerhub-namespace>/<service-name>:<git-sha>` and additionally tagged `:latest` on `main` branch builds (see `DEPLOYMENT.md` §CI/CD Pipeline for the exact GitHub Actions steps). Never push an image tagged only `:latest` without also pushing an immutable `:<git-sha>` tag, so any deployment can be pinned to an exact build.