# Coding Rules

These rules are binding for all code in this repository, human- or AI-written. `AI_AGENT_RULES.md` governs AI agent process; this file governs the resulting code's shape.

## 1. Language & Style

- Java 21, standard language features permitted (records for immutable DTOs, pattern matching for `switch`, `var` for obviously-typed locals only — never `var` where the type isn't clear from the right-hand side).
- Formatting: Google Java Format or Spotless-enforced equivalent, applied via a Maven/Gradle plugin and checked in CI (`DEPLOYMENT.md` §1 Job 1). No manual formatting debates — the tool is authoritative.
- Package structure per service follows `FOLDER_STRUCTURE.md` exactly. Do not invent alternate package layouts per service.

## 2. Dependency Injection

- **Constructor injection only.** Field injection (`@Autowired` on a field) and setter injection are prohibited. Use `final` fields + a constructor (Lombok `@RequiredArgsConstructor` is acceptable if the project adopts Lombok — see `DECISIONS.md` A-37).

## 3. Layering Rules (Enforces Clean Architecture / ARCHITECTURE.md §5)

- **Controller layer:** HTTP concerns only — request mapping, `@Valid` DTO binding, calling exactly one service method, mapping the service result to a response DTO/status. No business logic, no repository calls, no transaction management.
- **Service layer:** All business logic. Orchestrates repositories and other services (via Feign clients). Owns `@Transactional` boundaries.
- **Repository layer:** Spring Data JPA interfaces only. No custom business logic in repository implementations beyond query definitions (`@Query` is fine; a hand-rolled repository implementation with business rules is not).
- **Mapper layer:** Dedicated mapper classes (MapStruct preferred — Assumption A-38) convert Entity ↔ DTO. Controllers and services never manually construct a DTO field-by-field inline when a mapper exists for that type.

## 4. DTOs

- Entities never appear in a controller method signature (request or response) — always a DTO.
- Every DTO is a Java `record` unless it requires mutability for a specific framework reason (document the exception inline if so).
- Naming: `{Entity}RequestDto`, `{Entity}ResponseDto`, `{Entity}SummaryDto` (for list-view lightweight variants, e.g. `ArticleSummaryDto` used in `relatedArticles` per `API_SPEC.md` §4.1).

## 5. Exception Handling

- Every service has exactly one `@RestControllerAdvice` class (`GlobalExceptionHandler`) producing the standard error envelope (`API_SPEC.md` §2).
- Domain-specific exceptions extend a common `AppException` base (with an HTTP status and error code attached), not generic `RuntimeException` thrown directly from service methods.
- Never swallow an exception silently (empty catch block) — log at minimum, or let it propagate to the global handler.

## 6. Logging

- SLF4J + Logback, structured (JSON encoder in `prod` profile for log aggregation compatibility — Assumption A-39).
- Log levels: `ERROR` for failures requiring attention, `WARN` for recoverable/degraded conditions (e.g., circuit breaker opened), `INFO` for significant business events (article ingested, user registered, admin action), `DEBUG` for developer diagnostics (never enabled by default in `prod`).
- **Never log:** passwords, JWTs, refresh tokens, API keys, full request bodies of auth endpoints.
- Every log line in a request-handling context includes a correlation/trace ID (propagated via a request header, e.g. `X-Correlation-Id`, generated at the Gateway if absent) so a single request can be traced across services.

## 7. Validation

- Jakarta Bean Validation annotations on every request DTO field per `SECURITY.md` §6. No manual `if (field == null) throw ...` validation in service methods for concerns that Bean Validation already covers.

## 8. Migrations

- Flyway (Assumption A-40, chosen over Liquibase for simplicity/SQL-native migrations). Migration files: `src/main/resources/db/migration/V{n}__{description}.sql`, sequential, never edited after being merged to `main` (a mistake is fixed by a new migration, not by rewriting history).
- `spring.jpa.hibernate.ddl-auto`: `validate` in `test`/`prod`, `update` permitted only in `dev` for rapid local iteration (never in `test`/`prod` — `DATABASE_SCHEMA.md` §8).

## 9. Testing Conventions

- Testcontainers for MySQL in integration tests — H2 is prohibited (`TESTING.md` §4).
- Test class naming: `{ClassUnderTest}Test` (unit), `{ClassUnderTest}IT` (integration, so Surefire/Failsafe can separate the two phases in the build).

## 10. Resilience4j

- Every OpenFeign client (inter-service or external-API) must declare a `@CircuitBreaker` and, where retryable, a `@Retry` annotation, with a named fallback method — never an unguarded synchronous call to another service or an external API.

## 11. Git Hygiene (supports CONTRIBUTING.md)

- `.gitignore` excludes: `.env`, `target/`, `build/`, `*.log`, IDE folders (`.idea/`, `.vscode/`), and any file matching `*secret`* or `*credentials*` outside of `.env.example`.
- No commented-out dead code merged to `main`.
- No `System.out.println` — use the logger.

## 12. No Speculative Generality

Do not add configuration options, interfaces, abstract classes, or extension points for requirements that are not in `PROJECT_REQUIREMENTS.md` §2 (in-scope) — this includes the explicitly out-of-scope items in §4. `ARCHITECTURE.md` §7 defines the specific, limited extensibility points that ARE required; anything beyond that is over-engineering for this phase and must not be built.