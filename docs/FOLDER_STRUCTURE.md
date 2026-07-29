# Folder Structure

## 1. Repository Root

```
project/
├── gateway-service/
├── auth-service/
├── news-service/
├── category-service/
├── search-service/
├── scheduler-service/
├── admin-service/
├── common-library/
├── frontend/
├── docker/
│   ├── nginx/
│   │   └── nginx.conf
│   ├── mysql/
│   │   └── init/               # one-time schema creation scripts (per-service DB creation, DATABASE_SCHEMA.md §1)
│   └── redis/
│       └── redis.conf
├── docs/                        # this documentation set
│   ├── README.md
│   ├── PROJECT_REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPEC.md
│   ├── SERVICES.md
│   ├── CACHE_STRATEGY.md
│   ├── QUEUE_WORKFLOW.md
│   ├── DOCKER.md
│   ├── DEPLOYMENT.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   ├── CODING_RULES.md
│   ├── CONTRIBUTING.md
│   ├── DECISIONS.md
│   ├── AI_AGENT_RULES.md
│   ├── TASKS.md
│   └── FOLDER_STRUCTURE.md
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── docker-compose.override.yml
├── .env.example
├── .gitignore
└── README.md                    # top-level pointer into docs/README.md

```

## 2. Per-Service Module Structure (Java Services)

Identical pattern for `gateway-service`, `auth-service`, `news-service`, `category-service`, `search-service`, `scheduler-service`, `admin-service` — only package names and presence of certain layers differ (e.g., `gateway-service` has no `repository` package; `search-service` and `gateway-service` have no `entity` package):

```
{service-name}/
├── Dockerfile
├── pom.xml                      # or build.gradle, per DECISIONS.md build-tool choice
└── src/
    ├── main/
    │   ├── java/com/newsplatform/{service}/
    │   │   ├── {Service}Application.java
    │   │   ├── config/          # SecurityConfig, RedisConfig, FeignConfig, ResilienceConfig, etc.
    │   │   ├── controller/      # @RestController classes — public and, where applicable, internal
    │   │   ├── service/         # @Service business logic classes
    │   │   ├── repository/      # Spring Data JPA repositories (omitted in gateway-service, search-service)
    │   │   ├── entity/          # JPA @Entity classes (omitted in gateway-service, search-service)
    │   │   ├── dto/
    │   │   │   ├── request/
    │   │   │   └── response/
    │   │   ├── mapper/          # Entity <-> DTO mappers (MapStruct interfaces per DECISIONS.md A-38)
    │   │   ├── client/          # OpenFeign client interfaces for calls to other services/external APIs
    │   │   ├── exception/       # domain exceptions + GlobalExceptionHandler
    │   │   └── provider/        # scheduler-service only: NewsProvider implementations + NewsProviderFactory
    │   └── resources/
    │       ├── application.yml
    │       ├── application-dev.yml
    │       ├── application-test.yml
    │       ├── application-prod.yml
    │       └── db/migration/    # Flyway scripts, V{n}__{description}.sql (omitted in gateway-service, search-service)
    └── test/
        └── java/com/newsplatform/{service}/
            ├── service/         # *Test.java unit tests
            ├── controller/      # *IT.java integration tests
            └── fixtures/        # scheduler-service: WireMock provider response fixtures per TESTING.md §5

```

## 3. `common-library/`

Shared code used by more than one service, per `AI_AGENT_RULES.md` §7 — kept intentionally minimal:

```
common-library/
├── pom.xml
└── src/main/java/com/newsplatform/common/
    ├── dto/
    │   └── ErrorResponseDto.java        # standard error envelope, API_SPEC.md §2
    ├── exception/
    │   └── AppException.java            # base exception all services extend
    ├── filter/
    │   └── CorrelationIdFilter.java     # X-Correlation-Id propagation, CODING_RULES.md §6
    └── security/
        └── InternalApiKeyValidator.java # shared internal-endpoint auth check, SECURITY.md §3

```

`common-library` must never contain business logic specific to one domain (no `Article`, no `User` entity) — only genuinely cross-cutting, service-agnostic code. If a proposed addition to `common-library` is domain-specific, it belongs in that domain's service instead.

## 4. `frontend/` (React SPA)

```
frontend/
├── Dockerfile                   # multi-stage: node build -> nginx-served static output (or served by docker/nginx/)
├── package.json
├── public/
└── src/
    ├── components/
    ├── pages/
    │   ├── Home/
    │   ├── Category/
    │   ├── Search/
    │   ├── ArticleDetail/
    │   ├── Auth/
    │   └── Admin/
    ├── api/                      # API client modules, one per backend domain (news, category, search, auth, admin)
    ├── hooks/
    └── App.jsx

```

## 5. Naming Conventions Summary

- Java packages: `com.newsplatform.{service}.{layer}` (lowercase, no underscores).
- REST controllers: `{Domain}Controller` (public), `{Domain}InternalController` (internal, `/internal/**`).
- Service classes: `{Domain}Service`, orchestration-only classes may be named `{Domain}OrchestratorService` (e.g., `IngestionOrchestrator`).
- DTOs: per `CODING_RULES.md` §4 naming rules.
- Migration files: `V{n}__{snake_case_description}.sql`.

## 6. Rule for AI Agents

Do not deviate from this structure when generating a new file. If a new file's correct location is ambiguous, treat that as a documentation gap per `AI_AGENT_RULES.md` §5, not a license to place it wherever seems locally convenient.